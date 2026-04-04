import { NextRequest, NextResponse } from "next/server";
import { buildForecast } from "@/lib/forecast";
import { Storage } from "@/lib/storage";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing 'sessionId' query parameter." },
            { status: 400 }
        );
    }

    const entry = await Storage.get(sessionId);
    if (!entry) {
        return NextResponse.json(
            { error: "Session not found or expired. Please re-upload your file." },
            { status: 404 }
        );
    }

    return NextResponse.json(
        { sessionId, ...buildForecast(entry.transactions, entry.summary.currentBalance) },
        { status: 200 }
    );
}
