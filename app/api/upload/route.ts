import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseFile } from "../../../lib/parser";
import { normalizeTransactions } from "../../../lib/cleaner";
import { categorize, getCategoryCounts } from "../../../lib/categorizer";
import { calculateSummary } from "../../../lib/calculator";
import { Storage } from "../../../lib/storage";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        // --- Parse multipart form ---
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return NextResponse.json(
                { error: "Invalid form data. Send as multipart/form-data." },
                { status: 400 }
            );
        }

        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "No file provided. Include a 'file' field." }, { status: 400 });
        }

        // --- Validate file type ---
        const filename = file.name ?? "upload";
        const ext = filename.split(".").pop()?.toLowerCase();
        if (!["csv", "json"].includes(ext ?? "")) {
            return NextResponse.json(
                { error: "Unsupported file type. Upload a .csv or .json file." },
                { status: 400 }
            );
        }

        // --- Validate file size ---
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.` },
                { status: 413 }
            );
        }

        // --- Read file content ---
        let content: string;
        try {
            content = await file.text();
        } catch {
            return NextResponse.json({ error: "Could not read file content." }, { status: 400 });
        }

        if (!content.trim()) {
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

        const cleaned = normalizeTransactions(raw);
        if (cleaned.length === 0) {
            return NextResponse.json(
                {
                    error:
                        "Could not parse any transactions. Ensure your file has date, description, and amount columns.",
                },
                { status: 422 }
            );
        }

        const categorized = categorize(cleaned);
        const sessionId = randomUUID();
        const summary = calculateSummary(categorized, sessionId);
        const categoryCounts = getCategoryCounts(categorized);

        const dates = categorized.map((t) => t.date).sort();
        const uploadMeta = {
            transactionCount: categorized.length,
            dateRange: { from: dates[0], to: dates[dates.length - 1] },
            categories: categoryCounts,
        };

        Storage.set(sessionId, { transactions: categorized, summary, uploadMeta });

        return NextResponse.json(
            {
                sessionId,
                summary,
                ...uploadMeta,
            },
            { status: 200 }
        );
    } catch (err: unknown) {
        console.error("[/api/upload] Unhandled error:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}