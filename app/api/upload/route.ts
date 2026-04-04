import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseFile } from "../../../lib/parser";
import { cleanTransactions } from "../../../lib/cleaner";
import { categorize, getCategoryCounts } from "../../../lib/categorizer";
import { calculateSummary } from "../../../lib/calculator";
import { Storage } from "../../../lib/storage";
import { Transaction } from "../../../lib/types";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const HOMEPAGE_PREVIEW_COUNT = 12;

export async function POST(req: NextRequest) {
    try {
        // ── Parse multipart ────────────────────────────────────────────────────
        let formData: FormData;
        try { formData = await req.formData(); }
        catch { return NextResponse.json({ error: "Invalid form data. Send as multipart/form-data." }, { status: 400 }); }

        const file = formData.get("file") as File | null;
        console.log("FILE RECEIVED:", file);
        if (!file) return NextResponse.json({ error: "No file provided. Include a 'file' field." }, { status: 400 });

        const filename = file.name ?? "upload";
        const ext = filename.split(".").pop()?.toLowerCase();
        const isExcel = ["xlsx", "xls"].includes(ext ?? "");

        if (!["csv", "json", "xlsx", "xls"].includes(ext ?? "")) {
            return NextResponse.json({ error: "Unsupported file type. Upload .csv, .json, or .xlsx" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ error: "File too large. Maximum size is 20MB." }, { status: 413 });
        }

        // ── Read content ───────────────────────────────────────────────────────
        let content: string | ArrayBuffer;
        try {
            if (isExcel) {
                content = await file.arrayBuffer();
                console.log("CONTENT TYPE:", typeof content);
                console.log("CONTENT SAMPLE:", content?.slice(0, 100));
            } else {
                content = typeof file.text === "function"
                    ? await file.text()
                    : "";
            }
        } catch {
            return NextResponse.json({ error: "Could not read file content." }, { status: 400 });
        }

        if (typeof content !== "string" || !content.trim()) {
            return NextResponse.json({ error: "File is empty." }, { status: 400 });
        }

        // --- Parse → Clean → Categorize → Calculate ---
        const raw = parseFile(content, filename);
        if (raw.length === 0) {
            return NextResponse.json(
                { error: "No rows found. Make sure your file has headers and data." },
                { status: 422 }
            );
        }

        const { transactions, errors } = cleanTransactions(raw) as {
            transactions: Transaction[];
            errors: number;
        };
        if (transactions.length === 0) {
            return NextResponse.json(
                {
                    error:
                        "Could not parse any transactions. Ensure your file has date, description, and amount columns.",
                },
                { status: 422 }
            );
        }

        const categorized = transactions.map((tx) => {
            const { type, category } = categorize(tx);

            return {
                ...tx,
                type,
                category,
            };
        });
        const sessionId = randomUUID();
        const summary = calculateSummary(categorized, sessionId);
        const categoryCounts = getCategoryCounts(categorized);

        const dates = categorized.map((t) => t.date).sort();
        const uploadMeta = {
            transactionCount: categorized.length,
            imported: categorized.length,
            duplicatesRemoved: errors,
            dateRange: { from: dates[0], to: dates[dates.length - 1] },
            categories: categoryCounts,
        };

        // const forecast = buildForecast(categorized, summary.currentBalance);

        // // ── Persist to Cloud Storage (Redis) ──────────────────────────────────
        // await Storage.set(sessionId, {
        //     transactions: categorized,
        //     summary,
        //     uploadMeta,
        //     forecast,
        // });

        return NextResponse.json({ sessionId, ...uploadMeta }, { status: 200 });
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
