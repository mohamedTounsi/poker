"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction } from "../app/actions";
import { Spade, LogOut, History, LayoutDashboard, User, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user: {
    username: string;
    role: "admin" | "player";
  };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const currentTheme = savedTheme || "dark";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 dark:border-red-500/40 rounded-lg text-red-650 dark:text-red-500 transition-all duration-300 group-hover:bg-red-550 group-hover:text-white">
            <Spade className="w-5 h-5 fill-current" />
          </div>
          <span className="font-black text-zinc-950 dark:text-white tracking-tight text-lg transition-colors">
            Poker<span className="text-red-600 dark:text-red-500">Tracker</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/dashboard")
                ? "bg-zinc-100 dark:bg-zinc-900 text-red-650 dark:text-red-500 border border-zinc-250 dark:border-zinc-800"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/history")
                ? "bg-zinc-100 dark:bg-zinc-900 text-red-650 dark:text-red-500 border border-zinc-250 dark:border-zinc-800"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <History className="w-4 h-4" />
            Match History
          </Link>
        </nav>

        {/* User Stats & Mode Selector */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-805 border border-zinc-200 dark:border-zinc-850 rounded-xl transition-all duration-300 cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-800" />}
            </button>
          )}

          {/* User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl">
            <User className="w-4 h-4 text-red-600 dark:text-red-500" />
            <span className="text-sm font-bold text-zinc-850 dark:text-zinc-200 capitalize">{user.username}</span>
            <span className="text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {user.role}
            </span>
          </div>

          {/* Sign Out Button */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/20 border border-zinc-200 dark:border-zinc-850 hover:border-red-200 dark:hover:border-red-900/30 text-zinc-500 hover:text-red-650 dark:text-zinc-400 dark:hover:text-red-400 rounded-xl transition-all duration-300 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="flex md:hidden border-t border-zinc-200 dark:border-zinc-900 h-11 bg-zinc-50 dark:bg-zinc-950 items-center justify-around text-xs font-semibold">
        <Link
          href="/dashboard"
          className={`flex items-center gap-1 py-2 px-4 ${
            isActive("/dashboard") ? "text-red-600 dark:text-red-500 font-bold" : "text-zinc-500"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <Link
          href="/history"
          className={`flex items-center gap-1 py-2 px-4 ${
            isActive("/history") ? "text-red-600 dark:text-red-500 font-bold" : "text-zinc-500"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Match History
        </Link>
      </div>
    </header>
  );
}
