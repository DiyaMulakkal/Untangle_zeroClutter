import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { categorize, getCategoryCounts } from "../../../lib/categorizer";
import { cleanTransactions } from "../../../lib/cleaner";
import { calculateSummary } from "../../../lib/calculator";
import { parseFile } from "../../../lib/parser";
import { Storage } from "../../../lib/storage";
import { StorageEntry, Transaction } from "../../../lib/types";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

function toStorageSummary(summary: ReturnType<typeof calculateSummary>): StorageEntry["summary"] {
    const { sessionId: _sessionId, ...rest } = summary;
    return rest;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "No file provided. Include a 'file' field." },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 20MB." },
                { status: 413 }
            );
        }

        const filename = file.name || "upload";
        const ext = filename.split(".").pop()?.toLowerCase() ?? "";
        const supportedExtensions = new Set(["csv", "json", "xlsx", "xls"]);

        if (!supportedExtensions.has(ext)) {
            return NextResponse.json(
                { error: "Unsupported file type. Upload .csv, .json, .xlsx, or .xls." },
                { status: 400 }
            );
        }

        const content =
            ext === "xlsx" || ext === "xls"
                ? await file.arrayBuffer()
                : await file.text();

        if (typeof content === "string" && !content.trim()) {
            return NextResponse.json({ error: "File is empty." }, { status: 400 });
        }

        if (content instanceof ArrayBuffer && content.byteLength === 0) {
            return NextResponse.json({ error: "File is empty." }, { status: 400 });
        }

        const rawRows = parseFile(content, filename);
        if (rawRows.length === 0) {
            return NextResponse.json(
                { error: "No rows found. Make sure your file has headers and data." },
                { status: 422 }
            );
        }

        const cleaned = cleanTransactions(rawRows) as {
            transactions: Transaction[];
            errors: number;
        };

        if (cleaned.transactions.length === 0) {
            return NextResponse.json(
                {
                    error:
                        "Could not parse any transactions. Ensure your file has date, description, and amount columns.",
                },
                { status: 422 }
            );
        }

        const categorized = cleaned.transactions.map((tx) => {
            const { type, category } = categorize(tx);
            return { ...tx, type, category };
        });

        const sessionId = randomUUID();
        const summary = calculateSummary(categorized, sessionId);
        const dates = categorized.map((tx) => tx.date).sort();
        const uploadMeta = {
            transactionCount: categorized.length,
            imported: categorized.length,
            duplicatesRemoved: cleaned.errors,
            dateRange: { from: dates[0], to: dates[dates.length - 1] },
            categories: getCategoryCounts(categorized),
        };

        Storage.set(sessionId, {
            transactions: categorized,
            summary: toStorageSummary(summary),
            uploadMeta,
        });

        return NextResponse.json({ sessionId, ...uploadMeta }, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[CRITICAL API ERROR] POST /api/upload:", message);

        return NextResponse.json(
            {
                error: "The server encountered a problem while processing your file.",
                details: message,
            },
            { status: 500 }
        );
    }
}
