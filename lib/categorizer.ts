import { Transaction, TransactionType, RecurringPattern } from "./types";

// ─── Category + Type Rules ──────────────────────────────────────────────────
// Direct port of Replit's categorize() with extended Indian keywords.
// Order matters — first match wins.

interface CategoryRule {
    category: string;
    type: TransactionType;
    keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
    {
        category: "Rent & Housing",
        type: "recurring",
        keywords: [
            "rent", "landlord", "housing", "pg ", "paying guest",
            "accommodation", "hostel", "lease", "maintenance society", "society fee",
        ],
    },
    {
        category: "Utilities & Bills",
        type: "recurring",
        keywords: [
            "electricity", "water bill", "gas bill", "internet", "wifi", "broadband",
            "airtel", "jio", "bsnl", "vodafone", "vi ", "idea", "recharge",
            "mobile bill", "dth", "tatasky", "dish tv", "postpaid",
            "insurance", "lic ", "premium", "pipe gas",
        ],
    },
    {
        category: "Subscriptions",
        type: "recurring",
        keywords: [
            "netflix", "spotify", "prime video", "hotstar", "disney", "youtube premium",
            "jiocinema", "mxplayer", "zee5", "sonyliv", "apple music", "apple one",
            "google one", "dropbox", "adobe", "notion", "slack", "github",
        ],
    },
    {
        category: "Savings & Investment",
        type: "recurring",
        keywords: [
            "mutual fund", " sip", "zerodha", "groww", "upstox", "coin ",
            "equity", "stocks", "ppf", " nps ", " fd ", "fixed deposit",
            "recurring deposit", " rd ", "smallcase", "etf",
        ],
    },
    {
        category: "Food & Dining",
        type: "discretionary",
        keywords: [
            "swiggy", "zomato", "restaurant", "cafe", "coffee", "mcdonald", "kfc",
            "domino", "pizza", "burger", "subway", "biryani", "dhaba",
            "dunzo", "blinkit", "zepto", "instamart", "grocery", "supermarket",
            "bigbasket", "reliance fresh", "dmart", "nature basket", "canteen",
            "mess ", "food", "bakery", "sweet shop", "haldiram", "starbucks",
        ],
    },
    {
        category: "Transport",
        type: "discretionary",
        keywords: [
            "uber", "ola", "rapido", "metro", " bus ", "auto ", "cab ",
            "petrol", "fuel", "diesel", "hp pump", "indian oil", "bharat petroleum",
            "irctc", "train", "railway", "redbus", "bus ticket",
            "indigo", "air india", "vistara", "spicejet", "flight", "airport",
            "parking", "toll", "fastag",
        ],
    },
    {
        category: "Shopping",
        type: "discretionary",
        keywords: [
            "amazon", "flipkart", "myntra", "ajio", "nykaa", "meesho",
            "snapdeal", "paytm mall", "shopsy", " mall", "store",
            "clothing", "fashion", "shoes", "electronics", "croma", "reliance digital",
        ],
    },
    {
        category: "Entertainment",
        type: "discretionary",
        keywords: [
            "cinema", "pvr", "inox", "bookmyshow", "gaming", "steam",
            "playstation", "xbox", "concert", "event ticket",
        ],
    },
    {
        category: "Health & Medical",
        type: "discretionary",
        keywords: [
            "pharmacy", "medical", "hospital", "clinic", "doctor", "medicine",
            "medplus", "apollo", "1mg", "pharmeasy", "netmeds", "lab test",
            "diagnostic", "dentist", "health", "gym", "fitness", "cult.fit",
        ],
    },
    {
        category: "Education",
        type: "discretionary",
        keywords: [
            "udemy", "coursera", "linkedin learning", "unacademy", "byju",
            "college fee", "tuition", "coaching", "book", "notebook",
            "stationery", "kindle", "audible", "o'reilly",
        ],
    },
    {
        category: "Income",
        type: "discretionary",
        keywords: [
            "salary", "stipend", "payroll", "freelance", "payment received",
            "credit from", "neft cr", "imps cr", "transfer credit",
            "interest credit", "cashback", "refund", "reversal", "dividend",
        ],
    },
    {
        category: "ATM & Cash",
        type: "discretionary",
        keywords: ["atm", "cash withdrawal", "cdm", "cash deposit"],
    },
];

