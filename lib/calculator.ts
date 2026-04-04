import { Transaction, Summary, Forecast, ForecastDay, RecurringPattern } from "./types";
import { detectRecurringPatterns } from "./categorizer";

// ─── Helpers ────────────────────────────────────────────────────────────────

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function daysBetween(a: string, b: string): number {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
}

// ─── Core Summary Calculator ─────────────────────────────────────────────────
// Combines logic from Replit's:
//   GET /transactions/summary  →  income/expense/net/recurring/discretionary
//   GET /forecast              →  committedExpenses, availableForSpend, safeDailySpend, runway

export function calculateSummary(
    transactions: Transaction[],
    sessionId = "",
    currentBalance?: number  // optional: user-supplied balance (like Replit's balancesTable)
): Summary {
    if (transactions.length === 0) {
        return {
            sessionId,
            totalIncome: 0, totalExpenses: 0, currentBalance: 0,
            netFlow: 0, avgDailySpend: 0, runwayDays: 0, safeToSpendPerDay: 0,
            committedExpenses: 0, availableForSpend: 0,
            recurringExpensesMonthly: 0, discretionaryMonthly: 0,
            status: "Critical", breakdown: {}, anomalyCount: 0, warning: "No transactions found.",
        };
    }

    // ── Income & Expenses ────────────────────────────────────────────────────
    const incomeTx = transactions.filter((t) => t.amount > 0);
    const expenseTx = transactions.filter((t) => t.amount < 0);

    const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenseTx.reduce((s, t) => s + Math.abs(t.amount), 0);
    const netFlow = totalIncome - totalExpenses;

    // Use user-supplied balance OR extract from late transaction OR derive from net
    let effectiveBalance = currentBalance !== undefined ? currentBalance : netFlow;

    // Direct Extraction from Statement (if available in Transaction list)
    // We sort by date to find the most recent balance entry
    const sortedByDate = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const lastTxWithBalance = [...sortedByDate].reverse().find(tx => tx.balance !== undefined);
    
    if (currentBalance === undefined && lastTxWithBalance?.balance !== undefined) {
        effectiveBalance = lastTxWithBalance.balance;
    }

    // ── Recurring vs Discretionary ───────────────────────────────────────────
    const recurringExpensesMonthly = expenseTx
        .filter((t) => t.type === "recurring")
        .reduce((s, t) => s + Math.abs(t.amount), 0);

    const discretionaryMonthly = expenseTx
        .filter((t) => t.type === "discretionary")
        .reduce((s, t) => s + Math.abs(t.amount), 0);

    // ── Average Daily Spend ──────────────────────────────────────────────────
    // Based on the actual date span of data (same approach as Replit forecast)
    const dates = transactions.map((t) => t.date).sort();
    const spanDays = daysBetween(dates[0], dates[dates.length - 1]);
    const avgDailySpend = totalExpenses / spanDays;

    // ── Committed Expenses (next 30 days) ────────────────────────────────────
    // Port of Replit's forecast route: recurring pattern next-expected dates
    const recurringTx = transactions.filter((t) => t.type === "recurring" && t.amount < 0);
    const patterns: RecurringPattern[] = detectRecurringPatterns(recurringTx);

    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 86400000);
    let committedExpenses = 0;

    for (const pattern of patterns) {
        if (!pattern.nextExpected) continue;
        const nextDate = new Date(pattern.nextExpected);
        if (nextDate >= today && nextDate <= thirtyDaysLater) {
            committedExpenses += Math.abs(pattern.amount);
        }
    }

    // Fallback: if patterns detected no next-expected, use recent 90-day average
    if (committedExpenses === 0 && recurringTx.length > 0) {
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 86400000)
            .toISOString().slice(0, 10);
        const recent = recurringTx.filter((t) => t.date >= ninetyDaysAgo);
        committedExpenses = recent.reduce((s, t) => s + Math.abs(t.amount), 0) / 3;
    }

    // ── Available & Safe-to-Spend ────────────────────────────────────────────
    const availableForSpend = Math.max(0, effectiveBalance - committedExpenses);

    // safeDailySpend = availableForSpend / 30, but never exceed 90% of avgDailySpend
    // (forces at least 10% savings rate vs current burn)
    const rawSafe = availableForSpend / 30;
    const safeToSpendPerDay = avgDailySpend > 0
        ? Math.min(rawSafe, avgDailySpend * 0.9)
        : rawSafe;

    // ── Runway ───────────────────────────────────────────────────────────────
    const runwayDays = avgDailySpend > 0
        ? Math.floor(effectiveBalance / avgDailySpend)
        : 9999;

    // ── Expense Breakdown ────────────────────────────────────────────────────
    const breakdown: Record<string, number> = {};
    for (const tx of expenseTx) {
        breakdown[tx.category] = round2((breakdown[tx.category] ?? 0) + Math.abs(tx.amount));
    }

    // ── Anomaly Count ────────────────────────────────────────────────────────
    const anomalyCount = transactions.filter((t) => t.isAnomaly).length;

    // ── Health Status ────────────────────────────────────────────────────────
    const status: Summary["status"] =
        runwayDays >= 30 ? "Healthy" : runwayDays >= 14 ? "Warning" : "Critical";

    // ── Warning message (mirrors Replit's forecast warning logic) ────────────
    let warning: string | null = null;
    if (effectiveBalance <= 0)
        warning = "Balance is zero or negative. Upload more data or set your balance.";
    else if (safeToSpendPerDay <= 0)
        warning = "Committed expenses exceed your balance. Review recurring costs.";
    else if (runwayDays < 14)
        warning = "Low runway. Consider reducing discretionary spending immediately.";
    else if (anomalyCount > 0)
        warning = `${anomalyCount} anomalous transaction${anomalyCount > 1 ? "s" : ""} detected. Review your spending.`;

    return {
        sessionId,
        totalIncome: round2(totalIncome),
        totalExpenses: round2(totalExpenses),
        currentBalance: round2(effectiveBalance),
        netFlow: round2(netFlow),
        avgDailySpend: round2(avgDailySpend),
        runwayDays: Math.max(0, runwayDays),
        safeToSpendPerDay: round2(Math.max(0, safeToSpendPerDay)),
        committedExpenses: round2(committedExpenses),
        availableForSpend: round2(availableForSpend),
        recurringExpensesMonthly: round2(recurringExpensesMonthly),
        discretionaryMonthly: round2(discretionaryMonthly),
        status,
        breakdown,
        anomalyCount,
        warning,
    };
}

