import { NextRequest, NextResponse } from "next/server";
import { Storage } from "../../../lib/storage";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId");

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

    return NextResponse.json(
        { sessionId, ...entry.summary },
        { status: 200 }
    );
}