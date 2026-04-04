"use client";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import SummaryGrid from "@/components/SummaryGrid";
import { Summary, UploadResponse } from "@/lib/types";

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
    const [state, setState] = useState<AppState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [uploadMeta, setUploadMeta] = useState<UploadResponse | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);

    async function handleUpload(file: File) {
        setState("loading");
        setError(null);
        setSummary(null);
        setUploadMeta(null);

        try {
            // Step 1: Upload and process
            const form = new FormData();
            form.append("file", file);

            const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
            const uploadData: UploadResponse & { error?: string } = await uploadRes.json();

            if (!uploadRes.ok || uploadData.error) {
                throw new Error(uploadData.error ?? "Upload failed.");
            }

            setUploadMeta(uploadData);

            // Step 2: Fetch summary
            const summaryRes = await fetch(`/api/summary?sessionId=${uploadData.sessionId}`);
            const summaryData: Summary & { error?: string } = await summaryRes.json();

            if (!summaryRes.ok || summaryData.error) {
                throw new Error(summaryData.error ?? "Failed to fetch summary.");
            }

            setSummary(summaryData);
            setState("done");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong.";
            setError(msg);
            setState("error");
        }
    }

    function reset() {
        setState("idle");
        setError(null);
        setSummary(null);
        setUploadMeta(null);
    }

    return (
        <div
            style={{
                maxWidth: "640px",
                margin: "0 auto",
                padding: "2.5rem 1.25rem 4rem",
                minHeight: "100vh",
            }}
        >
            {/* ── Header ─────────────────────────────────────────────── */}
            <header style={{ marginBottom: "2.5rem" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.4rem",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "var(--green)",
                            animation: "blink 2s ease-in-out infinite",
                        }}
                    />
                    <span
                        style={{
                            fontSize: "10px",
                            letterSpacing: "0.2em",
                            color: "var(--text-muted)",
                        }}
                    >
                        FINANCIAL FORECASTER v1.0
                    </span>
                </div>
                <h1
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.6rem, 5vw, 2.25rem)",
                        fontWeight: 800,
                        color: "var(--text)",
                        lineHeight: 1.1,
                        marginBottom: "0.5rem",
                    }}
                >
                    Zero-Clutter
                    <br />
                    <span style={{ color: "var(--green)" }}>Financial Clarity.</span>
                </h1>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "12px",
                        maxWidth: "400px",
                        lineHeight: 1.7,
                    }}
                >
                    Upload a messy bank CSV or JSON. Get your balance, runway, and safe
                    daily spend — instantly.
                </p>
            </header>

            {/* ── Main content ───────────────────────────────────────── */}
            {state !== "done" && (
                <section>
                    <FileUpload onUpload={handleUpload} loading={state === "loading"} />

                    {/* Sample file hint */}
                    {state === "idle" && (
                        <p
                            style={{
                                textAlign: "center",
                                marginTop: "1rem",
                                color: "var(--text-dim)",
                                fontSize: "11px",
                            }}
                        >
                            Need a test file?{" "}
                            <a
                                href="/sample.csv"
                                download
                                style={{
                                    color: "var(--text-muted)",
                                    textDecoration: "underline",
                                    textDecorationColor: "var(--border)",
                                }}
                            >
                                Download sample.csv
                            </a>
                        </p>
                    )}

                    {/* Error state */}
                    {state === "error" && error && (
                        <div
                            style={{
                                marginTop: "1rem",
                                border: "1px solid var(--red)",
                                borderRadius: "var(--radius-lg)",
                                padding: "0.75rem 1rem",
                                background: "var(--red-dim)",
                            }}
                        >
                            <p
                                style={{
                                    color: "var(--red)",
                                    fontSize: "11px",
                                    letterSpacing: "0.08em",
                                    marginBottom: "0.25rem",
                                }}
                            >
                                ERROR
                            </p>
                            <p style={{ color: "var(--text)", fontSize: "12px" }}>{error}</p>
                            <button
                                onClick={reset}
                                style={{
                                    marginTop: "0.75rem",
                                    background: "none",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-muted)",
                                    fontSize: "10px",
                                    letterSpacing: "0.1em",
                                    padding: "4px 12px",
                                    cursor: "pointer",
                                    borderRadius: "var(--radius)",
                                }}
                            >
                                TRY AGAIN
                            </button>
                        </div>
                    )}
                </section>
            )}

            {/* ── Results ────────────────────────────────────────────── */}
            {state === "done" && summary && uploadMeta && (
                <section>
                    <SummaryGrid
                        summary={summary}
                        dateRange={uploadMeta.dateRange}
                        transactionCount={uploadMeta.transactionCount}
                    />

                    <button
                        onClick={reset}
                        style={{
                            marginTop: "2.5rem",
                            display: "block",
                            background: "none",
                            border: "none",
                            color: "var(--text-dim)",
                            fontSize: "11px",
                            letterSpacing: "0.1em",
                            cursor: "pointer",
                            padding: 0,
                        }}
                    >
                        ← UPLOAD ANOTHER FILE
                    </button>
                </section>
            )}

            {/* ── Footer ─────────────────────────────────────────────── */}
            <footer
                style={{
                    marginTop: "4rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                }}
            >
                <span style={{ color: "var(--text-dim)", fontSize: "10px", letterSpacing: "0.1em" }}>
                    FINANCIAL FORECASTER
                </span>
                <span style={{ color: "var(--text-dim)", fontSize: "10px" }}>
                    Data never leaves your session · No DB · No tracking
                </span>
            </footer>
        </div>
    );
}