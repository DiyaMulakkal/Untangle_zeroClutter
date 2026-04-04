
"use client";
import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface Props {
    onUpload: (file: File) => void;
    loading: boolean;
}

export default function FileUpload({ onUpload, loading }: Props) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onUpload(file);
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) onUpload(file);
    }

    const borderColor = dragging
        ? "var(--green)"
        : loading
            ? "var(--border-hover)"
            : "var(--border)";

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !loading && inputRef.current?.click()}
            style={{
                border: `1px dashed ${borderColor}`,
                borderRadius: "var(--radius-lg)",
                padding: "3rem 2rem",
                textAlign: "center",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "border-color 0.2s, background 0.2s",
                background: dragging ? "var(--green-dim)" : "transparent",
                userSelect: "none",
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleChange}
                className="sr-only"
                disabled={loading}
            />

            {loading ? (
                <div>
                    <div style={{ color: "var(--green)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
                        PROCESSING
                    </div>
                    <LoadingDots />
                    <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", fontSize: "12px" }}>
                        Parsing and categorizing your transactions...
                    </p>
                </div>
            ) : (
                <div>
                    <div style={{
                        fontSize: "11px",
                        letterSpacing: "0.15em",
                        color: dragging ? "var(--green)" : "var(--text-muted)",
                        marginBottom: "1rem",
                    }}>
                        {dragging ? "DROP TO ANALYZE" : "UPLOAD STATEMENT"}
                    </div>
                    <p style={{ color: "var(--text)", fontSize: "13px", marginBottom: "0.5rem" }}>
                        Drop your file here or click to browse
                    </p>
                    <p style={{ color: "var(--text-dim)", fontSize: "11px" }}>
                        .csv · .json · .xlsx · max 10MB
                    </p>
                    <div style={{ marginTop: "1.5rem" }}>
                        <span style={{
                            display: "inline-block",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "0.4rem 1rem",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            letterSpacing: "0.1em",
                        }}>
                            CHOOSE FILE
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function LoadingDots() {
    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
            {[0, 1, 2, 3].map((i) => (
                <span
                    key={i}
                    style={{
                        display: "inline-block",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "var(--green)",
                        animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}