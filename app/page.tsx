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

        //setLoading(true);

        // try {
        //     const formData = new FormData();
        //     formData.append("file", file);

        //     // 1. Upload file
        //     const uploadRes = await fetch("/api/upload", {
        //         method: "POST",
        //         body: formData,
        //     });

        //     const uploadData = await uploadRes.json();
        //     localStorage.setItem("sessionId", uploadData.sessionId);
        //     const sessionId = uploadData.sessionId;


        //     // 2. Fetch summary
        //     // const summaryRes = await fetch(`/api/summary?sessionId=${sessionId}`);
        //     //const summaryData = await summaryRes.json();

        //     // 3. Store
        //     setSummary(summaryData.summary);
        //     setTransactions(summaryData.transactions);

        //     // 🔥 IMPORTANT: store sessionId


        // } catch (err) {
        //     console.error(err);
        // }

        //setLoading(false);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        console.log("UPLOAD DATA:", data);

        // ✅ USE DATA DIRECTLY
        setSummary(data.summary);
        setTransactions(data.transactions);
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
                            onClick={() => {
                                const sessionId = localStorage.getItem("sessionId");
                                router.push(`/transactions?sessionId=${sessionId}`);
                            }}
                        >
                            View transactions
                        </button>

                        <button className="btn-ghost">
                            Future prediction
                        </button>

                    </div>
                </>
            )}
        </main>
    );
};