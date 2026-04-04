import { RawTransaction, Transaction } from "./types";

// ---------------------------------------------------------------------------
// Column name aliases — handles messy real-world bank exports
// Uses fuzzy substring matching so "WITHDRAWAL AMT" matches "withdrawal"
// ---------------------------------------------------------------------------
const DATE_KEYS = ["date", "time"];

const DESC_KEYS = [
    "description", "desc", "narration", "particular",
    "merchant", "detail", "remark", "note", "memo", "name"
];

const AMOUNT_KEYS = ["amount", "amt", "value"];
const AMOUNT_EXCLUDES = [
    "date", "time", "balance", "bal", "debit", "credit",
    "withdrawal", "deposit", "dr", "cr"
];

// For banks that split debit/credit into separate columns
const DEBIT_KEYS = ["debit", "withdrawal", "dr"];
const CREDIT_KEYS = ["credit", "deposit", "cr"];

// For extracting the running balance
const BALANCE_KEYS = ["balance", "bal", "closing", "running"];
const BALANCE_EXCLUDES = ["debit", "credit", "withdrawal", "deposit", "dr", "cr"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function findKey(obj: RawTransaction, keywords: string[], excludes: string[] = []): string | undefined {
    return Object.keys(obj).find((k) => {
        const col = k.toLowerCase();

        // If it contains an excluded word, skip it
        if (excludes.some(ex => {
            if (ex.length <= 2) return new RegExp(`\\b${ex}\\b`).test(col);
            return col.includes(ex);
        })) {
            return false;
        }

        // Match if it contains the base keyword
        return keywords.some((kw) => {
            if (kw.length <= 2) {
                return new RegExp(`\\b${kw}\\b`).test(col);
            }
            return col.includes(kw);
        });
    });
}

function parseAmount(raw: string | number | undefined): number | null {
    if (raw === undefined || raw === null || raw === "") return null;
    const cleaned = String(raw)
        .replace(/[₹$€£¥,\s]/g, "")  // strip currency symbols, commas, spaces
        .replace(/\(([^)]+)\)/, "-$1"); // convert (123) → -123 (accounting format)
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

function parseDate(raw: string | number | undefined): string | null {
    if (!raw) return null;

    const str = String(raw).trim();

    // Try ISO or standard formats first (handles "16-Aug-17", "2017-08-16", etc.)
    let d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

    // DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (ddmmyyyy) {
        d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, "0")}-${ddmmyyyy[1].padStart(2, "0")}`);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }

    // DD/MM/YY or DD-MM-YY
    const ddmmyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
    if (ddmmyy) {
        const year = parseInt(ddmmyy[3]) > 50 ? `19${ddmmyy[3]}` : `20${ddmmyy[3]}`;
        d = new Date(`${year}-${ddmmyy[2].padStart(2, "0")}-${ddmmyy[1].padStart(2, "0")}`);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }

    return null;
}

// ---------------------------------------------------------------------------
// Main cleaner
// ---------------------------------------------------------------------------
export function cleanTransactions(raw: RawTransaction[]): Transaction[] {
    const cleaned: Transaction[] = [];
    let skipped = 0;

    // Detect columns once from first non-empty row
    const sampleRow = raw.find(r => Object.keys(r).length > 0);
    if (!sampleRow) return [];

    const dateKey = findKey(sampleRow, DATE_KEYS);
    const descKey = findKey(sampleRow, DESC_KEYS);
    const amountKey = findKey(sampleRow, AMOUNT_KEYS, AMOUNT_EXCLUDES);
    const debitKey = findKey(sampleRow, DEBIT_KEYS);
    const creditKey = findKey(sampleRow, CREDIT_KEYS);
    const balanceKey = findKey(sampleRow, BALANCE_KEYS, BALANCE_EXCLUDES);

    if (process.env.NODE_ENV === "development") {
        console.log(`[cleaner] Column mapping:`);
        console.log(`  date    → "${dateKey}"`);
        console.log(`  desc    → "${descKey}"`);
        console.log(`  amount  → "${amountKey}"`);
        console.log(`  debit   → "${debitKey}"`);
        console.log(`  credit  → "${creditKey}"`);
        console.log(`  balance → "${balanceKey}"`);
    }

    for (const row of raw) {
        // --- Date ---
        const parsedDate = dateKey ? parseDate(row[dateKey]) : null;
        if (!parsedDate) { skipped++; continue; }

        // --- Description ---
        const description = descKey ? String(row[descKey] ?? "").trim() : "Unknown";

        // --- Amount ---
        let amount: number | null = null;

        // Case 1: Single amount column (positive/negative)
        if (amountKey) {
            amount = parseAmount(row[amountKey]);
        }

        // Case 2: Separate debit and credit columns
        if (amount === null) {
            const debit = debitKey ? parseAmount(row[debitKey]) : null;
            const credit = creditKey ? parseAmount(row[creditKey]) : null;

            if (credit && credit > 0) amount = credit;
            else if (debit && debit > 0) amount = -debit; // debits become negative
            else if (debit !== null && credit !== null) amount = credit - debit;
        }

        if (amount === null || isNaN(amount)) { skipped++; continue; }
        if (amount === 0) { skipped++; continue; }

        // --- Balance (optional) ---
        const balance = balanceKey ? parseAmount(row[balanceKey]) : undefined;

        cleaned.push({
            date: parsedDate,
            description,
            amount,
            category: "Uncategorized",
            balance: balance ?? undefined,
        });
    }

    if (process.env.NODE_ENV === "development") {
        console.log(`[cleaner] ${cleaned.length} valid, ${skipped} skipped`);
    }

    return cleaned;
}