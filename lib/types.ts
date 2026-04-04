export interface RawTransaction {
    [key: string]: string | number | undefined;
}

export type TransactionType = "recurring" | "discretionary";

export interface Transaction {
    date: string;
    description: string;
    descriptionCleaned: string;
    merchant: string;
    amount: number; // +income, -expense
    category: string;
    account: string;
    type: "recurring" | "discretionary";
    isAnomaly: boolean;
    anomalyReason: string | null;
    balance?: number;
}

export interface RecurringPattern {
    description: string;
    category: string;
    amount: number;
    frequency: "weekly" | "monthly";
    nextExpected?: string;
}

export interface UploadResponse {
    sessionId: string;
    transactionCount: number;
    imported: number;
    duplicatesRemoved: number;
    dateRange: {
        from: string;
        to: string;
    };
    categories: Record<string, number>;
}

export interface Summary {
    sessionId: string;
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    netFlow: number;
    avgDailySpend: number;
    runwayDays: number;
    safeToSpendPerDay: number;
    committedExpenses: number;
    availableForSpend: number;
    recurringExpensesMonthly: number;
    discretionaryMonthly: number;
    status: "Healthy" | "Warning" | "Critical";
    breakdown: Record<string, number>;
    anomalyCount: number;
    warning: string | null;
}

export interface ForecastDay {
    day: number;
    date: string;
    safeToSpend: number;
    cumulativeSpent: number;
    remainingBalance: number;
}

export interface Forecast {
    currentBalance: number;
    committedExpenses: number;
    availableForSpend: number;
    safeDailySpend: number;
    inflationAdjusted: boolean;
    inflationRate: number;
    days: ForecastDay[];
    warning: string | null;
}

export interface AnalysisSnapshot {
    sessionId: string;
    summary: Summary;
    transactions: Transaction[];
    forecast: Forecast;
    uploadMeta: Omit<UploadResponse, "sessionId">;
}

export interface StorageEntry {
    transactions: Transaction[];
    summary: Omit<Summary, "sessionId">;
    uploadMeta: Omit<UploadResponse, "sessionId">;
    forecast: Forecast;
}
