"use client";

import { useState } from "react";

export default function TransactionsPage() {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("All");
    const [category, setCategory] = useState("All");

    const transactions = [
        { date: "Mar 05, 2019", desc: "Indiaforensic RUP SETT 050319-2C", category: "OTHER", amount: -5 },
        { date: "Mar 05, 2019", desc: "MICRO ATM INC DATED 05031", category: "CASH WITHDRAWAL", amount: -5 },
        { date: "Mar 05, 2019", desc: "BEAT CSH PKP DEL GURGA 80", category: "FOOD & DINING", amount: -840 },
        { date: "Mar 05, 2019", desc: "Sweep Trf To: 40900036427", category: "TRANSFER", amount: -3200 },
        { date: "Mar 05, 2019", desc: "MICRO ATM GST DATED 02031", category: "CASH WITHDRAWAL", amount: -299 },
    ];

    const filtered = transactions.filter((t) => {
        const matchesSearch =
            search === "" ||
            t.desc.toLowerCase().includes(search.toLowerCase());

        const matchesType =
            type === "All" ||
            (type === "Income" && t.amount > 0) ||
            (type === "Expense" && t.amount < 0);

        const matchesCategory =
            category === "All" ||
            t.category.toLowerCase() === category.toLowerCase();

        return matchesSearch && matchesType && matchesCategory;
    });

    const totalIn = 82000;
    const totalOut = -4998;
    const net = totalIn + totalOut;

    return (
        <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
            <h2 style={{ marginBottom: "40px", opacity: "0.5" }}>Untangle</h2>

            <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>Transactions</h1>
            <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", opacity: "0.5", marginTop: "10px" }}> TYPE</label>
                <select className="dropdown" style={{ fontSize: "14px", fontWeight: "bold" }} value={type} onChange={(e) => setType(e.target.value)}>
                    <option>All</option>
                    <option>Income</option>
                    <option>Expense</option>
                </select>

                <label style={{ fontSize: "12px", opacity: "0.5", marginTop: "10px" }}>CATEGORY</label>
                <select className="dropdown" style={{ fontSize: "14px", fontWeight: "bold" }} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>All</option>
                    <option>Food & Dining</option>
                    <option>Cash Withdrawal</option>
                    <option>Transfer</option>
                    <option>Other</option>
                </select>

                <input
                    className="search-box"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <table width="100%">
                <thead>
                    <tr>
                        <th align="left">DATE</th>
                        <th align="left">DESCRIPTION</th>
                        <th align="left">CATEGORY</th>
                        <th align="right">AMOUNT</th>
                    </tr>
                </thead>

                <tbody>
                    {filtered.map((t, i) => (
                        <tr key={i}>
                            <td>{t.date}</td>
                            <td>{t.desc}</td>
                            <td>{t.category}</td>
                            <td
                                className={
                                    t.amount < 0 ? "amount-negative" : "amount-positive"
                                }
                            >
                                ₹{t.amount}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}

/* Card Component */
function Card({ title, value, color }: any) {
    return (
        <div
            style={{
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                minWidth: "150px",
            }}
        >
            <p style={{ color: "#888" }}>{title}</p>
            <h2 style={{ color }}>{value}</h2>
        </div>
    );
}