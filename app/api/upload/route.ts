import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseFile } from "@/lib/parser";
import { normalizeTransactions, detectDuplicates, detectTransfers } from "@/lib/cleaner";
import { categorizeAll, getCategoryCounts } from "@/lib/categorizer";
import { annotateAnomalies } from "@/lib/anomalyDetector";
import { calculateSummary } from "@/lib/calculator";
import { buildForecast } from "@/lib/forecast";
import { Storage } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const HOMEPAGE_PREVIEW_COUNT = 12;

export async function POST(req: NextRequest) {
    try {
        // ── Parse multipart ────────────────────────────────────────────────────
        let formData: FormData;
        try { formData = await req.formData(); }
        catch { return NextResponse.json({ error: "Invalid form data. Send as multipart/form-data." }, { status: 400 }); }

        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "No file provided. Include a 'file' field." }, { status: 400 });

        const filename = file.name ?? "upload";
        const ext = filename.split(".").pop()?.toLowerCase();
        const isExcel = ["xlsx", "xls"].includes(ext ?? "");

        if (!["csv", "json", "xlsx", "xls"].includes(ext ?? "")) {
            return NextResponse.json({ error: "Unsupported file type. Upload .csv, .json, or .xlsx" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 413 });
        }

        // ── Read content ───────────────────────────────────────────────────────
        let content: string | ArrayBuffer;
        try {
            if (isExcel) {
                content = await file.arrayBuffer();
            } else {
                content = await file.text();
            }
        } catch {
            return NextResponse.json({ error: "Could not read file content." }, { status: 400 });
        }

        // ── Parse raw rows ─────────────────────────────────────────────────────
        let rawRows;
        try {
            rawRows = parseFile(content, filename);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Parse failed.";
            return NextResponse.json({ error: msg }, { status: 422 });
        }

        if (rawRows.length === 0) {
            return NextResponse.json({ error: "No rows found. Check file has headers and data rows." }, { status: 422 });
        }

        // ── Normalize (column aliasing + date/amount parsing) ──────────────────
        const accountLabel = (formData.get("account") as string) || "default";
        const { transactions: normalized, errors } = normalizeTransactions(rawRows, accountLabel);

        if (normalized.length === 0) {
            return NextResponse.json({
                error: "Could not parse any transactions. Ensure your file has date, description, and amount columns.",
                parseErrors: errors,
            }, { status: 422 });
        }

        // ── Deduplicate + remove internal transfers ────────────────────────────
        const deduped = detectDuplicates(normalized);
        const duplicatesRemoved = normalized.length - deduped.length;

        const withoutTransfers = detectTransfers(deduped);
        const transfersRemoved = deduped.length - withoutTransfers.length;

        const totalDuplicatesRemoved = duplicatesRemoved + transfersRemoved;

        // ── Categorize (sets .type and .category on each tx) ──────────────────
        const categorized = categorizeAll(withoutTransfers);

        // ── Anomaly detection (needs ≥3 tx per category) ──────────────────────
        const annotated = annotateAnomalies(categorized);

        // ── Finance calculations ───────────────────────────────────────────────
        const sessionId = randomUUID();
        const summary = calculateSummary(annotated);
        const categoryCounts = getCategoryCounts(annotated);

        const dates = annotated.map((t) => t.date).sort();
        const uploadMeta = {
            transactionCount: annotated.length,
            imported: annotated.length,
            duplicatesRemoved: totalDuplicatesRemoved,
            dateRange: { from: dates[0], to: dates[dates.length - 1] },
            categories: categoryCounts,
        };

        const forecast = buildForecast(annotated, summary.currentBalance);

        // ── Persist to Cloud Storage (Redis) ──────────────────────────────────
        await Storage.set(sessionId, {
            transactions: annotated,
            summary,
            uploadMeta,
            forecast,
        });

        return NextResponse.json({
            sessionId,
            summary: { ...summary, sessionId },
            transactions: annotated.slice(0, HOMEPAGE_PREVIEW_COUNT),
            uploadMeta,
            forecast,
        }, { status: 200 });

    } catch (err: unknown) {
        const errorBody = err instanceof Error ? {
            message: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        } : { message: String(err) };

        console.error("❌ [CRITICAL API ERROR] POST /api/upload:", errorBody);

        return NextResponse.json({
            error: "The server encountered a problem while processing your file.",
            details: errorBody.message
        }, { status: 500 });
    }
}
