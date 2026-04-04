"use client";

import { useRef, useState } from "react";

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const res = await fetch("/api/summary");
            const data = await res.json();

            setSummary(data);
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
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
                <div style={{ marginTop: "40px" }}>
                    <h1 style={{ fontSize: "50px" }}>
                        ₹{summary.daily} / day
                    </h1>

                    <p style={{ marginTop: "10px", color: "green" }}>
                        Updated just now
                    </p>

                    <div style={{ marginTop: "20px" }}>
                        <p>Total In: ₹{summary.totalIn}</p>
                        <p>Total Out: ₹{summary.totalOut}</p>
                        <p>Balance: ₹{summary.balance}</p>
                    </div>
                </div>
            )}
        </main>
    );
}