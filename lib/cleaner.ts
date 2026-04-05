import { RawTransaction, Transaction } from "./types";

const DATE_ALIASES = ["date", "transaction date", "value date"];
const DESC_ALIASES = ["description", "narration", "transaction details", "details"];
const BALANCE_ALIASES = ["balance", "balance amt", "closing balance"];
const AMOUNT_ALIASES = ["amount", "value", "withdrawal", "deposit", "withdrawal amt", "deposit amt", "debit", "credit"];

export const ALL_HEADER_ALIASES = [...DATE_ALIASES, ...DESC_ALIASES, ...BALANCE_ALIASES, ...AMOUNT_ALIASES];

function normalizeKey(key: string) {
    return key.toLowerCase().trim();
}

function findKey(row: RawTransaction, aliases: string[]) {
    return Object.keys(row).find((key) => {
        const normalized = normalizeKey(key);
        return aliases.some((alias) => normalized.includes(alias));
    });
}

function parseAmount(raw: any): number | null {
    if (raw === undefined || raw === null || raw === "") return null;

    const cleaned = String(raw)
        .replace(/[₹,]/g, "")
        .replace(/\((.*)\)/, "-$1")
        .trim();

    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? null : num;
}

function parseDate(raw: any): string | null {
    if (!raw) return null;

    const direct = new Date(raw);
    if (!Number.isNaN(direct.getTime())) {
        return direct.toISOString().split("T")[0];
    }

    const text = String(raw).trim();
    const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (!match) return null;

    const [, first, second, third] = match;
    const year = third.length === 2 ? `20${third}` : third;
    const parsed = new Date(`${year}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`);

    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().split("T")[0];
}

export function cleanTransactions(
    raw: RawTransaction[],
    account = "default"
): { transactions: Transaction[]; errors: number } {
    const transactions: Transaction[] = [];
    let errors = 0;

    for (const row of raw) {
        try {
            const dateKey = findKey(row, DATE_ALIASES);
            const descKey = findKey(row, DESC_ALIASES);
            const balanceKey = findKey(row, BALANCE_ALIASES);
            const debitKey = findKey(row, ["withdraw", "withdrawal", "debit"]);
            const creditKey = findKey(row, ["deposit", "credit"]);
            const amountKey = findKey(row, ["amount", "value"]);

            const parsedDate = dateKey ? parseDate(row[dateKey]) : null;
            if (!parsedDate) {
                errors++;
                continue;
            }

            const description = descKey ? String(row[descKey]).trim() : "Unknown";
            if (!description || description === "Unknown") {
                errors++;
                continue;
            }

            const debit = debitKey ? parseAmount(row[debitKey]) : null;
            const credit = creditKey ? parseAmount(row[creditKey]) : null;
            const amountValue = amountKey ? parseAmount(row[amountKey]) : null;

            let amount: number | null = null;

            if (credit !== null && credit !== 0) {
                amount = Math.abs(credit);
            } else if (debit !== null && debit !== 0) {
                amount = -Math.abs(debit);
            } else if (amountValue !== null && amountValue !== 0) {
                amount = amountValue;
            }

            if (amount === null || Number.isNaN(amount)) {
                errors++;
                continue;
            }

            if (Math.abs(amount) > 1e7) continue;

            let balance: number | undefined;
            if (balanceKey) {
                const parsedBalance = parseAmount(row[balanceKey]);
                if (parsedBalance !== null) {
                    balance = parsedBalance;
                }
            }

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
        } catch {
            errors++;
        }
    }

    return { transactions, errors };
}

export function detectDuplicates(transactions: Transaction[]): Transaction[] {
    const seen = new Set<string>();
    return transactions.filter((tx) => {
        const key = `${tx.date}|${tx.descriptionCleaned}|${tx.amount.toFixed(2)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

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
