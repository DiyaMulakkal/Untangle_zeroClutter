import { Forecast, Transaction } from "./types";

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

export function buildForecast(transactions: Transaction[], currentBalance: number): Forecast {
    const recurringExpenses = transactions.filter(
        (tx) => tx.amount < 0 && tx.type === "recurring"
    );

    const committedExpenses = recurringExpenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const availableForSpend = Math.max(0, currentBalance - committedExpenses);
    const safeDailySpend = round2(availableForSpend / 30);

    let runningBalance = round2(currentBalance);
    const days = Array.from({ length: 30 }, (_, index) => {
        const day = index + 1;
        runningBalance = round2(Math.max(0, runningBalance - safeDailySpend));

        return {
            day,
            date: new Date(Date.now() + day * 86400000).toISOString().slice(0, 10),
            safeToSpend: safeDailySpend,
            cumulativeSpent: round2(safeDailySpend * day),
            remainingBalance: runningBalance,
        };
    });

    return {
        currentBalance: round2(currentBalance),
        committedExpenses: round2(committedExpenses),
        availableForSpend: round2(availableForSpend),
        safeDailySpend,
        inflationAdjusted: false,
        inflationRate: 0,
        days,
        warning: safeDailySpend <= 0 ? "No safe daily spend available with the current balance." : null,
    };
}
