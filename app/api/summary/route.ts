import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    const data = Storage.get(sessionId);
    if (!data) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({ sessionId, ...data.summary });
}