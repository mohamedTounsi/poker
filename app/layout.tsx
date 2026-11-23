import type { Metadata } from "next";
import ThemeInitializer from "../components/ThemeInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "POKER FRERE — High Stakes Poker Club & Ledger",
  description: "POKER FRERE: Track games, ranks, chips and live poker action.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white overflow-x-hidden selection:bg-red-600 selection:text-white">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
