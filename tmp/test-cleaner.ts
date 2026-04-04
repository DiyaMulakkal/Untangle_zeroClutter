import { detectDuplicates, detectTransfers } from "../lib/cleaner";
import { Transaction } from "../lib/types";

const mockTransactions: Transaction[] = [
    {
        date: "2024-01-01",
        description: "Grocery Store",
        descriptionCleaned: "grocery store",
        merchant: "Grocery",
        amount: -50.0,
        account: "default",
        type: "discretionary",
        category: "Food",
        isAnomaly: false,
        anomalyReason: null,
    },
    {
        date: "2024-01-01",
        description: "Grocery Store",
        descriptionCleaned: "grocery store",
        merchant: "Grocery",
        amount: -50.0,
        account: "default",
        type: "discretionary",
        category: "Food",
        isAnomaly: false,
        anomalyReason: null,
    }, // Duplicate
    {
        date: "2024-01-02",
        description: "Internal Transfer to Savings",
        descriptionCleaned: "internal transfer to savings",
        merchant: "Internal",
        amount: -100.0,
        account: "default",
        type: "discretionary",
        category: "Other",
        isAnomaly: false,
        anomalyReason: null,
    }, // Transfer
    {
        date: "2024-01-03",
        description: "Salary Credit",
        descriptionCleaned: "salary credit",
        merchant: "Salary",
        amount: 5000.0,
        account: "default",
        type: "discretionary",
        category: "Income",
        isAnomaly: false,
        anomalyReason: null,
    },
];

console.log("Original count:", mockTransactions.length);

const deduped = detectDuplicates(mockTransactions);
console.log("After deduplication count:", deduped.length);
if (deduped.length !== 3) {
    console.error("❌ Deduplication failed!");
} else {
    console.log("✅ Deduplication passed.");
}

const withoutTransfers = detectTransfers(deduped);
console.log("After transfer removal count:", withoutTransfers.length);
if (withoutTransfers.length !== 2) {
    console.error("❌ Transfer removal failed!");
} else {
    console.log("✅ Transfer removal passed.");
}

if (deduped.length === 3 && withoutTransfers.length === 2) {
    console.log("\n🚀 ALL TESTS PASSED!");
} else {
    process.exit(1);
}
