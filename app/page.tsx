"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Summary, Transaction, UploadResponse } from "@/lib/types";

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const form = new FormData();
            form.append("file", file);

            const uploadRes = await fetch("/api/upload", { 
                method: "POST", 
                body: form 
            });
            const uploadData: UploadResponse & { error?: string } = await uploadRes.json();

            if (!uploadRes.ok || uploadData.error) {
                throw new Error(uploadData.error ?? "Upload failed.");
            }

            const summaryRes = await fetch(`/api/summary?sessionId=${uploadData.sessionId}`);
            const summaryData: Summary & { error?: string } = await summaryRes.json();

            if (!summaryRes.ok || summaryData.error) {
                throw new Error(summaryData.error ?? "Failed to fetch summary.");
            }

            setSessionId(uploadData.sessionId);
            if (typeof window !== "undefined") {
                window.localStorage.setItem("zeroClutterSessionId", uploadData.sessionId);
            }

            setSummary(summaryData as Summary);
            setTransactions(((summaryData as Summary & { transactions?: Transaction[] }).transactions) || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
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
            {/* Header */}
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
                    daily spend — instantly.
                </p>
            </header>

            <div className="upload-box" onClick={handleClick} style={{ cursor: "pointer" }}>
                <h3>Drop transaction file here</h3>
                <p style={{ color: "#6b7280" }}>CSV or JSON</p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {loading && <p style={{ marginTop: "20px" }}>Processing...</p>}
            {error && <p style={{ marginTop: "20px", color: "red" }}>Error: {error}</p>}

            {summary && (
                <>
                    {/* DASHBOARD */}
                    <h5 style={{ color: "#6b7280", marginTop: "40px", fontSize: "16px", opacity: "0.4" }}>30-day Runway</h5>
                    <h1 style={{ fontSize: "50px", marginTop: "10px" }}>
                        ₹{summary.avgDailySpend.toFixed(0)} <span style={{ color: "#6b7280", marginTop: "10px", fontSize: "16px", fontWeight: "400" }}>/ day safe-to-spend</span>
                    </h1>
                    <h5 style={{ color: "#6b7280", marginTop: "10px", fontWeight: "400" }}>Next 30 days. Updated Now.</h5>

                    <div className="summary-container">
                        <div className="summary-item">
                            <p className="label">total out</p>
                            <p className="value red">-₹{summary.totalExpenses.toFixed(0)}</p>
                            <p className="sub">this period</p>
                        </div>

                        <div className="summary-item">
                            <p className="label">total in</p>
                            <p className="value green">+₹{summary.totalIncome.toFixed(0)}</p>
                            <p className="sub">this period</p>
                        </div>

                        <div className="summary-item">
                            <p className="label">balance</p>
                            <p className="value">₹{summary.currentBalance.toFixed(0)}</p>
                            <p className="sub">available</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                        <button
                            className="btn-ghost"
                            onClick={() => sessionId && router.push(`/transactions?sessionId=${sessionId}`)}
                        >
                            View transactions
                        </button>
                        <button
                            className="btn-ghost"
                            onClick={() => sessionId && router.push(`/forecast?sessionId=${sessionId}`)}
                        >
                            Future prediction
                        </button>
                    </div>

                    {/* TRANSACTIONS */}
                    <h2 style={{ marginTop: "50px" }}>TRANSACTIONS</h2>

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
                            {transactions?.map((t, i) => (
                                <tr key={i}>
                                    <td>{t.date}</td>
                                    <td>{t.description}</td>
                                    <td>{t.category}</td>
                                    <td className={t.amount < 0 ? "amount-negative" : "amount-positive"}>
                                        ₹{Math.abs(t.amount).toFixed(2)}
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
