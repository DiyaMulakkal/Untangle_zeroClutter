"use client";

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE = 200;

function TransactionsContent() {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("All");
    const [category, setCategory] = useState("All");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const deferredSearch = useDeferredValue(search);
    const router = useRouter();
    const params = useSearchParams();
    const sessionId = params.get("sessionId");

    useEffect(() => {
        if (!sessionId) {
            setError("Missing session. Please go back and upload a statement.");
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/api/transactions?sessionId=${sessionId}`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Could not load transactions.");
                }
                return data;
            })
            .then((data) => {
                setTransactions(Array.isArray(data) ? data : []);
                setError(null);
                setVisibleCount(PAGE_SIZE);
            })
            .catch((err: unknown) => {
                setTransactions([]);
                setError(err instanceof Error ? err.message : "Could not load transactions.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [sessionId]);

    const filtered = useMemo(() => {
        const normalizedSearch = deferredSearch.trim().toLowerCase();

        return transactions.filter((t) => {
            const description = String(t.description ?? "").toLowerCase();
            const matchesSearch =
                normalizedSearch === "" || description.includes(normalizedSearch);

            const matchesType =
                type === "All" ||
                (type === "Income" && t.amount > 0) ||
                (type === "Expense" && t.amount < 0);

            const matchesCategory =
                category === "All" ||
                String(t.category ?? "").toLowerCase() === category.toLowerCase();

            return matchesSearch && matchesType && matchesCategory;
        });
    }, [transactions, deferredSearch, type, category]);

    const visibleTransactions = filtered.slice(0, visibleCount);
    const hasMore = visibleTransactions.length < filtered.length;

    return (
        <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
            <h2 style={{ marginBottom: "40px", opacity: "0.5" }}>Untangle</h2>
            <button
                className="btn-ghost"
                style={{ marginBottom: "20px" }}
                onClick={() => router.push("/")}
            >
                Back to home
            </button>

            <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>Transactions</h1>
            <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", opacity: "0.5", marginTop: "10px" }}> TYPE</label>
                <select className="dropdown" style={{ fontSize: "14px", fontWeight: "bold" }} value={type} onChange={(e) => {
                    setType(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                }}>
                    <option>All</option>
                    <option>Income</option>
                    <option>Expense</option>
                </select>

                <label style={{ fontSize: "12px", opacity: "0.5", marginTop: "10px" }}>CATEGORY</label>
                <select className="dropdown" style={{ fontSize: "14px", fontWeight: "bold" }} value={category} onChange={(e) => {
                    setCategory(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                }}>
                    <option>All</option>
                    <option>Food</option>
                    <option>Shopping</option>
                    <option>Travel</option>
                    <option>Bills</option>
                    <option>Subscription</option>
                    <option>Salary</option>
                    <option>Other</option>
                </select>

                <input
                    className="search-box"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setVisibleCount(PAGE_SIZE);
                    }}
                />
            </div>

            {loading && <p style={{ color: "#6b7280" }}>Loading transactions...</p>}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            {!loading && !error && (
                <p style={{ color: "#6b7280", marginBottom: "12px" }}>
                    Showing {visibleTransactions.length} of {filtered.length} matching transactions
                </p>
            )}

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
                    {visibleTransactions.map((t, i) => (
                        <tr key={`${t.date}-${t.description}-${t.amount}-${i}`}>
                            <td>{t.date}</td>
                            <td>{t.description}</td>
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

            {!loading && !error && hasMore && (
                <div style={{ marginTop: "20px" }}>
                    <button
                        className="btn-ghost"
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div style={{ padding: "40px" }}>Loading...</div>}>
            <TransactionsContent />
        </Suspense>
    );
}
