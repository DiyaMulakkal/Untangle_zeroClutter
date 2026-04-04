"use client";

import { useEffect, useState } from "react";
import { Forecast } from "@/lib/types";

type ForecastResponse = Forecast & {
    sessionId: string;
    error?: string;
};

export default function ForecastPage() {
    const [forecast, setForecast] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId =
            searchParams.get("sessionId") ||
            window.localStorage.getItem("zeroClutterSessionId");

        if (!sessionId) {
            setError("No uploaded session found. Please upload a file first.");
            setLoading(false);
            return;
        }

        async function loadForecast() {
            try {
                const response = await fetch(`/api/forecast?sessionId=${sessionId}`);
                const data: ForecastResponse = await response.json();

                if (!response.ok || data.error) {
                    throw new Error(data.error ?? "Failed to load forecast.");
                }

                setForecast(data);
            } catch (err: any) {
                setError(err.message ?? "Failed to load forecast.");
            } finally {
                setLoading(false);
            }
        }

        loadForecast();
    }, []);

    return (
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 20px" }}>
            <h1 style={{ fontSize: "40px", marginBottom: "12px" }}>Future prediction</h1>
            <p style={{ color: "#6b7280", marginBottom: "32px" }}>
                Projected safe daily spending over the next 30 days based on the uploaded statement.
            </p>

            {loading && <p>Loading forecast...</p>}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}

            {forecast && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                        <Metric label="Current balance" value={`Rs ${forecast.currentBalance.toFixed(2)}`} />
                        <Metric label="Committed expenses" value={`Rs ${forecast.committedExpenses.toFixed(2)}`} />
                        <Metric label="Available to spend" value={`Rs ${forecast.availableForSpend.toFixed(2)}`} />
                        <Metric label="Safe daily spend" value={`Rs ${forecast.safeDailySpend.toFixed(2)}`} />
                    </div>

                    {forecast.warning && (
                        <p style={{ color: "#b42318", marginBottom: "20px" }}>{forecast.warning}</p>
                    )}

                    <table width="100%">
                        <thead>
                            <tr>
                                <th align="left">DAY</th>
                                <th align="left">DATE</th>
                                <th align="right">SAFE TO SPEND</th>
                                <th align="right">CUMULATIVE SPENT</th>
                                <th align="right">REMAINING BALANCE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecast.days.map((day) => (
                                <tr key={day.day}>
                                    <td>{day.day}</td>
                                    <td>{day.date}</td>
                                    <td align="right">Rs {day.safeToSpend.toFixed(2)}</td>
                                    <td align="right">Rs {day.cumulativeSpent.toFixed(2)}</td>
                                    <td align="right">Rs {day.remainingBalance.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </main>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px" }}>
            <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase" }}>{label}</p>
            <p style={{ fontSize: "24px", fontWeight: 700 }}>{value}</p>
        </div>
    );
}
