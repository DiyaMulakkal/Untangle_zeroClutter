import { Transaction, Summary } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function daysBetween(a: string, b: string): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay) + 1);
}

// ---------------------------------------------------------------------------
// Core calculator — pure function, no side effects
// ---------------------------------------------------------------------------
export function calculateSummary(
    transactions: Transaction[],
    sessionId: string = ""
): Summary {
    if (transactions.length === 0) {
        return {
            sessionId,
            totalIncome: 0,
            totalExpenses: 0,
            currentBalance: 0,
            netCashFlow: 0,
            avgDailySpend: 0,
            runwayDays: 0,
            safeToSpendPerDay: 0,
            status: "Critical",
            breakdown: {},
        };
    }

    // --- Separate income vs expenses ---
    const incomeTransactions = transactions.filter((t) => t.amount > 0);
    const expenseTransactions = transactions.filter((t) => t.amount < 0);

    const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);
    const netCashFlow = totalIncome - totalExpenses;

    // --- Current Balance ---
    // If the bank statement provides a running balance column, use the LAST known value.
    // This is the real account balance, not a computed sum.
    // If no balance column exists, fall back to net cash flow.
    const lastBalanceTxn = [...transactions].reverse().find((t) => t.balance !== undefined && t.balance !== null);
    const currentBalance = lastBalanceTxn ? lastBalanceTxn.balance! : netCashFlow;

    // --- Average daily spend ---
    const allDates = transactions.map((t) => t.date).sort();
    const spanDays = daysBetween(allDates[0], allDates[allDates.length - 1]);
    const avgDailySpend = spanDays > 0 ? totalExpenses / spanDays : totalExpenses;

    // --- Runway ---
    // How many days can the current balance sustain at the current burn rate?
    // Only meaningful if balance > 0 and there are expenses
    let runwayDays: number;
    if (currentBalance <= 0) {
        runwayDays = 0;
    } else if (avgDailySpend <= 0) {
        runwayDays = 9999; // no spending = infinite runway
    } else {
        runwayDays = Math.floor(currentBalance / avgDailySpend);
    }

    // --- Safe to spend per day ---
    // Take 80% of balance (keep 20% as emergency buffer) over 30 days
    const safeToSpendPerDay =
        currentBalance > 0 ? round2((currentBalance * 0.8) / 30) : 0;

    // --- Expense breakdown by category ---
    const breakdown: Record<string, number> = {};
    for (const txn of expenseTransactions) {
        const cat = txn.category;
        breakdown[cat] = (breakdown[cat] ?? 0) + Math.abs(txn.amount);
    }
    for (const cat in breakdown) {
        breakdown[cat] = round2(breakdown[cat]);
    }

    // --- Health status ---
    const status: Summary["status"] =
        runwayDays >= 90 ? "Healthy" : runwayDays >= 30 ? "Warning" : "Critical";

    return {
        sessionId,
        totalIncome: round2(totalIncome),
        totalExpenses: round2(totalExpenses),
        currentBalance: round2(currentBalance),
        netCashFlow: round2(netCashFlow),
        avgDailySpend: round2(avgDailySpend),
        runwayDays,
        safeToSpendPerDay,
        status,
        breakdown,
    };
}

// ---------------------------------------------------------------------------
// What-if recalculator
// ---------------------------------------------------------------------------
export function recalculateWithSpend(
    summary: Summary,
    newDailySpend: number
): Pick<Summary, "runwayDays" | "safeToSpendPerDay" | "status"> {
    let runwayDays: number;
    if (summary.currentBalance <= 0) {
        runwayDays = 0;
    } else if (newDailySpend <= 0) {
        runwayDays = 9999;
    } else {
        runwayDays = Math.floor(summary.currentBalance / newDailySpend);
    }

    const safeToSpendPerDay =
        summary.currentBalance > 0 ? round2((summary.currentBalance * 0.8) / 30) : 0;

    const status: Summary["status"] =
        runwayDays >= 90 ? "Healthy" : runwayDays >= 30 ? "Warning" : "Critical";

    return { runwayDays, safeToSpendPerDay, status };
}