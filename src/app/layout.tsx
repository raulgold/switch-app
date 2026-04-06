import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeekSwap - Marketplace de Semanas de Timeshare",
  description: "Troque ou venda suas semanas de timeshare com facilidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.tailwindcss.com" />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
