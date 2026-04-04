import { RawTransaction } from "./types";
import * as xlsx from "xlsx";
import { ALL_HEADER_ALIASES } from "./cleaner";

/**
 * Scans a 2D array of strings to find the row that most likely contains
 * the table headers (Date, Description, Amount, etc.)
 */
function findHeaderIndex(rows: string[][]): number {
    let bestIndex = 0;
    let maxMatches = 0;

    if (!rows || rows.length === 0) return 0;

    // Scan first 50 rows (most bank statements have metadata in top 10-20 lines)
    for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const rawRow = rows[i];
        if (!Array.isArray(rawRow)) continue;

        const row = rawRow.map(c => String(c || "").toLowerCase().trim());
        let matches = 0;

        for (const cell of row) {
            if (!cell) continue;
            // Check if cell contains or is contained by any known alias
            if (ALL_HEADER_ALIASES.some(alias => 
                cell.includes(alias.toLowerCase()) || 
                alias.toLowerCase().includes(cell)
            )) {
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
function parseCSVText(text: string): RawTransaction[] {
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
    if (lines.length < 2) return [];

    const matrix = lines.map(line => splitCSVLine(line));
    if (matrix.length === 0) return [];

    const headerIdx = findHeaderIndex(matrix);
    
    const headers = matrix[headerIdx];
    if (!headers || headers.length === 0) return [];

    const rows: RawTransaction[] = [];

    for (let i = headerIdx + 1; i < matrix.length; i++) {
        const values = matrix[i];
        if (!values || values.length === 0 || (values.length === 1 && !values[0])) continue;

        const row: RawTransaction = {};
        headers.forEach((header, idx) => {
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

function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
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
function parseJSONText(text: string): RawTransaction[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error("Invalid JSON format.");
    }

    if (Array.isArray(parsed)) return parsed as RawTransaction[];

    if (typeof parsed === "object" && parsed !== null) {
        const obj = parsed as Record<string, unknown>;
        for (const key of ["transactions", "data", "records", "rows", "items"]) {
            if (Array.isArray(obj[key])) return obj[key] as RawTransaction[];
        }
        return [parsed as RawTransaction];
    }

    throw new Error("JSON must be an array of transactions or { transactions: [...] }");
}

// ---------------------------------------------------------------------------
// Excel parser — extracts first sheet as JSON
// ---------------------------------------------------------------------------
function parseExcelBuffer(buffer: ArrayBuffer): RawTransaction[] {
    const workbook = xlsx.read(buffer, { type: "array", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to 2D array first to find headers
    const matrix = xlsx.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: "" });
    const headerIdx = findHeaderIndex(matrix.map(row => row.map(cell => String(cell))));

    // Now convert to objects starting from the detected header row
    const data = xlsx.utils.sheet_to_json<RawTransaction>(worksheet, { 
        range: headerIdx,
        defval: "",
        raw: false,
        dateNF: "yyyy-mm-dd"
    });
    
    return data;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function parseFile(content: string | ArrayBuffer, filename: string): RawTransaction[] {
    const ext = filename.split(".").pop()?.toLowerCase();
    
    if (ext === "xlsx" || ext === "xls") {
        if (typeof content === "string") throw new Error("Expected ArrayBuffer for Excel files");
        return parseExcelBuffer(content);
    }

    if (typeof content !== "string") throw new Error("Expected string for text files");
    if (ext === "json") return parseJSONText(content);
    return parseCSVText(content);
}