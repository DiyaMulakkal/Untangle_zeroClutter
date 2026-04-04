module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/untangle-zero-clutter/lib/cleaner.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_HEADER_ALIASES",
    ()=>ALL_HEADER_ALIASES,
    "cleanTransactions",
    ()=>cleanTransactions,
    "detectDuplicates",
    ()=>detectDuplicates,
    "detectTransfers",
    ()=>detectTransfers
]);
// ─── Aliases ────────────────────────────────────────────────────────────────
const DATE_ALIASES = [
    "date",
    "transaction date",
    "value date"
];
const DESC_ALIASES = [
    "description",
    "narration",
    "transaction details",
    "details"
];
const BALANCE_ALIASES = [
    "balance",
    "balance amt",
    "closing balance"
];
const AMOUNT_ALIASES = [
    "amount",
    "value",
    "withdrawal",
    "deposit",
    "withdrawal amt",
    "deposit amt"
];
const ALL_HEADER_ALIASES = [
    ...DATE_ALIASES,
    ...DESC_ALIASES,
    ...BALANCE_ALIASES,
    ...AMOUNT_ALIASES
];
// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function parseAmount(raw) {
    if (raw === undefined || raw === null || raw === "") return null;
    const cleaned = String(raw).replace(/[₹,]/g, "") // remove currency + commas
    .trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}