// ─── Categorize a single transaction ───────────────────────────────────────

export function categorize(tx: Transaction): { type: TransactionType; category: string } {
    const desc = tx.description.toLowerCase();
    const merchant = tx.merchant.toLowerCase();

    // Priority 1: Merchant/Description based matching
    for (const rule of CATEGORY_RULES) {
<<<<<<< HEAD
        if (rule.keywords.some((kw) =>
            merchant.includes(kw.toLowerCase()) ||
=======
        if (rule.keywords.some((kw) => 
            merchant.includes(kw.toLowerCase()) || 
>>>>>>> 237690f9837c9e4e6a071fc304976e3e3da71848
            desc.includes(kw.toLowerCase())
        )) {
            return { type: rule.type, category: rule.category };
        }
    }

    // Priority 2: Income fallback
    if (tx.amount > 0) {
        return { type: "discretionary", category: "Income" };
    }

    return { type: "discretionary", category: "Other" };
}

// ─── Categorize a list ─────────────────────────────────────────────────────

export function categorizeAll(transactions: Transaction[]): Transaction[] {
    return transactions.map((tx) => {
        const { type, category } = categorize(tx);
        return { ...tx, type, category };
    });
}

// ─── Category count map (for upload response) ──────────────────────────────

export function getCategoryCounts(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce<Record<string, number>>((acc, tx) => {
        acc[tx.category] = (acc[tx.category] ?? 0) + 1;
        return acc;
    }, {});
}

// ─── Recurring Pattern Detection ───────────────────────────────────────────
// Direct port of Replit's detectRecurringPatterns().
// Groups transactions by description stem, checks for regular intervals.

function normalizeDesc(desc: string): string {
    return desc.toLowerCase()
        .replace(/[0-9]{4,}/g, "")  // strip long numbers (ref IDs)
        .replace(/\s+/g, " ")
        .trim();
}

export function detectRecurringPatterns(
    transactions: Transaction[]
): RecurringPattern[] {
    // Only look at expenses
    const expenses = transactions.filter((t) => t.amount < 0);

    // Group by normalized description
    const groups = new Map<string, Transaction[]>();
    for (const tx of expenses) {
        const key = normalizeDesc(tx.description);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(tx);
    }

    const patterns: RecurringPattern[] = [];

    for (const [, txList] of groups) {
        if (txList.length < 2) continue;

        const sorted = [...txList].sort((a, b) => a.date.localeCompare(b.date));
        const amounts = sorted.map((t) => Math.abs(t.amount));
        const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;

        // Check interval consistency
        const intervals: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
            const days = Math.round(
                (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / 86400000
            );
            intervals.push(days);
        }

        const avgInterval = intervals.reduce((s, d) => s + d, 0) / intervals.length;
        const isMonthly = avgInterval >= 25 && avgInterval <= 35;
        const isWeekly = avgInterval >= 5 && avgInterval <= 9;

        if (!isMonthly && !isWeekly) continue;

        const frequency: RecurringPattern["frequency"] = isMonthly ? "monthly" : "weekly";
        const lastDate = new Date(sorted[sorted.length - 1].date);
        const nextDate = new Date(lastDate.getTime() + avgInterval * 86400000);

        patterns.push({
            description: sorted[0].description,
            category: sorted[0].category,
            amount: -Math.round(avgAmount * 100) / 100,
            frequency,
            nextExpected: nextDate.toISOString().split("T")[0],
        });
    }

    return patterns;
<<<<<<< HEAD
}
=======
}
>>>>>>> 237690f9837c9e4e6a071fc304976e3e3da71848
