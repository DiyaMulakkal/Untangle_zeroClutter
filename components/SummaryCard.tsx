interface Props {
    label: string;
    value: string;
    sub?: string;
    highlight?: boolean;
    accent?: "green" | "yellow" | "red";
    index?: number;
}

export default function SummaryCard({
    label,
    value,
    sub,
    highlight = false,
    accent,
    index = 0,
}: Props) {
    const accentColor =
        accent === "green" ? "var(--green)"
            : accent === "yellow" ? "var(--yellow)"
                : accent === "red" ? "var(--red)"
                    : highlight ? "var(--green)"
                        : "var(--text)";

    const borderColor =
        highlight || accent
            ? accentColor
            : "var(--border)";

    const bgColor =
        accent === "green" ? "var(--green-dim)"
            : accent === "yellow" ? "var(--yellow-dim)"
                : accent === "red" ? "var(--red-dim)"
                    : "var(--surface)";

    return (
        <div
            className={`fade-up fade-up-${index + 1}`}
            style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
            }}
        >
            <p
                style={{
                    color: "var(--text-muted)",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                }}
            >
                {label}
            </p>
            <p
                style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: accentColor,
                    lineHeight: 1,
                    marginBottom: sub ? "0.4rem" : 0,
                }}
            >
                {value}
            </p>
            {sub && (
                <p style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "0.06em" }}>
                    {sub}
                </p>
            )}
        </div>
    );
}