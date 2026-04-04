import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Untangle — Zero-Clutter Financial Forecaster",
    description: "Know your exact runway. Drop messy bank data. Get your safe-to-spend daily limit for the next 30 days.",
    icons: {
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}