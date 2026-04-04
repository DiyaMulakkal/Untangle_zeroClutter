"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisSnapshot, Summary, Transaction } from "@/lib/types";
import { clearAnalysis, loadAnalysis, saveAnalysis } from "@/lib/clientAnalysis";

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(true);
    const [statusText, setStatusText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    function formatCurrency(value: number, fractionDigits = 0) {
        return value.toLocaleString("en-IN", {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        });
    }

    function formatCompactCurrency(value: number) {
        const absolute = Math.abs(value);
        const sign = value < 0 ? "-" : value > 0 ? "+" : "";

        if (absolute >= 10000000) {
            return `${sign}Rs ${(absolute / 10000000).toFixed(2)} Cr`;
        }

        if (absolute >= 100000) {
            return `${sign}Rs ${(absolute / 100000).toFixed(2)} L`;
        }

        if (absolute >= 1000) {
            return `${sign}Rs ${(absolute / 1000).toFixed(1)} K`;
        }

        return `${sign}Rs ${formatCurrency(absolute)}`;
    }

    useEffect(() => {
        async function restoreSession() {
            try {
                const snapshot = await loadAnalysis();
                if (!snapshot) {
                    return;
                }

                setSessionId(snapshot.sessionId);
                setSummary(snapshot.summary);
                setTransactions(snapshot.transactions.slice(0, 12));
            } catch {
                // Leave the upload screen visible if restore fails.
            } finally {
                setRestoring(false);
            }
        }

        restoreSession();
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setStatusText("Uploading file...");

        try {
            const form = new FormData();
            form.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: form
            });
            const uploadData: (AnalysisSnapshot & { error?: string }) = await uploadRes.json();

            if (!uploadRes.ok || uploadData.error) {
                throw new Error(uploadData.error ?? "Upload failed.");
            }

            setStatusText("Preparing your dashboard...");
            await saveAnalysis(uploadData);

            setSessionId(uploadData.sessionId);
            setSummary(uploadData.summary);
            setTransactions(uploadData.transactions.slice(0, 12));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setStatusText(null);
        }
    };

    return (
        <main
            style={{
                maxWidth: "640px",
                margin: "0 auto",
                padding: "2.5rem 1.25rem 4rem",
                minHeight: "100vh",
            }}
        >
            <header style={{ marginBottom: "2.5rem" }}>
                <h1
                    style={{
                        fontSize: "clamp(1.6rem, 5vw, 2.25rem)",
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: "0.5rem",
                    }}
                >
                    Zero-Clutter
                    <br />
                    <span style={{ color: "var(--green)" }}>Financial Clarity.</span>
                </h1>
                <p style={{ color: "#6b7280", fontSize: "12px", maxWidth: "400px" }}>
                    Upload a messy bank CSV or JSON. Get your balance, runway, and safe
                    daily spend instantly.
                </p>
            </header>

            <div
                className={`upload-box ${loading ? "upload-box-loading" : ""}`}
                onClick={() => !loading && handleClick()}
                style={{ cursor: loading ? "progress" : "pointer" }}
            >
                {loading ? (
                    <>
                        <div className="loader-dots" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                        <h3>{statusText ?? "Processing file..."}</h3>
                        <p style={{ color: "#6b7280" }}>This can take a little longer for large Excel files.</p>
                    </>
                ) : (
                    <>
                        <h3>Drop transaction file here</h3>
                        <p style={{ color: "#6b7280" }}>CSV, JSON, XLSX, or XLS</p>
                    </>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {restoring && <p style={{ marginTop: "20px", color: "#6b7280" }}>Restoring your last analysis...</p>}
            {loading && <p style={{ marginTop: "20px", color: "#6b7280" }}>{statusText ?? "Processing..."}</p>}
            {error && <p style={{ marginTop: "20px", color: "red" }}>Error: {error}</p>}

            {summary && (
                <>
                    <h5 style={{ color: "#6b7280", marginTop: "40px", fontSize: "16px", opacity: "0.4" }}>30-day Runway</h5>
                    <h1 style={{ fontSize: "50px", marginTop: "10px" }}>
                        Rs {formatCurrency(summary.safeToSpendPerDay)} <span style={{ color: "#6b7280", marginTop: "10px", fontSize: "16px", fontWeight: "400" }}>/ day safe-to-spend</span>
                    </h1>
                    <h5 style={{ color: "#6b7280", marginTop: "10px", fontWeight: "400" }}>Next 30 days. Updated now.</h5>
                    {summary.warning && (
                        <p style={{ marginTop: "8px", color: "#b42318" }}>{summary.warning}</p>
                    )}

                    <div className="summary-container">
                        <div className="summary-item">
                            <p className="label">total out</p>
                            <p className="value red summary-value">{formatCompactCurrency(-summary.totalExpenses)}</p>
                            <p className="sub summary-full-value">Rs {formatCurrency(summary.totalExpenses)}</p>
                            <p className="sub">this period</p>
                        </div>

                        <div className="summary-item">
                            <p className="label">total in</p>
                            <p className="value green summary-value">{formatCompactCurrency(summary.totalIncome)}</p>
                            <p className="sub summary-full-value">Rs {formatCurrency(summary.totalIncome)}</p>
                            <p className="sub">this period</p>
                        </div>

                        <div className="summary-item">
                            <p className="label">balance</p>
                            <p className="value summary-value">{formatCompactCurrency(summary.currentBalance)}</p>
                            <p className="sub summary-full-value">Rs {formatCurrency(summary.currentBalance)}</p>
                            <p className="sub">available</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
                        <button
                            className="btn-ghost"
                            disabled={!sessionId || loading}
                            onClick={() => sessionId && router.push(`/transactions?sessionId=${sessionId}`)}
                        >
                            View transactions
                        </button>
                        <button
                            className="btn-ghost"
                            disabled={!sessionId || loading}
                            onClick={() => sessionId && router.push(`/forecast?sessionId=${sessionId}`)}
                        >
                            Future prediction
                        </button>
                        <button
                            className="btn-ghost"
                            disabled={loading}
                            onClick={async () => {
                                await clearAnalysis();
                                setSessionId(null);
                                setSummary(null);
                                setTransactions(null);
                                setError(null);
                            }}
                        >
                            Clear analysis
                        </button>
                    </div>

                    <h2 style={{ marginTop: "50px" }}>RECENT TRANSACTIONS</h2>
                    <p style={{ color: "#6b7280", marginTop: "6px", marginBottom: "12px" }}>
                        Showing a preview here for speed. Open the transactions page for the full list.
                    </p>

                    <table style={{ width: "100%", marginTop: "20px" }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {transactions?.map((transaction, index) => (
                                <tr key={`${transaction.date}-${transaction.description}-${index}`}>
                                    <td>{transaction.date}</td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.category}</td>
                                    <td className={transaction.amount < 0 ? "amount-negative" : "amount-positive"}>
                                        Rs {Math.abs(transaction.amount).toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </main>
    );
}
