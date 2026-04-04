import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/parser";
import { cleanTransactions } from "@/lib/cleaner";
import { categorize } from "@/lib/categorizer";
import { calculateSummary } from "@/lib/calculator";
import { Storage } from "@/lib/storage";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const text = await file.text();
        const raw = parseFile(text, file.name);
        const cleaned = cleanTransactions(raw);
        const categorized = categorize(cleaned);
        const summary = calculateSummary(categorized);

        const sessionId = randomUUID();
        Storage.set(sessionId, { transactions: categorized, summary });

        const dates = categorized.map((t) => t.date).sort();
        const categoryCounts = categorized.reduce<Record<string, number>>((acc, t) => {
            acc[t.category] = (acc[t.category] ?? 0) + 1;
            return acc;
        }, {});

        return NextResponse.json({
            sessionId,
            transactionCount: categorized.length,
            dateRange: { from: dates[0], to: dates[dates.length - 1] },
            categories: categoryCounts,
        });
    } catch (err) {
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}