function parseDate(raw) {
    if (!raw) return null;
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    return null;
}
function cleanTransactions(raw, account = "default") {
    const transactions = [];
    let errors = 0;
    for (const row of raw){
        try {
            // 🔍 DEBUG (remove later if you want)
            // console.log(Object.keys(row));
            // ─────────────────────────────
            // ✅ DATE (force VALUE DATE)
            // ─────────────────────────────
            const dateKey = Object.keys(row).find((k)=>k.toLowerCase().includes("value date"));
            let parsedDate = dateKey ? parseDate(row[dateKey]) : null;
            if (!parsedDate) {
                errors++;
                continue;
            }
            // ─────────────────────────────
            // ✅ DESCRIPTION
            // ─────────────────────────────
            const descKey = Object.keys(row).find((k)=>k.toLowerCase().includes("description") || k.toLowerCase().includes("details") || k.toLowerCase().includes("narration"));
            const description = descKey ? String(row[descKey]).trim() : "Unknown";
            if (!description || description === "Unknown") {
                errors++;
                continue;
            }
            // ─────────────────────────────
            // 🔥 FINAL FIX: AMOUNT PARSING
            // ─────────────────────────────
            const debitKey = Object.keys(row).find((k)=>k.toLowerCase().includes("withdraw"));
            const creditKey = Object.keys(row).find((k)=>k.toLowerCase().includes("deposit"));
            const debit = debitKey ? parseAmount(row[debitKey]) : null;
            const credit = creditKey ? parseAmount(row[creditKey]) : null;
            let amount = null;
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
            const balanceKey = Object.keys(row).find((k)=>k.toLowerCase().includes("balance"));
            let balance = undefined;
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
                balance
            });
        } catch (e) {
            errors++;
        }
    }
    return {
        transactions,
        errors
    };
}
function detectDuplicates(transactions) {
    const seen = new Set();
    return transactions.filter((tx)=>{
        const key = `${tx.date}|${tx.descriptionCleaned}|${tx.amount.toFixed(2)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
function detectTransfers(transactions) {
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
        "from self"
    ];
    return transactions.filter((tx)=>{
        const desc = tx.descriptionCleaned;
        return !TRANSFER_KEYWORDS.some((kw)=>desc.includes(kw));
    });
}
}),
"[project]/untangle-zero-clutter/lib/parser.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseFile",
    ()=>parseFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/node_modules/xlsx/xlsx.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/lib/cleaner.ts [app-route] (ecmascript)");
;
;
/**
 * Scans a 2D array of strings to find the row that most likely contains
 * the table headers (Date, Description, Amount, etc.)
 */ function findHeaderIndex(rows) {
    let bestIndex = 0;
    let maxMatches = 0;
    if (!rows || rows.length === 0) return 0;
    // Scan first 50 rows (most bank statements have metadata in top 10-20 lines)
    for(let i = 0; i < Math.min(rows.length, 50); i++){
        const rawRow = rows[i];
        if (!Array.isArray(rawRow)) continue;
        const row = rawRow.map((c)=>String(c || "").toLowerCase().trim());
        let matches = 0;
        for (const cell of row){
            if (!cell) continue;
            // Check if cell contains or is contained by any known alias
            if (__TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ALL_HEADER_ALIASES"].some((alias)=>cell.includes(alias.toLowerCase()) || alias.toLowerCase().includes(cell))) {
                matches++;
            }
        }
        // Standard requirement: At least 3 matching headers to be considered a table
        if (matches > maxMatches && matches >= 3) {
            maxMatches = matches;
            bestIndex = i;
        }
    }
    return bestIndex;
}
// ---------------------------------------------------------------------------
// Lightweight CSV parser — no external dependency needed
// Handles quoted fields, commas inside quotes, Windows/Unix line endings
// ---------------------------------------------------------------------------
function parseCSVText(text) {
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
    if (lines.length < 2) return [];
    const matrix = lines.map((line)=>splitCSVLine(line));
    if (matrix.length === 0) return [];
    const headerIdx = findHeaderIndex(matrix);
    const headers = matrix[headerIdx];
    if (!headers || headers.length === 0) return [];
    const rows = [];
    for(let i = headerIdx + 1; i < matrix.length; i++){
        const values = matrix[i];
        if (!values || values.length === 0 || values.length === 1 && !values[0]) continue;
        const row = {};
        headers.forEach((header, idx)=>{
            if (!header) return;
            const clean = header.trim().replace(/^"|"$/g, "");
            if (clean) {
                row[clean] = values[idx]?.trim().replace(/^"|"$/g, "") ?? "";
            }
        });
        rows.push(row);
    }
    return rows;
}
function splitCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for(let i = 0; i < line.length; i++){
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
// ---------------------------------------------------------------------------
// JSON parser — accepts array or { transactions: [...] } shapes
// ---------------------------------------------------------------------------
function parseJSONText(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch  {
        throw new Error("Invalid JSON format.");
    }
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "object" && parsed !== null) {
        const obj = parsed;
        for (const key of [
            "transactions",
            "data",
            "records",
            "rows",
            "items"
        ]){
            if (Array.isArray(obj[key])) return obj[key];
        }
        return [
            parsed
        ];
    }
    throw new Error("JSON must be an array of transactions or { transactions: [...] }");
}
// ---------------------------------------------------------------------------
// Excel parser — extracts first sheet as JSON
// ---------------------------------------------------------------------------
function parseExcelBuffer(buffer) {
    const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["read"](buffer, {
        type: "array",
        cellDates: true
    });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    // Convert to 2D array first to find headers
    const matrix = __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet, {
        header: 1,
        defval: ""
    });
    const headerIdx = findHeaderIndex(matrix.map((row)=>row.map((cell)=>String(cell))));
    // Now convert to objects starting from the detected header row
    const data = __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet, {
        range: headerIdx,
        defval: "",
        raw: false,
        dateNF: "yyyy-mm-dd"
    });
    return data;
}
function parseFile(content, filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") {
        if (typeof content === "string") throw new Error("Expected ArrayBuffer for Excel files");
        return parseExcelBuffer(content);
    }
    if (typeof content !== "string") throw new Error("Expected string for text files");
    if (ext === "json") return parseJSONText(content);
    return parseCSVText(content);
}
}),
"[project]/untangle-zero-clutter/lib/categorizer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "categorize",
    ()=>categorize,
    "categorizeAll",
    ()=>categorizeAll,
    "detectRecurringPatterns",
    ()=>detectRecurringPatterns,
    "getCategoryCounts",
    ()=>getCategoryCounts
]);
const CATEGORY_RULES = [
    {
        category: "Rent & Housing",
        type: "recurring",
        keywords: [
            "rent",
            "landlord",
            "housing",
            "pg ",
            "paying guest",
            "accommodation",
            "hostel",
            "lease",
            "maintenance society",
            "society fee"
        ]
    },
    {
        category: "Utilities & Bills",
        type: "recurring",
        keywords: [
            "electricity",
            "water bill",
            "gas bill",
            "internet",
            "wifi",
            "broadband",
            "airtel",
            "jio",
            "bsnl",
            "vodafone",
            "vi ",
            "idea",
            "recharge",
            "mobile bill",
            "dth",
            "tatasky",
            "dish tv",
            "postpaid",
            "insurance",
            "lic ",
            "premium",
            "pipe gas"
        ]
    },
    {
        category: "Subscriptions",
        type: "recurring",
        keywords: [
            "netflix",
            "spotify",
            "prime video",
            "hotstar",
            "disney",
            "youtube premium",
            "jiocinema",
            "mxplayer",
            "zee5",
            "sonyliv",
            "apple music",
            "apple one",
            "google one",
            "dropbox",
            "adobe",
            "notion",
            "slack",
            "github"
        ]
    },
    {
        category: "Savings & Investment",
        type: "recurring",
        keywords: [
            "mutual fund",
            " sip",
            "zerodha",
            "groww",
            "upstox",
            "coin ",
            "equity",
            "stocks",
            "ppf",
            " nps ",
            " fd ",
            "fixed deposit",
            "recurring deposit",
            " rd ",
            "smallcase",
            "etf"
        ]
    },
    {
        category: "Food & Dining",
        type: "discretionary",
        keywords: [
            "swiggy",
            "zomato",
            "restaurant",
            "cafe",
            "coffee",
            "mcdonald",
            "kfc",
            "domino",
            "pizza",
            "burger",
            "subway",
            "biryani",
            "dhaba",
            "dunzo",
            "blinkit",
            "zepto",
            "instamart",
            "grocery",
            "supermarket",
            "bigbasket",
            "reliance fresh",
            "dmart",
            "nature basket",
            "canteen",
            "mess ",
            "food",
            "bakery",
            "sweet shop",
            "haldiram",
            "starbucks"
        ]
    },
    {
        category: "Transport",
        type: "discretionary",
        keywords: [
            "uber",
            "ola",
            "rapido",
            "metro",
            " bus ",
            "auto ",
            "cab ",
            "petrol",
            "fuel",
            "diesel",
            "hp pump",
            "indian oil",
            "bharat petroleum",
            "irctc",
            "train",
            "railway",
            "redbus",
            "bus ticket",
            "indigo",
            "air india",
            "vistara",
            "spicejet",
            "flight",
            "airport",
            "parking",
            "toll",
            "fastag"
        ]
    },
    {
        category: "Shopping",
        type: "discretionary",
        keywords: [
            "amazon",
            "flipkart",
            "myntra",
            "ajio",
            "nykaa",
            "meesho",
            "snapdeal",
            "paytm mall",
            "shopsy",
            " mall",
            "store",
            "clothing",
            "fashion",
            "shoes",
            "electronics",
            "croma",
            "reliance digital"
        ]
    },
    {
        category: "Entertainment",
        type: "discretionary",
        keywords: [
            "cinema",
            "pvr",
            "inox",
            "bookmyshow",
            "gaming",
            "steam",
            "playstation",
            "xbox",
            "concert",
            "event ticket"
        ]
    },
    {
        category: "Health & Medical",
        type: "discretionary",
        keywords: [
            "pharmacy",
            "medical",
            "hospital",
            "clinic",
            "doctor",
            "medicine",
            "medplus",
            "apollo",
            "1mg",
            "pharmeasy",
            "netmeds",
            "lab test",
            "diagnostic",
            "dentist",
            "health",
            "gym",
            "fitness",
            "cult.fit"
        ]
    },
    {
        category: "Education",
        type: "discretionary",
        keywords: [
            "udemy",
            "coursera",
            "linkedin learning",
            "unacademy",
            "byju",
            "college fee",
            "tuition",
            "coaching",
            "book",
            "notebook",
            "stationery",
            "kindle",
            "audible",
            "o'reilly"
        ]
    },
    {
        category: "Income",
        type: "discretionary",
        keywords: [
            "salary",
            "stipend",
            "payroll",
            "freelance",
            "payment received",
            "credit from",
            "neft cr",
            "imps cr",
            "transfer credit",
            "interest credit",
            "cashback",
            "refund",
            "reversal",
            "dividend"
        ]
    },
    {
        category: "ATM & Cash",
        type: "discretionary",
        keywords: [
            "atm",
            "cash withdrawal",
            "cdm",
            "cash deposit"
        ]
    }
];
function categorize(tx) {
    const desc = tx.description.toLowerCase();
    const merchant = tx.merchant.toLowerCase();
    // Priority 1: Merchant/Description based matching
    for (const rule of CATEGORY_RULES){
        if (rule.keywords.some((kw)=>merchant.includes(kw.toLowerCase()) || desc.includes(kw.toLowerCase()))) {
            return {
                type: rule.type,
                category: rule.category
            };
        }
    }
    // Priority 2: Income fallback
    if (tx.amount > 0) {
        return {
            type: "discretionary",
            category: "Income"
        };
    }
    return {
        type: "discretionary",
        category: "Other"
    };
}
function categorizeAll(transactions) {
    return transactions.map((tx)=>{
        const { type, category } = categorize(tx);
        return {
            ...tx,
            type,
            category
        };
    });
}
function getCategoryCounts(transactions) {
    return transactions.reduce((acc, tx)=>{
        acc[tx.category] = (acc[tx.category] ?? 0) + 1;
        return acc;
    }, {});
}
// ─── Recurring Pattern Detection ───────────────────────────────────────────
// Direct port of Replit's detectRecurringPatterns().
// Groups transactions by description stem, checks for regular intervals.
function normalizeDesc(desc) {
    return desc.toLowerCase().replace(/[0-9]{4,}/g, "") // strip long numbers (ref IDs)
    .replace(/\s+/g, " ").trim();
}
function detectRecurringPatterns(transactions) {
    // Only look at expenses
    const expenses = transactions.filter((t)=>t.amount < 0);
    // Group by normalized description
    const groups = new Map();
    for (const tx of expenses){
        const key = normalizeDesc(tx.description);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(tx);
    }
    const patterns = [];
    for (const [, txList] of groups){
        if (txList.length < 2) continue;
        const sorted = [
            ...txList
        ].sort((a, b)=>a.date.localeCompare(b.date));
        const amounts = sorted.map((t)=>Math.abs(t.amount));
        const avgAmount = amounts.reduce((s, a)=>s + a, 0) / amounts.length;
        // Check interval consistency
        const intervals = [];
        for(let i = 1; i < sorted.length; i++){
            const days = Math.round((new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / 86400000);
            intervals.push(days);
        }
        const avgInterval = intervals.reduce((s, d)=>s + d, 0) / intervals.length;
        const isMonthly = avgInterval >= 25 && avgInterval <= 35;
        const isWeekly = avgInterval >= 5 && avgInterval <= 9;
        if (!isMonthly && !isWeekly) continue;
        const frequency = isMonthly ? "monthly" : "weekly";
        const lastDate = new Date(sorted[sorted.length - 1].date);
        const nextDate = new Date(lastDate.getTime() + avgInterval * 86400000);
        patterns.push({
            description: sorted[0].description,
            category: sorted[0].category,
            amount: -Math.round(avgAmount * 100) / 100,
            frequency,
            nextExpected: nextDate.toISOString().split("T")[0]
        });
    }
    return patterns;
}
}),
"[project]/untangle-zero-clutter/lib/calculator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateSummary",
    ()=>calculateSummary,
    "recalculateWithSpend",
    ()=>recalculateWithSpend
]);
// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function round2(n) {
    return Math.round(n * 100) / 100;
}
function daysBetween(a, b) {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
}
function shiftDate(date, days) {
    return new Date(new Date(date).getTime() + days * 86400000).toISOString().slice(0, 10);
}
function calculateSummary(transactions, sessionId = "", currentBalance) {
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
            warning: "No transactions found."
        };
    }
    // ── INCOME & EXPENSES ──────────────────────────────────────
    const incomeTx = transactions.filter((t)=>t.amount > 0);
    const expenseTx = transactions.filter((t)=>t.amount < 0);
    const totalIncome = incomeTx.reduce((s, t)=>s + t.amount, 0);
    const totalExpenses = expenseTx.reduce((s, t)=>s + Math.abs(t.amount), 0);
    // ───────────────────────────────────────────────────────────
    // ✅ REAL BALANCE FIX (MOST IMPORTANT)
    // ───────────────────────────────────────────────────────────
    let effectiveBalance = 0;
    if (currentBalance !== undefined) {
        effectiveBalance = currentBalance;
    } else {
        const sorted = [
            ...transactions
        ].sort((a, b)=>a.date.localeCompare(b.date));
        const lastWithBalance = [
            ...sorted
        ].reverse().find((t)=>t.balance !== undefined);
        if (lastWithBalance?.balance !== undefined) {
            effectiveBalance = lastWithBalance.balance;
        } else {
            // fallback (safe)
            effectiveBalance = transactions.reduce((sum, t)=>sum + t.amount, 0);
            // clamp absurd values
            if (Math.abs(effectiveBalance) > 1e7) {
                effectiveBalance = 0;
            }
        }
    }
    // ── DATE RANGE & DAILY SPEND ───────────────────────────────
    const dates = transactions.map((t)=>t.date).sort();
    const spanDays = daysBetween(dates[0], dates[dates.length - 1]);
    const avgDailySpend = spanDays > 0 ? totalExpenses / spanDays : 0;
    // ───────────────────────────────────────────────────────────
    // ✅ RECURRING (SIMPLIFIED + STABLE)
    // ───────────────────────────────────────────────────────────
    const recurringTx = transactions.filter((t)=>t.type === "recurring" && t.amount < 0);
    // Estimate next 30 days recurring
    let committedExpenses = 0;
    if (recurringTx.length > 0) {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
        const recentRecurring = recurringTx.filter((t)=>t.date >= ninetyDaysAgo);
        committedExpenses = recentRecurring.reduce((s, t)=>s + Math.abs(t.amount), 0) / 3;
    }
    // ───────────────────────────────────────────────────────────
    // ✅ SAFE TO SPEND (FIXED)
    // ───────────────────────────────────────────────────────────
    const safeToSpendPerDay = effectiveBalance > 0 ? (effectiveBalance - committedExpenses) / 30 : 0;
    // ───────────────────────────────────────────────────────────
    // ✅ RUNWAY (FIXED)
    // ───────────────────────────────────────────────────────────
    const runwayDays = effectiveBalance > 0 && avgDailySpend > 0 ? Math.floor(effectiveBalance / avgDailySpend) : 0;
    // ── BREAKDOWN ──────────────────────────────────────────────
    const breakdown = {};
    for (const tx of expenseTx){
        breakdown[tx.category] = round2((breakdown[tx.category] ?? 0) + Math.abs(tx.amount));
    }
    // ── ANOMALIES ──────────────────────────────────────────────
    const anomalyCount = transactions.filter((t)=>t.isAnomaly).length;
    // ── STATUS ─────────────────────────────────────────────────
    const status = runwayDays >= 30 ? "Healthy" : runwayDays >= 14 ? "Warning" : "Critical";
    // ── WARNINGS ───────────────────────────────────────────────
    let warning = null;
    if (effectiveBalance <= 0) warning = "Balance is zero or negative.";
    else if (safeToSpendPerDay <= 0) warning = "Committed expenses exceed balance.";
    else if (runwayDays < 14) warning = "Low runway. Reduce spending.";
    else if (anomalyCount > 0) warning = `${anomalyCount} unusual transactions detected.`;
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
        warning
    };
}
function recalculateWithSpend(summary, newDailySpend) {
    const runwayDays = newDailySpend > 0 ? Math.floor(summary.currentBalance / newDailySpend) : 0;
    const safeToSpendPerDay = Math.min(summary.availableForSpend / 30, newDailySpend);
    const status = runwayDays >= 30 ? "Healthy" : runwayDays >= 14 ? "Warning" : "Critical";
    return {
        runwayDays: Math.max(0, runwayDays),
        safeToSpendPerDay: round2(Math.max(0, safeToSpendPerDay)),
        status
    };
}
}),
"[project]/untangle-zero-clutter/app/api/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/lib/parser.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/lib/cleaner.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$categorizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/lib/categorizer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/lib/calculator.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const HOMEPAGE_PREVIEW_COUNT = 12;
async function POST(req) {
    try {
        // ── Parse multipart ────────────────────────────────────────────────────
        let formData;
        try {
            formData = await req.formData();
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid form data. Send as multipart/form-data."
            }, {
                status: 400
            });
        }
        const file = formData.get("file");
        console.log("FILE RECEIVED:", file);
        if (!file) return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No file provided. Include a 'file' field."
        }, {
            status: 400
        });
        const filename = file.name ?? "upload";
        const ext = filename.split(".").pop()?.toLowerCase();
        const isExcel = [
            "xlsx",
            "xls"
        ].includes(ext ?? "");
        if (![
            "csv",
            "json",
            "xlsx",
            "xls"
        ].includes(ext ?? "")) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unsupported file type. Upload .csv, .json, or .xlsx"
            }, {
                status: 400
            });
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "File too large. Maximum size is 20MB."
            }, {
                status: 413
            });
        }
        // ── Read content ───────────────────────────────────────────────────────
        let content;
        try {
            if (isExcel) {
                content = await file.arrayBuffer();
                console.log("CONTENT TYPE:", typeof content);
                console.log("CONTENT SAMPLE:", content?.slice(0, 100));
            } else {
                content = typeof file.text === "function" ? await file.text() : "";
            }
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Could not read file content."
            }, {
                status: 400
            });
        }
        if (typeof content !== "string" || !content.trim()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "File is empty."
            }, {
                status: 400
            });
        }
        // --- Parse → Clean → Categorize → Calculate ---
        const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$parser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseFile"])(content, filename);
        if (raw.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No rows found. Make sure your file has headers and data."
            }, {
                status: 422
            });
        }
        const { transactions, errors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanTransactions"])(raw);
        if (transactions.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Could not parse any transactions. Ensure your file has date, description, and amount columns."
            }, {
                status: 422
            });
        }
        const categorized = transactions.map((tx)=>{
            const { type, category } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$categorizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["categorize"])(tx);
            return {
                ...tx,
                type,
                category
            };
        });
        const sessionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateSummary"])(categorized, sessionId);
        const categoryCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$categorizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCategoryCounts"])(categorized);
        const dates = categorized.map((t)=>t.date).sort();
        const uploadMeta = {
            transactionCount: categorized.length,
            imported: categorized.length,
            duplicatesRemoved: errors,
            dateRange: {
                from: dates[0],
                to: dates[dates.length - 1]
            },
            categories: categoryCounts
        };
        // const forecast = buildForecast(categorized, summary.currentBalance);
        // // ── Persist to Cloud Storage (Redis) ──────────────────────────────────
        // await Storage.set(sessionId, {
        //     transactions: categorized,
        //     summary,
        //     uploadMeta,
        //     forecast,
        // });
        return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            sessionId,
            summary,
            transactions,
            uploadMeta
        }, {
            status: 200
        });
    } catch (err) {
        const errorBody = err instanceof Error ? {
            message: err.message,
            stack: ("TURBOPACK compile-time truthy", 1) ? err.stack : "TURBOPACK unreachable"
        } : {
            message: String(err)
        };
        console.error("❌ [CRITICAL API ERROR] POST /api/upload:", errorBody);
        return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "The server encountered a problem while processing your file.",
            details: errorBody.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0qsg.l7._.js.map