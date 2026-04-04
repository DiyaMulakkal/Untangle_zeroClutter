"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [summary, setSummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);

        // ⛔ skip backend for now

        // ✅ FAKE DATA (simulate AI output)
        const fakeData = {
            summary: {
                daily: 6633,
                balance: 200000,
                totalIn: 250000,
                totalOut: 50000,
                committed: 0,
                available: 200000,
            },
            transactions: [
                {
                    date: "Mar 05, 2019",
                    description: "MICRO ATM GST DATED 02031",
                    category: "CASH WITHDRAWAL",
                    amount: -5,
                    type: "debit",
                },
                {
                    date: "Mar 05, 2019",
                    description: "BEAT CSH PKP DEL GURGA 80",
                    category: "FOOD & DINING",
                    amount: -500,
                    type: "debit",
                },
                {
                    date: "Mar 05, 2019",
                    description: "AEPS INCOME",
                    category: "OTHER",
                    amount: 1000,
                    type: "credit",
                },
            ],
        };

        // simulate delay (feels real)
        setTimeout(() => {
            setSummary(fakeData.summary);
            setTransactions(fakeData.transactions);
            setLoading(false);
        }, 1000);
    };

    return (
        <main style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>

            <h2 style={{ marginBottom: "20px" }}>Untangle</h2>

            <p style={{ color: "#6b7280" }}>ZERO-CLUTTER FINANCIAL FORECASTER</p>

            <h1 style={{ fontSize: "60px", fontWeight: 800, lineHeight: 1.1 }}>
                Know your <br />
                <span style={{ fontStyle: "italic", fontWeight: 400 }}>exact</span> runway. <br />
                Nothing else.
            </h1>

            <p style={{ color: "#6b7280", marginTop: "10px" }}>
                Drop messy bank data. Get your safe-to-spend daily limit for the next 30 days.
            </p>

            <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
                <button onClick={handleClick} className="btn-primary">
                    Upload CSV
                </button>

                <button className="btn-outline">
                    See how it works
                </button>
            </div>

            <div
                onClick={handleClick}
                style={{
                    marginTop: "50px",
                    border: "2px dashed #e5e7eb",
                    padding: "60px",
                    textAlign: "center",
                    borderRadius: "10px",
                    cursor: "pointer",
                }}
            >
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

            {summary && (
                <>
                    {/* DASHBOARD */}
                    <h5 style={{ color: "#6b7280", marginTop: "40px", fontSize: "16px", opacity: "0.4" }}>30-day Runway</h5>
                    <h1 style={{ fontSize: "50px", marginTop: "10px" }}>
                        ₹{summary.daily} <span style={{ color: "#6b7280", marginTop: "10px", fontSize: "16px", fontWeight: "400" }}>/ day safe-to-spend</span>
                    </h1>
                    <h5 style={{ color: "#6b7280", marginTop: "10px", fontWeight: "400" }}>Next 30 days. Updated Now.</h5>

                    <div className="summary-container">

                        <div className="summary-item">
                            <p className="label">total out</p>
                            <p className="value red">-₹{summary.totalOut}</p>
                            <p className="sub">this period</p>
                        </div>

                        <div className="summary-item">
                            <p className="label">total in</p>
                            <p className="value green">+₹{summary.totalIn}</p>
                            <p className="sub">this period</p>
                        </div>

                        <div className="summary-item">
                            <p className="label">balance</p>
                            <p className="value">₹{summary.balance}</p>
                            <p className="sub">available</p>
                        </div>

                    </div>

                    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

                        <button
                            className="btn-ghost"
                            onClick={() => router.push("/transactions")}
                        >
                            View transactions
                        </button>

                        <button className="btn-ghost">
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
                            {transactions.map((t, i) => (
                                <tr key={i}>
                                    <td>{t.date}</td>
                                    <td>{t.description}</td>
                                    <td>{t.category}</td>
                                    <td>₹{Math.abs(t.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </main>
    );
}