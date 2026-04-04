import { Transaction, Summary } from "./types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function daysBetween(a: string, b: string): number {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
}

// ─────────────────────────────────────────────────────────────
// CORE CALCULATOR (FIXED + STABLE)
// ─────────────────────────────────────────────────────────────

export function calculateSummary(
    transactions: Transaction[],
    sessionId = "",
    currentBalance?: number
): Summary {

    // ── EMPTY SAFETY ───────────────────────────────────────────
    if (transactions.length === 0) {
        return {
            sessionId,
            totalIncome: 0,
            totalExpenses: 0,
            currentBalance: 0,
            netFlow: 0,
            avgDailySpend: 0,
            runwayDays: 0,
            safeToSpendPerDay: 0,
            committedExpenses: 0,
            availableForSpend: 0,
            recurringExpensesMonthly: 0,
            discretionaryMonthly: 0,
            status: "Critical",
            breakdown: {},
            anomalyCount: 0,
            warning: "No transactions found.",
        };
    }

    // ── INCOME & EXPENSES ──────────────────────────────────────
    const incomeTx = transactions.filter(t => t.amount > 0);
    const expenseTx = transactions.filter(t => t.amount < 0);

    const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenseTx.reduce((s, t) => s + Math.abs(t.amount), 0);

    // ───────────────────────────────────────────────────────────
    // ✅ REAL BALANCE FIX (MOST IMPORTANT)
    // ───────────────────────────────────────────────────────────
    let effectiveBalance = 0;

    if (currentBalance !== undefined) {
        effectiveBalance = currentBalance;
    } else {
        const sorted = [...transactions].sort((a, b) =>
            a.date.localeCompare(b.date)
        );

        const lastWithBalance = [...sorted]
            .reverse()
            .find(t => t.balance !== undefined);

        if (lastWithBalance?.balance !== undefined) {
            effectiveBalance = lastWithBalance.balance;
        } else {
            // fallback (safe)
            effectiveBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

            // clamp absurd values
            if (Math.abs(effectiveBalance) > 1e7) {
                effectiveBalance = 0;
            }
        }
    }

    // ── DATE RANGE & DAILY SPEND ───────────────────────────────
    const dates = transactions.map(t => t.date).sort();
    const spanDays = daysBetween(dates[0], dates[dates.length - 1]);

    const avgDailySpend =
        spanDays > 0 ? totalExpenses / spanDays : 0;

    // ───────────────────────────────────────────────────────────
    // ✅ RECURRING (SIMPLIFIED + STABLE)
    // ───────────────────────────────────────────────────────────
    const recurringTx = transactions.filter(
        t => t.type === "recurring" && t.amount < 0
    );

    // Estimate next 30 days recurring
    let committedExpenses = 0;

    if (recurringTx.length > 0) {
        const ninetyDaysAgo = new Date(
            Date.now() - 90 * 86400000
        ).toISOString().slice(0, 10);

        const recentRecurring = recurringTx.filter(
            t => t.date >= ninetyDaysAgo
        );

        committedExpenses =
            recentRecurring.reduce((s, t) => s + Math.abs(t.amount), 0) / 3;
    }

    // ───────────────────────────────────────────────────────────
    // ✅ SAFE TO SPEND (FIXED)
    // ───────────────────────────────────────────────────────────
    const safeToSpendPerDay =
        effectiveBalance > 0
            ? (effectiveBalance - committedExpenses) / 30
            : 0;

    // ───────────────────────────────────────────────────────────
    // ✅ RUNWAY (FIXED)
    // ───────────────────────────────────────────────────────────
    const runwayDays =
        effectiveBalance > 0 && avgDailySpend > 0
            ? Math.floor(effectiveBalance / avgDailySpend)
            : 0;

    // ── BREAKDOWN ──────────────────────────────────────────────
    const breakdown: Record<string, number> = {};
    for (const tx of expenseTx) {
        breakdown[tx.category] =
            round2((breakdown[tx.category] ?? 0) + Math.abs(tx.amount));
    }

    // ── ANOMALIES ──────────────────────────────────────────────
    const anomalyCount = transactions.filter(t => t.isAnomaly).length;

    // ── STATUS ─────────────────────────────────────────────────
    const status: Summary["status"] =
        runwayDays >= 30
            ? "Healthy"
            : runwayDays >= 14
                ? "Warning"
                : "Critical";

    // ── WARNINGS ───────────────────────────────────────────────
    let warning: string | null = null;

    if (effectiveBalance <= 0)
        warning = "Balance is zero or negative.";
    else if (safeToSpendPerDay <= 0)
        warning = "Committed expenses exceed balance.";
    else if (runwayDays < 14)
        warning = "Low runway. Reduce spending.";
    else if (anomalyCount > 0)
        warning = `${anomalyCount} unusual transactions detected.`;

    // ── FINAL RETURN ───────────────────────────────────────────
    return {
        sessionId,
        totalIncome: round2(totalIncome),
        totalExpenses: round2(totalExpenses),
        currentBalance: round2(effectiveBalance),
        netFlow: round2(totalIncome - totalExpenses),
        avgDailySpend: round2(avgDailySpend),
        runwayDays,
        safeToSpendPerDay: round2(Math.max(0, safeToSpendPerDay)),
        committedExpenses: round2(committedExpenses),
        availableForSpend: round2(Math.max(0, effectiveBalance - committedExpenses)),
        recurringExpensesMonthly: round2(committedExpenses),
        discretionaryMonthly: round2(totalExpenses - committedExpenses),
        status,
        breakdown,
        anomalyCount,
        warning,
    };
}

// ─────────────────────────────────────────────────────────────
// WHAT-IF CALCULATOR (FOR SLIDER)
// ─────────────────────────────────────────────────────────────

export function recalculateWithSpend(
    summary: Summary,
    newDailySpend: number
) {
    const runwayDays =
        newDailySpend > 0
            ? Math.floor(summary.currentBalance / newDailySpend)
            : 0;

    const safeToSpendPerDay =
        Math.min(summary.availableForSpend / 30, newDailySpend);

    const status =
        runwayDays >= 30
            ? "Healthy"
            : runwayDays >= 14
                ? "Warning"
                : "Critical";

    return {
        runwayDays: Math.max(0, runwayDays),
        safeToSpendPerDay: round2(Math.max(0, safeToSpendPerDay)),
        status,
    };
}