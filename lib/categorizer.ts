import { Transaction } from "./types";

// ---------------------------------------------------------------------------
// Category rules — ordered by priority (first match wins)
// Add more keywords freely; all matching is case-insensitive substring
// ---------------------------------------------------------------------------
const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
    {
        category: "Rent & Housing",
        keywords: [
            "rent", "landlord", "housing", "pg ", "paying guest", "accommodation",
            "hostel", "lease", "maintenance society", "society fee",
        ],
    },
    {
        category: "Food & Dining",
        keywords: [
            "swiggy", "zomato", "restaurant", "cafe", "coffee", "mcdonald", "kfc",
            "domino", "pizza", "burger", "subway", "biryani", "dhaba", "hotel",
            "dunzo", "blinkit", "zepto", "instamart", "grocery", "supermarket",
            "bigbasket", "reliance fresh", "dmart", "nature basket", "canteen",
            "mess", "food", "bakery", "sweet shop", "haldiram",
        ],
    },
    {
        category: "Transport",
        keywords: [
            "uber", "ola", "rapido", "metro", "bus", "auto", "cab",
            "petrol", "fuel", "diesel", "hp pump", "indian oil", "bharat petroleum",
            "irctc", "train", "railway", "redbus", "bus ticket",
            "indigo", "air india", "vistara", "spicejet", "flight", "airport",
            "parking", "toll", "fastag",
        ],
    },
    {
        category: "Entertainment",
        keywords: [
            "netflix", "spotify", "prime video", "hotstar", "disney", "youtube",
            "cinema", "pvr", "inox", "bookmyshow", "gaming", "steam", "playstation",
            "xbox", "apple music", "jiocinema", "mxplayer", "zee5", "sonyliv",
            "concert", "event ticket",
        ],
    },
    {
        category: "Shopping",
        keywords: [
            "amazon", "flipkart", "myntra", "ajio", "nykaa", "meesho",
            "snapdeal", "paytm mall", "shopsy", "mall", "store", "shop",
            "clothing", "fashion", "shoes", "electronics", "croma", "reliance digital",
        ],
    },
    {
        category: "Health & Medical",
        keywords: [
            "pharmacy", "medical", "hospital", "clinic", "doctor", "medicine",
            "medplus", "apollo", "1mg", "pharmeasy", "netmeds", "lab test",
            "diagnostic", "dentist", "health", "gym", "fitness", "cult.fit",
        ],
    },
    {
        category: "Utilities & Bills",
        keywords: [
            "electricity", "water bill", "gas bill", "internet", "wifi", "broadband",
            "airtel", "jio", "bsnl", "vodafone", "vi ", "idea", "recharge",
            "mobile bill", "dth", "tatasky", "dish tv", "postpaid",
            "insurance", "lic ", "premium", "irda",
        ],
    },
    {
        category: "Education",
        keywords: [
            "udemy", "coursera", "linkedin learning", "unacademy", "byju",
            "college fee", "tuition", "coaching", "book", "notebook",
            "stationery", "amazon kindle", "audible", "o'reilly",
        ],
    },
    {
        category: "Income",
        keywords: [
            "salary", "stipend", "payroll", "freelance", "payment received",
            "credit from", "neft cr", "imps cr", "transfer credit",
            "interest credit", "cashback", "refund", "reversal",
        ],
    },
    {
        category: "Transfers",
        keywords: [
            "upi", "neft", "rtgs", "imps", "transfer to", "transfer from",
            "google pay", "phonepe", "paytm", "bhim", "self transfer",
        ],
    },
    {
        category: "ATM & Cash",
        keywords: ["atm", "cash withdrawal", "cdm", "cash deposit"],
    },
    {
        category: "Savings & Investment",
        keywords: [
            "mutual fund", "sip", "zerodha", "groww", "upstox", "coin ",
            "equity", "stocks", "ppf", "nps ", "fd ", "fixed deposit",
            "recurring deposit", "rd ", "smallcase",
        ],
    },
];

// ---------------------------------------------------------------------------
// Categorize a list of transactions (mutates category field)
// ---------------------------------------------------------------------------
export function categorize(transactions: Transaction[]): Transaction[] {
    return transactions.map((txn) => {
        const desc = txn.description.toLowerCase();

        for (const rule of CATEGORY_RULES) {
            if (rule.keywords.some((kw) => desc.includes(kw.toLowerCase()))) {
                return { ...txn, category: rule.category };
            }
        }

        // Auto-tag income by positive amount as a fallback
        if (txn.amount > 0) {
            return { ...txn, category: "Income" };
        }

        return txn; // remains "Uncategorized"
    });
}

// ---------------------------------------------------------------------------
// Get category count map (for upload response)
// ---------------------------------------------------------------------------
export function getCategoryCounts(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce<Record<string, number>>((acc, txn) => {
        acc[txn.category] = (acc[txn.category] ?? 0) + 1;
        return acc;
    }, {});
}