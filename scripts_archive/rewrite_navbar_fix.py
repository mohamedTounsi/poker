import os

navbar = """"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction } from "../app/actions";
import { Spade, LogOut, History, LayoutDashboard, Trophy, ChevronDown, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import PlayerAvatar from "./PlayerAvatar";
import RankBadge from "./RankBadge";
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
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const navLinks = [
    { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
    { href: "/history", label: "HISTORY", icon: History },
    { href: "/leaderboard", label: "LEADERBOARD", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b-[4px] border-red-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo Area */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-red-600 group-hover:rotate-180 transition-all duration-500">
            <Spade className="w-6 h-6 text-black fill-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white text-2xl tracking-[0.1em] uppercase">Poker<span className="text-red-600">Zone</span></span>
            <span className="text-[10px] text-zinc-400 font-bold tracking-[0.3em]">HIGH STAKES</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm transition-all border-2 ${
                isActive(href) 
                  ? "bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                  : "bg-transparent text-white hover:bg-white hover:text-black border-transparent hover:border-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User Area */}
        <div className="flex items-center gap-4">
          <HelpModal />
          
          <div className="flex items-center gap-3 bg-zinc-900 border-2 border-zinc-800 p-1.5 pr-4 rounded-full">
            <PlayerAvatar username={user.username} avatarUrl={user.avatarUrl} size="sm" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-xs uppercase">{user.username}</span>
              {user.role !== "admin" && user.netBalance !== undefined && (
                <span className={`text-[10px] font-black tracking-wider ${user.netBalance >= 0 ? "text-white" : "text-red-500"}`}>
                  {user.netBalance > 0 ? "+" : ""}{user.netBalance} TND
                </span>
              )}
              {user.role === "admin" && (
                <span className="text-[10px] font-black tracking-wider text-red-500 uppercase">ADMIN</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
"""

with open('components/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(navbar)
