"use client";

import { useState } from "react";
import SummaryCard from "./SummaryCard";
import { Summary } from "../lib/types";

interface Props {
    summary: Summary;
    dateRange: { from: string; to: string };
    transactionCount: number;
}

export default function SummaryGrid({ summary, dateRange, transactionCount }: Props) {
    const [whatIfSpend, setWhatIfSpend] = useState<number | null>(null);

    // --- What-if recalculation ---
    const effectiveSpend = whatIfSpend ?? summary.avgDailySpend;

    let whatIfRunway: number;
    if (summary.currentBalance <= 0) {
        whatIfRunway = 0;
    } else if (effectiveSpend <= 0) {
        whatIfRunway = 9999;
    } else {
        whatIfRunway = Math.floor(summary.currentBalance / effectiveSpend);
    }

    // Safe-to-spend adjusts with what-if: if you spend X/day, how much of your
    // balance would remain after 30 days, spread over the next 30?
    const projectedRemaining = Math.max(0, summary.currentBalance - effectiveSpend * 30);
    const whatIfSafe = Math.max(0, Math.round((projectedRemaining * 0.8) / 30 * 100) / 100);

    const whatIfStatus: "Healthy" | "Warning" | "Critical" =
        whatIfRunway >= 90 ? "Healthy" : whatIfRunway >= 30 ? "Warning" : "Critical";
    const whatIfAccent: "green" | "yellow" | "red" =
        whatIfStatus === "Healthy" ? "green" : whatIfStatus === "Warning" ? "yellow" : "red";

    // --- Status display ---
    const displayStatus = whatIfSpend !== null ? whatIfStatus : summary.status;
    const statusColor =
        displayStatus === "Healthy" ? "var(--green)"
            : displayStatus === "Warning" ? "var(--yellow)"
                : "var(--red)";

    // Sort breakdown by value desc
    const breakdownEntries = Object.entries(summary.breakdown).sort(
        ([, a], [, b]) => b - a
    );
    const totalBreakdown = breakdownEntries.reduce((s, [, v]) => s + v, 0);

    function fmt(n: number) {
        return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function fmtDecimal(n: number) {
        return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Slider max: 3x avg daily spend but at least ₹2000
    const sliderMax = Math.max(Math.ceil(summary.avgDailySpend * 3), 2000);

    return (
        <div>
            {/* ── Header meta ──────────────────────────────────────── */}
            <div
                className="fade-up"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "0.75rem",
                    marginBottom: "1.5rem",
                }}
            >
                <span style={{ color: "var(--text-muted)", fontSize: "11px", letterSpacing: "0.1em" }}>
                    {transactionCount} TRANSACTIONS · {dateRange.from} → {dateRange.to}
                </span>
                <span
                    style={{
                        color: statusColor,
                        fontSize: "10px",
                        letterSpacing: "0.15em",
                        border: `1px solid ${statusColor}`,
                        padding: "2px 8px",
                        borderRadius: "var(--radius)",
                    }}
                >
                    {displayStatus.toUpperCase()}
                </span>
            </div>

            {/* ── 2×2 metric grid ──────────────────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                }}
            >
                <SummaryCard
                    label="Current Balance"
                    value={fmt(summary.currentBalance)}
                    sub={`Income ${fmt(summary.totalIncome)} · Spent ${fmt(summary.totalExpenses)}`}
                    index={0}
                />
                <SummaryCard
                    label="Avg Daily Spend"
                    value={fmtDecimal(summary.avgDailySpend)}
                    sub="based on your date range"
                    index={1}
                />
                <SummaryCard
                    label="Financial Runway"
                    value={
                        whatIfRunway >= 9999
                            ? "∞"
                            : `${whatIfSpend !== null ? whatIfRunway : summary.runwayDays} days`
                    }
                    sub={whatIfSpend !== null ? "what-if projection" : "at current burn rate"}
                    highlight
                    accent={whatIfSpend !== null ? whatIfAccent : (summary.status === "Healthy" ? "green" : summary.status === "Warning" ? "yellow" : "red")}
                    index={2}
                />
                <SummaryCard
                    label="Safe to Spend / Day"
                    value={fmtDecimal(whatIfSpend !== null ? whatIfSafe : summary.safeToSpendPerDay)}
                    sub={whatIfSpend !== null ? "adjusted for what-if spending" : "80% balance over 30 days"}
                    index={3}
                />
            </div>

            {/* ── What-If Slider ────────────────────────────────────── */}
            <div
                className="fade-up fade-up-5"
                style={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1rem 1.25rem",
                    marginBottom: "1.5rem",
                    background: "var(--surface)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                    }}
                >
                    <span style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "0.12em" }}>
                        WHAT IF I SPEND / DAY
                    </span>
                    <span style={{ color: whatIfSpend !== null ? "var(--yellow)" : "var(--text-dim)", fontSize: "12px", fontWeight: 600 }}>
                        {fmtDecimal(effectiveSpend)}
                    </span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={sliderMax}
                    step={Math.max(1, Math.floor(sliderMax / 500))}
                    value={whatIfSpend ?? summary.avgDailySpend}
                    onChange={(e) => setWhatIfSpend(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--green)", cursor: "pointer" }}
                />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "0.4rem",
                        color: "var(--text-dim)",
                        fontSize: "10px",
                    }}
                >
                    <span>₹0</span>
                    <span style={{ color: whatIfAccent === "red" ? "var(--red)" : whatIfAccent === "yellow" ? "var(--yellow)" : "var(--text-muted)" }}>
                        Runway → {whatIfRunway >= 9999 ? "∞" : whatIfRunway} days
                    </span>
                    <span>{fmt(sliderMax)}</span>
                </div>
                {whatIfSpend !== null && (
                    <button
                        onClick={() => setWhatIfSpend(null)}
                        style={{
                            marginTop: "0.5rem",
                            background: "none",
                            border: "none",
                            color: "var(--text-dim)",
                            fontSize: "10px",
                            cursor: "pointer",
                            letterSpacing: "0.1em",
                            padding: 0,
                        }}
                    >
                        ↩ RESET TO ACTUAL
                    </button>
                )}
            </div>

            {/* ── Expense breakdown ─────────────────────────────────── */}
            <div className="fade-up fade-up-6">
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        marginBottom: "0.75rem",
                        textTransform: "uppercase",
                    }}
                >
                    Expense Breakdown
                </p>

                {breakdownEntries.length === 0 ? (
                    <p style={{ color: "var(--text-dim)", fontSize: "12px" }}>
                        No expense categories found.
                    </p>
                ) : (
                    breakdownEntries.map(([cat, amt], i) => {
                        const pct = totalBreakdown > 0 ? (amt / totalBreakdown) * 100 : 0;
                        return (
                            <div
                                key={cat}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto auto",
                                    gap: "1rem",
                                    alignItems: "center",
                                    padding: "0.55rem 0",
                                    borderBottom: i < breakdownEntries.length - 1 ? "1px solid var(--border)" : "none",
                                }}
                            >
                                {/* Category name + bar */}
                                <div>
                                    <div style={{ marginBottom: "4px", fontSize: "12px", color: "var(--text)" }}>
                                        {cat}
                                    </div>
                                    <div
                                        style={{
                                            height: "2px",
                                            background: "var(--border)",
                                            borderRadius: "1px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${pct}%`,
                                                background: "var(--green)",
                                                borderRadius: "1px",
                                                transition: "width 0.6s ease",
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Percent */}
                                <span style={{ color: "var(--text-dim)", fontSize: "10px", textAlign: "right" }}>
                                    {pct.toFixed(1)}%
                                </span>
                                {/* Amount */}
                                <span
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "12px",
                                        textAlign: "right",
                                        minWidth: "80px",
                                    }}
                                >
                                    {fmt(amt)}
                                </span>
                            </div>
                        );
                    })
                )}

                {/* Total row */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "0.75rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--border-hover)",
                    }}
                >
                    <span style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "0.1em" }}>
                        TOTAL EXPENSES
                    </span>
                    <span style={{ color: "var(--red)", fontSize: "12px", fontWeight: 600 }}>
                        {fmt(summary.totalExpenses)}
                    </span>
                </div>
            </div>
        </div>
    );
}