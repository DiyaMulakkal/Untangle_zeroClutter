export interface RawTransaction {
    [key: string]: string | number | undefined;
}

export interface Transaction {
    date: string;         // ISO format: YYYY-MM-DD
    description: string;
    amount: number;       // positive = credit/income, negative = debit/expense
    category: string;
    balance?: number;     // running balance from bank statement (if available)
}

export interface UploadResponse {
    sessionId: string;
    transactionCount: number;
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
    currentBalance: number;       // actual balance (from statement or computed)
    netCashFlow: number;          // income − expenses over the period
    avgDailySpend: number;
    runwayDays: number;
    safeToSpendPerDay: number;
    status: "Healthy" | "Warning" | "Critical";
    breakdown: Record<string, number>;
}

export interface StorageEntry {
    transactions: Transaction[];
    summary: Omit<Summary, "sessionId">;
    uploadMeta: Omit<UploadResponse, "sessionId">;
}