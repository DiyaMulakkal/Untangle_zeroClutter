import { RawTransaction, Transaction } from "./types";

// ─── Column Alias Maps ──────────────────────────────────────────────────────
// Mirrors the Replit backend's findColumn() fuzzy matching approach.
// Covers Indian bank export formats (HDFC, ICICI, Axis, SBI, Kotak, IDFC).

const DATE_ALIASES = [
    "date", "Date", "DATE",
    "transaction date", "Transaction Date", "TransactionDate", "transaction_date",
    "txn date", "txn_date", "Txn Date",
    "posting date", "posting_date", "Posting Date",
    "value date", "value_date", "Value Date",
    "trans date", "trans_date",
];

const DESC_ALIASES = [
    "description", "Description", "DESCRIPTION",
    "desc", "Desc",
    "narration", "Narration", "NARRATION",
    "particulars", "Particulars", "PARTICULARS",
    "merchant", "Merchant",
    "transaction details", "Transaction Details", "transaction_details",
    "remarks", "Remarks",
    "note", "Note", "memo", "Memo",
    "name", "Name",
    "details", "Details",
];

const AMOUNT_ALIASES = [
    "amount", "Amount", "AMOUNT",
    "transaction amount", "Transaction Amount", "transaction_amount",
    "value", "Value",
    "net amount", "Net Amount",
];

const DEBIT_ALIASES = [
    "debit", "Debit", "DEBIT",
    "withdrawal", "Withdrawal", "WITHDRAWAL",
    "dr", "Dr", "DR",
    "debit amount", "Debit Amount", "debit_amount",
    "withdrawn", "Withdrawn",
];

const CREDIT_ALIASES = [
    "credit", "Credit", "CREDIT",
    "deposit", "Deposit", "DEPOSIT",
    "cr", "Cr", "CR",
    "credit amount", "Credit Amount", "credit_amount",
    "deposited", "Deposited",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function findColumn(obj: RawTransaction, aliases: string[]): string | undefined {
    // Exact match first
    const exact = aliases.find((k) => k in obj);
    if (exact) return exact;
    // Partial/lowercase fallback
    const keys = Object.keys(obj);
    for (const alias of aliases) {
        const found = keys.find(
            (k) => k.toLowerCase().includes(alias.toLowerCase()) ||
                alias.toLowerCase().includes(k.toLowerCase())
        );
        if (found) return found;
    }
    return undefined;
}

function parseAmount(raw: string | number | undefined): number | null {
    if (raw === undefined || raw === null || raw === "") return null;
    const cleaned = String(raw)
        .replace(/[₹$€£¥,\s]/g, "")
        .replace(/\(([^)]+)\)/, "-$1"); // accounting format: (100) → -100
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

function parseDate(raw: string | number | undefined): string | null {
    if (!raw) return null;
    const str = String(raw).trim();

    // ISO or standard
    let d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

    // DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (ddmmyyyy) {
        d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, "0")}-${ddmmyyyy[1].padStart(2, "0")}`);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }

    // DD MMM YYYY (e.g. "15 Jan 2024")
    const ddMmmYyyy = str.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (ddMmmYyyy) {
        d = new Date(`${ddMmmYyyy[2]} ${ddMmmYyyy[1]}, ${ddMmmYyyy[3]}`);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }

    return null;
}

// ─── Duplicate Detection ────────────────────────────────────────────────────
// Uses composite key: date|description|amount (same as Replit backend)

function buildKey(t: Transaction): string {
    return `${t.date}|${t.description.toLowerCase().trim()}|${Math.round(t.amount * 100)}`;
}

export function detectDuplicates(transactions: Transaction[]): Transaction[] {
    const seen = new Set<string>();
    return transactions.filter((t) => {
        const key = buildKey(t);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ─── Transfer Detection ─────────────────────────────────────────────────────
// Removes internal transfers: same absolute amount, opposite sign, within 3 days.
// Direct port from Replit's detectTransfers().

export function detectTransfers(transactions: Transaction[]): Transaction[] {
    const credits = transactions.filter((t) => t.amount > 0);
    const debits = transactions.filter((t) => t.amount < 0);
    const transferIds = new Set<number>();

    for (const credit of credits) {
        for (const debit of debits) {
            if (Math.round(Math.abs(credit.amount) * 100) !== Math.round(Math.abs(debit.amount) * 100)) continue;
            const daysDiff = Math.abs(
                (new Date(credit.date).getTime() - new Date(debit.date).getTime()) / 86400000
            );
            if (daysDiff <= 3) {
                // Mark both as transfers to remove
                transferIds.add(transactions.indexOf(credit));
                transferIds.add(transactions.indexOf(debit));
                break;
            }
        }
    }

    return transactions.filter((_, idx) => !transferIds.has(idx));
}

// ─── Main Normalizer ────────────────────────────────────────────────────────

export function normalizeTransactions(
    raw: RawTransaction[],
    account = "default"
): { transactions: Transaction[]; errors: number } {
    const transactions: Transaction[] = [];
    let errors = 0;

    for (const row of raw) {
        const dateKey = findColumn(row, DATE_ALIASES);
        const descKey = findColumn(row, DESC_ALIASES);

        const parsedDate = dateKey ? parseDate(row[dateKey]) : null;
        if (!parsedDate) { errors++; continue; }

        const description = descKey ? String(row[descKey] ?? "").trim() : "Unknown";
        if (!description || description === "Unknown") { errors++; continue; }

        let amount: number | null = null;

        // Try single amount column first
        const amountKey = findColumn(row, AMOUNT_ALIASES);
        if (amountKey) amount = parseAmount(row[amountKey]);

        // Fallback: separate debit/credit columns
        if (amount === null) {
            const debitKey = findColumn(row, DEBIT_ALIASES);
            const creditKey = findColumn(row, CREDIT_ALIASES);
            const debit = debitKey ? parseAmount(row[debitKey]) : null;
            const credit = creditKey ? parseAmount(row[creditKey]) : null;

            if (credit && credit > 0) amount = credit;
            else if (debit && debit > 0) amount = -Math.abs(debit);
            else if (debit !== null && credit !== null) amount = credit - debit;
        }

        if (amount === null || isNaN(amount) || amount === 0) { errors++; continue; }

        transactions.push({
            date: parsedDate,
            description,
            amount,
            account,
            type: "discretionary", // overwritten by categorizer
            category: "Other",     // overwritten by categorizer
            isAnomaly: false,
            anomalyReason: null,
        });
    }

    return { transactions, errors };
}