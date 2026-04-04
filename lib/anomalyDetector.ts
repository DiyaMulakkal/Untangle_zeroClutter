import { Transaction } from "./types";

/**
 * Very basic statistical anomaly detection algorithm ported to TS.
 * Flags any transaction that is statistically significant compared to the mean
 * of that specific category (needs at least 3 transactions in the category to work).
 */
export function annotateAnomalies(transactions: Transaction[]): Transaction[] {
    const expenses = transactions.filter((t) => t.amount < 0);
    
    // Group by category
    const grouped = new Map<string, number[]>();
    for (const tx of expenses) {
        if (!grouped.has(tx.category)) grouped.set(tx.category, []);
        grouped.get(tx.category)!.push(Math.abs(tx.amount));
    }

    // Precalculate mean and standard deviation per category
    const stats = new Map<string, { mean: number; stdDev: number; count: number }>();
    for (const [cat, amounts] of grouped.entries()) {
        const count = amounts.length;
        if (count < 3) continue; // need at least 3 to calculate decent stats
        
        const sum = amounts.reduce((a, b) => a + b, 0);
        const mean = sum / count;
        
        const variance = amounts.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / count;
        const stdDev = Math.sqrt(variance);
        
        stats.set(cat, { mean, stdDev, count });
    }

    // Annotate
    return transactions.map((tx) => {
        if (tx.amount >= 0) {
            // we don't flag income anomalies currently
            return { ...tx, isAnomaly: false, anomalyReason: null };
        }

        const absAmount = Math.abs(tx.amount);
        const st = stats.get(tx.category);

        if (!st) {
            return { ...tx, isAnomaly: false, anomalyReason: null };
        }

        // If the amount is more than 2 std devs away and also > 50% above the mean (to prevent false flags on tiny amounts)
        if (absAmount > st.mean + 2 * st.stdDev && absAmount > st.mean * 1.5) {
            const meanFormatted = Math.round(st.mean).toLocaleString();
            return {
                ...tx,
                isAnomaly: true,
                anomalyReason: `Unusually high for '${tx.category}'. Average is around ₹${meanFormatted}.`,
            };
        }

        return { ...tx, isAnomaly: false, anomalyReason: null };
    });
}
