"use client";

import { useEffect, useMemo, useState } from "react";
import { AnalysisSnapshot, Summary, Transaction } from "@/lib/types";
import { loadAnalysis } from "@/lib/clientAnalysis";

export default function TransactionsPage() {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("All");
    const [category, setCategory] = useState("All");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTransactions() {
            try {
                const snapshot: AnalysisSnapshot | null = await loadAnalysis();
                if (!snapshot) {
                    throw new Error("No uploaded analysis found. Please upload a file first.");
                }

                setSummary(snapshot.summary);
                setTransactions(snapshot.transactions);
            } catch (err: any) {
                setError(err.message ?? "Failed to load transactions.");
            } finally {
                setLoading(false);
            }
        }

        loadTransactions();
    }, []);

    const filtered = useMemo(
        () =>
            transactions.filter((transaction) => {
                const matchesSearch =
                    search === "" ||
                    transaction.description.toLowerCase().includes(search.toLowerCase());

                const matchesType =
                    type === "All" ||
                    (type === "Income" && transaction.amount > 0) ||
                    (type === "Expense" && transaction.amount < 0);

                const matchesCategory =
                    category === "All" ||
                    transaction.category.toLowerCase() === category.toLowerCase();

                return matchesSearch && matchesType && matchesCategory;
            }),
        [transactions, search, type, category]
    );

    const categories = useMemo(
        () => ["All", ...new Set(transactions.map((transaction) => transaction.category))],
        [transactions]
    );

    return (
        <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
            <h2 style={{ marginBottom: "40px", opacity: "0.5" }}>Untangle</h2>

            <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>Transactions</h1>
            <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

            {summary && (
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                    <Card title="Income" value={`Rs ${summary.totalIncome.toFixed(0)}`} color="#0a7a3f" />
                    <Card title="Expenses" value={`Rs ${summary.totalExpenses.toFixed(0)}`} color="#b42318" />
                    <Card title="Balance" value={`Rs ${summary.currentBalance.toFixed(0)}`} color="#111827" />
                </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                <label style={{ fontSize: "12px", opacity: "0.5", marginTop: "10px" }}> TYPE</label>
                <select className="dropdown" style={{ fontSize: "14px", fontWeight: "bold" }} value={type} onChange={(e) => setType(e.target.value)}>
                    <option>All</option>
                    <option>Income</option>
                    <option>Expense</option>
                </select>

                <label style={{ fontSize: "12px", opacity: "0.5", marginTop: "10px" }}>CATEGORY</label>
                <select className="dropdown" style={{ fontSize: "14px", fontWeight: "bold" }} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((item) => (
                        <option key={item}>{item}</option>
                    ))}
                </select>

                <input
                    className="search-box"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading && <p>Loading transactions...</p>}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}

            {!loading && !error && (
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
                        {filtered.map((transaction, index) => (
                            <tr key={`${transaction.date}-${transaction.description}-${index}`}>
                                <td>{transaction.date}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.category}</td>
                                <td
                                    align="right"
                                    className={
                                        transaction.amount < 0 ? "amount-negative" : "amount-positive"
                                    }
                                >
                                    Rs {Math.abs(transaction.amount).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function Card({ title, value, color }: { title: string; value: string; color: string }) {
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