// ─── 30-Day Forecast Builder ─────────────────────────────────────────────────
// Direct port of Replit's buildDayForecast(), with inflation support.

export function buildForecast(
    summary: Summary,
    inflationRate = 0,
    applyInflation = false
): Forecast {
    const { currentBalance, safeToSpendPerDay, committedExpenses, availableForSpend } = summary;

    let adjustedCommitted = committedExpenses;
    let adjustedSafe = safeToSpendPerDay;

    if (applyInflation && inflationRate > 0) {
        adjustedCommitted = committedExpenses * (1 + inflationRate / 12);
        adjustedSafe = adjustedSafe / (1 + inflationRate / 12);
    }

    const days: ForecastDay[] = [];
    const today = new Date();
    let cumulativeSpent = 0;

    for (let day = 1; day <= 30; day++) {
        const date = new Date(today.getTime() + day * 86400000);
        let dailySpend = adjustedSafe;

        if (applyInflation && inflationRate > 0) {
            dailySpend = adjustedSafe * Math.pow(1 + inflationRate / 365, day - 1);
        }

        cumulativeSpent += dailySpend;

        days.push({
            day,
            date: date.toISOString().split("T")[0],
            safeToSpend: round2(dailySpend),
            cumulativeSpent: round2(cumulativeSpent),
            remainingBalance: round2(Math.max(0, currentBalance - cumulativeSpent)),
        });
    }

    let warning: string | null = summary.warning;
    if (!warning && adjustedSafe < 200)
        warning = "Very low safe-to-spend. Consider reducing discretionary spending.";

    return {
        currentBalance: round2(currentBalance),
        committedExpenses: round2(adjustedCommitted),
        availableForSpend: round2(Math.max(0, currentBalance - adjustedCommitted)),
        safeDailySpend: round2(Math.max(0, adjustedSafe)),
        inflationAdjusted: applyInflation,
        inflationRate,
        days,
        warning,
    };
}

// ─── What-If recalculator (client-safe, no transactions needed) ──────────────

export function recalculateWithSpend(
    summary: Summary,
    newDailySpend: number
): Pick<Summary, "runwayDays" | "safeToSpendPerDay" | "status"> {
    const runwayDays = newDailySpend > 0
        ? Math.floor(summary.currentBalance / newDailySpend)
        : 9999;
    const safeToSpendPerDay = round2(
        Math.min(summary.availableForSpend / 30, newDailySpend * 0.9)
    );
    const status: Summary["status"] =
        runwayDays >= 30 ? "Healthy" : runwayDays >= 14 ? "Warning" : "Critical";

    return { runwayDays: Math.max(0, runwayDays), safeToSpendPerDay, status };
}