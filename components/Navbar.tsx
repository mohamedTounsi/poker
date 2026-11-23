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
  LogOut,
  User,
  X,
  Spade,
} from "lucide-react";
import PlayerAvatar from "./PlayerAvatar";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  // Navigation links for the bottom bar
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/history", label: "History", icon: History },
    { href: "/players", label: "Players", icon: Users },
  ];

  return (
    <>
      {/* Top Bar – Logo + Account */}
      <header className="sticky top-0 z-50 w-full flex items-center justify-between bg-black/90 border-b border-red-950/60 backdrop-blur-2xl px-4 py-2">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-zinc-900 via-black to-red-950 border border-red-600/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.35)]">
            {!logoError ? (
              <Image
                src="/pokerfrerlogo.png"
                alt="POKER FRERE Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain rounded-xl"
                onError={() => setLogoError(true)}
                unoptimized
              />
            ) : (
              <Spade className="w-5 h-5 text-red-500 fill-red-500" />
            )}
          </div>
          <span className="font-black text-lg text-white">POKER FRERE</span>
        </Link>
        {/* Account capsule */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-red-900/50 transition-all cursor-pointer"
          >
            <PlayerAvatar username={user.username} avatarUrl={user.avatarUrl} size="sm" />
            <div className="flex flex-col text-xs text-white">
              <span className="font-bold uppercase">{user.username}</span>
              {user.role === "admin" ? (
                <span className="text-[9px] font-black text-red-400 uppercase mt-0.5">ADMIN</span>
              ) : user.netBalance !== undefined ? (
                <span className={`font-black ${user.netBalance > 0 ? "text-emerald-400" : user.netBalance < 0 ? "text-red-500" : "text-zinc-400"}`}>
                  {user.netBalance > 0 ? "+" : ""}{user.netBalance} TND
                </span>
              ) : null}
            </div>
          </button>
          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-950 border border-red-900/40 p-2 shadow-2xl z-50 backdrop-blur-2xl"
              onClick={() => setUserMenuOpen(false)}
            >
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5"
              >
                <User className="w-4 h-4 text-red-500" />
                My Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/5"
              >
                <User className="w-4 h-4" /> Settings
              </Link>
              <div className="my-1 border-t border-zinc-800" />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/20 border border-red-900/60"
                >
                  <LogOut className="w-4 h-4" /> Exit
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Fixed Navbar – navigation buttons */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around bg-black/90 border-t border-red-950/60 backdrop-blur-2xl py-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs ${active ? "text-red-400" : "text-zinc-400"}`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-red-400" : "text-zinc-400"}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
