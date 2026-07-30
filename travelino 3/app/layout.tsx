import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travelino - your local travel companion",
  description: "AI-powered travel companion for Unawatuna, Sri Lanka",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
