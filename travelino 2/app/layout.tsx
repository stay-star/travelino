import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travelino - dein lokaler Reisebegleiter",
  description: "KI-gestützter Reisebegleiter für Unawatuna, Sri Lanka",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
