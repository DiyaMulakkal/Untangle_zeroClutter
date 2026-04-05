"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ForecastContent() {
    const router = useRouter();
    const params = useSearchParams();
    const sessionId = params.get("sessionId");
    const [summary, setSummary] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError("Missing session. Please upload a statement first.");
            return;
        }

        fetch(`/api/summary?sessionId=${sessionId}`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Could not load forecast.");
                }
                return data;
            })
            .then((data) => {
                setSummary(data);
                setError(null);
            })
            .catch((err: unknown) => {
                setSummary(null);
                setError(err instanceof Error ? err.message : "Could not load forecast.");
            });
    }, [sessionId]);

    const safeDailySpend = Number(summary?.safeToSpendPerDay ?? 0);
    const currentBalance = Number(summary?.currentBalance ?? 0);
    const committedExpenses = Number(summary?.committedExpenses ?? 0);
    const runwayDays = Number(summary?.runwayDays ?? 0);

    const days = Array.from({ length: 30 }, (_, index) => {
        const day = index + 1;
        const remaining = Math.max(0, currentBalance - safeDailySpend * day);
        return { day, remaining };
    });

    return (
        <main style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
            <h2 style={{ marginBottom: "20px", opacity: "0.5" }}>Untangle</h2>
            <button
                className="btn-ghost"
                style={{ marginBottom: "20px" }}
                onClick={() => router.push("/")}
            >
                Back to home
            </button>
            <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>Future prediction</h1>
            <p style={{ color: "#6b7280", marginTop: "10px", marginBottom: "30px" }}>
                A simple 30-day view based on your current balance and safe daily spend.
            </p>

            {error && <p style={{ color: "#dc2626" }}>{error}</p>}

            {summary && (
                <>
                    <div className="summary-container">
                        <div className="summary-item">
                            <p className="label">safe spend / day</p>
                            <p className="value">₹{safeDailySpend}</p>
                            <p className="sub">recommended</p>
                        </div>
                        <div className="summary-item">
                            <p className="label">runway</p>
                            <p className="value">{runwayDays} days</p>
                            <p className="sub">at current burn</p>
                        </div>
                        <div className="summary-item">
                            <p className="label">committed expenses</p>
                            <p className="value">₹{committedExpenses}</p>
                            <p className="sub">monthly estimate</p>
                        </div>
                    </div>

                    <table width="100%" style={{ marginTop: "24px" }}>
                        <thead>
                            <tr>
                                <th align="left">DAY</th>
                                <th align="right">PROJECTED REMAINING BALANCE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((entry) => (
                                <tr key={entry.day}>
                                    <td>{entry.day}</td>
                                    <td align="right">₹{entry.remaining.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </main>
    );
}

export default function ForecastPage() {
    return (
        <Suspense fallback={<div style={{ padding: "40px" }}>Loading...</div>}>
            <ForecastContent />
        </Suspense>
    );
}
