import type { Metadata } from "next";
import { Rajdhani, Orbitron } from "next/font/google";
import ThemeInitializer from "../components/ThemeInitializer";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PokerZone — Track. Rank. Dominate.",
  description: "Track poker gameplays, climb the leaderboard, earn medals and unlock ranks with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${orbitron.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col bg-[#0a0e1a] text-zinc-100">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
