import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const includeTransactions = req.nextUrl.searchParams.get("includeTransactions") !== "0";
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Math.max(0, parseInt(limitParam, 10) || 0) : 0;

    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing 'sessionId' query parameter." },
            { status: 400 }
        );
    }

    const entry = Storage.get(sessionId);
    if (!entry) {
        return NextResponse.json(
            { error: "Session not found or expired. Please re-upload your file." },
            { status: 404 }
        );
    }

    const transactions = includeTransactions
        ? (limit > 0 ? entry.transactions.slice(0, limit) : entry.transactions)
        : undefined;

    return NextResponse.json(
        { sessionId, ...entry.summary, transactions },
        { status: 200 }
    );
}
