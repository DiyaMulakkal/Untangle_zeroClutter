import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
    title: "Runway — Zero-Clutter Financial Forecaster",
    description: "Know your exact runway. Drop messy bank data. Get your safe-to-spend daily limit for the next 30 days.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}