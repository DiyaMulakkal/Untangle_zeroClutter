import { RawTransaction } from "./types";
import * as xlsx from "xlsx";

// ---------------------------------------------------------------------------
// Lightweight CSV parser — no external dependency needed
// Handles quoted fields, commas inside quotes, Windows/Unix line endings
// ---------------------------------------------------------------------------
function parseCSVText(text: string): RawTransaction[] {
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
    if (lines.length < 2) return [];

    const headers = splitCSVLine(lines[0]);

    const rows: RawTransaction[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = splitCSVLine(line);
        if (values.length === 0) continue;

        const row: RawTransaction = {};
        headers.forEach((header, idx) => {
            const clean = header.trim().replace(/^"|"$/g, "");
            row[clean] = values[idx]?.trim().replace(/^"|"$/g, "") ?? "";
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
            // Handle escaped quotes ("")
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
        // Try common wrapper keys
        for (const key of ["transactions", "data", "records", "rows", "items"]) {
            if (Array.isArray(obj[key])) return obj[key] as RawTransaction[];
        }
        // Single transaction object
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
    // Convert to JSON array of objects, substituting empty values with "".
    // raw: false ensures cells (especially dates) are formatted as strings.
    const data = xlsx.utils.sheet_to_json<RawTransaction>(worksheet, { 
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
    return parseCSVText(content); // default: treat as CSV
}