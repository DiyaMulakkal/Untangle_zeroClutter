import { RawTransaction, Transaction } from "./types";

// ─── Aliases ────────────────────────────────────────────────────────────────

const DATE_ALIASES = ["date", "transaction date", "value date"];
const DESC_ALIASES = ["description", "narration", "transaction details", "details"];
const BALANCE_ALIASES = ["balance", "balance amt", "closing balance"];
const AMOUNT_ALIASES = ["amount", "value", "withdrawal", "deposit", "withdrawal amt", "deposit amt"];

export const ALL_HEADER_ALIASES = [...DATE_ALIASES, ...DESC_ALIASES, ...BALANCE_ALIASES, ...AMOUNT_ALIASES];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function parseAmount(raw: any): number | null {
    if (raw === undefined || raw === null || raw === "") return null;

    const cleaned = String(raw)
        .replace(/[₹,]/g, "")   // remove currency + commas
        .trim();

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

function parseDate(raw: any): string | null {
    if (!raw) return null;

    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

    return null;
}

// ─────────────────────────────────────────────────────────────
// MAIN NORMALIZER (FINAL FIXED)
// ─────────────────────────────────────────────────────────────

export function cleanTransactions(
    raw: RawTransaction[],
    account = "default"
): { transactions: Transaction[]; errors: number } {

    const transactions: Transaction[] = [];
    let errors = 0;

    for (const row of raw) {
        try {
            // 🔍 DEBUG (remove later if you want)
            // console.log(Object.keys(row));

            // ─────────────────────────────
            // ✅ DATE (force VALUE DATE)
            // ─────────────────────────────
            const dateKey = Object.keys(row).find(k =>
                k.toLowerCase().includes("value date")
            );

            let parsedDate = dateKey ? parseDate(row[dateKey]) : null;

            if (!parsedDate) {
                errors++;
                continue;
            }

            // ─────────────────────────────
            // ✅ DESCRIPTION
            // ─────────────────────────────
            const descKey = Object.keys(row).find(k =>
                k.toLowerCase().includes("description") ||
                k.toLowerCase().includes("details") ||
                k.toLowerCase().includes("narration")
            );

            const description = descKey
                ? String(row[descKey]).trim()
                : "Unknown";

            if (!description || description === "Unknown") {
                errors++;
                continue;
            }

            // ─────────────────────────────
            // 🔥 FINAL FIX: AMOUNT PARSING
            // ─────────────────────────────
            const debitKey = Object.keys(row).find(k =>
                k.toLowerCase().includes("withdraw")
            );

            const creditKey = Object.keys(row).find(k =>
                k.toLowerCase().includes("deposit")
            );

            const debit = debitKey ? parseAmount(row[debitKey]) : null;
            const credit = creditKey ? parseAmount(row[creditKey]) : null;

            let amount: number | null = null;

            if (credit !== null && credit > 0) {
                amount = credit;
            } else if (debit !== null && debit > 0) {
                amount = -Math.abs(debit);
            }

            if (amount === null || isNaN(amount)) {
                errors++;
                continue;
            }

            // ❌ skip absurd values
            if (Math.abs(amount) > 1e7) continue;

            // ─────────────────────────────
            // ✅ BALANCE
            // ─────────────────────────────
            const balanceKey = Object.keys(row).find(k =>
                k.toLowerCase().includes("balance")
            );

            let balance: number | undefined = undefined;

            if (balanceKey) {
                const b = parseAmount(row[balanceKey]);
                if (b !== null) balance = b;
            }

            // ─────────────────────────────
            // PUSH TRANSACTION
            // ─────────────────────────────
            transactions.push({
                date: parsedDate,
                description,
                descriptionCleaned: description.toLowerCase(),
                merchant: description.split(" ").slice(0, 2).join(" "),
                amount,
                account,
                type: "discretionary",
                category: "Other",
                isAnomaly: false,
                anomalyReason: null,
                balance,
            });

        } catch (e) {
            errors++;
        }
    }

    return { transactions, errors };
}

/**
 * Removes duplicate transactions based on date, description and amount.
 */
export function detectDuplicates(transactions: Transaction[]): Transaction[] {
    const seen = new Set<string>();
    return transactions.filter((tx) => {
        const key = `${tx.date}|${tx.descriptionCleaned}|${tx.amount.toFixed(2)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Removes internal transfers between accounts based on common keywords.
 */
export function detectTransfers(transactions: Transaction[]): Transaction[] {
    const TRANSFER_KEYWORDS = [
        "transfer",
        "internal",
        "self",
        "own a/c",
        "own account",
        "fund transfer",
        "ft to",
        "ft from",
        "to a/c",
        "from a/c",
        "to self",
        "from self",
    ];

    return transactions.filter((tx) => {
        const desc = tx.descriptionCleaned;
        return !TRANSFER_KEYWORDS.some((kw) => desc.includes(kw));
    });
}