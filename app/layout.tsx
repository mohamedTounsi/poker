import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeInitializer from "../components/ThemeInitializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poker Tracker - Settle Game Scores",
  description: "Track poker gameplays, borrow/lend histories, and balances with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col transition-colors duration-250 bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
