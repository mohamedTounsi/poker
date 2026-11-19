"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "../app/actions";
import {
  LayoutDashboard,
  Trophy,
  History,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Spade,
} from "lucide-react";
import PlayerAvatar from "./PlayerAvatar";
import HelpModal from "./HelpModal";

interface NavbarProps {
  user: {
    username: string;
    role: "admin" | "player";
    avatarUrl?: string | null;
    netBalance?: number;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/history", label: "History", icon: History },
    { href: "/players", label: "Players", icon: Users },
    { href: "/chat", label: "Lounge", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-black/90 border-b border-red-950/60 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name: POKER FRERE */}
        <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-red-950 border border-red-600/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.35)] group-hover:border-red-500 group-hover:scale-105 transition-all">
            {!logoError ? (
              <Image
                src="/pokerfrerlogo.png"
                alt="POKER FRERE Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain rounded-xl"
                onError={() => setLogoError(true)}
                unoptimized
              />
            ) : (
              <Spade className="w-6 h-6 text-red-500 fill-red-500" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                POKER <span className="text-red-600 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">FRERE</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-600/30">
                CLUB
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">
              High Stakes Ledger
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Help, User Capsule, and Quick Exit */}
        <div className="flex items-center gap-2 sm:gap-3">
          <HelpModal />

          {/* User Capsule */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-red-900/50 transition-all cursor-pointer"
            >
              <PlayerAvatar username={user.username} avatarUrl={user.avatarUrl} size="sm" />
              <div className="text-left hidden sm:flex flex-col">
                <span className="text-xs font-bold text-white uppercase leading-none">
                  {user.username}
                </span>
                {user.role === "admin" ? (
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest mt-1">
                    ADMIN
                  </span>
                ) : user.netBalance !== undefined ? (
                  <span
                    className={`text-[10px] font-black font-mono mt-1 ${
                      user.netBalance > 0
                        ? "text-emerald-400"
                        : user.netBalance < 0
                        ? "text-red-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {user.netBalance > 0 ? "+" : ""}
                    {user.netBalance} TND
                  </span>
                ) : null}
              </div>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-950 border border-red-900/40 p-2 shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setUserMenuOpen(false)}
              >
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4 text-red-500" />
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-zinc-400" />
                  Settings
                </Link>
                <div className="my-1 border-t border-zinc-800" />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/20 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Exit / Log Out
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Quick Direct Exit Button (Desktop & Phone) */}
          <form action={logoutAction} className="inline-block">
            <button
              type="submit"
              title="Log out and exit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-red-950/40 hover:bg-red-600/80 text-red-400 hover:text-white border border-red-900/60 hover:border-red-500 text-xs font-bold uppercase transition-all shadow-[0_0_10px_rgba(220,38,38,0.2)] active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </form>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 space-y-2.5 bg-black border-b border-red-950/60 shadow-2xl">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    : "text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-zinc-900">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                Exit & Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
