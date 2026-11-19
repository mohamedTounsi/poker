"use client";

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
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/history", label: "History", icon: History },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <>
      {/* Desktop / Top Navbar */}
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(8,8,8,0.97)"
            : "rgba(10,10,10,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid #1f1f1f" : "1px solid #161616",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.8)" : "none",
        }}
      >
        {/* Top red accent line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent 0%, #dc2626 40%, #ef4444 50%, #dc2626 60%, transparent 100%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
                boxShadow: "0 0 16px rgba(220,38,38,0.4)",
              }}
            >
              <Spade className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className="font-black text-white tracking-tight text-base leading-none"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                POKER<span className="text-red-500">ZONE</span>
              </span>
              <span className="text-[8px] tracking-[0.2em] text-neutral-600 uppercase" style={{ fontFamily: "var(--font-orbitron)" }}>
                PREMIUM
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: isActive(href) ? "rgba(220,38,38,0.1)" : "transparent",
                  color: isActive(href) ? "#ef4444" : "#525252",
                  border: isActive(href) ? "1px solid rgba(220,38,38,0.25)" : "1px solid transparent",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <HelpModal />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer group"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #222",
                }}
              >
                <PlayerAvatar
                  username={user.username}
                  avatarUrl={user.avatarUrl}
                  size="xs"
                />
                <div className="hidden sm:flex flex-col items-start">
                  <span
                    className="text-xs font-bold text-neutral-200 capitalize leading-none"
                    style={{ fontFamily: "var(--font-rajdhani)" }}
                  >
                    {user.username}
                  </span>
                  {user.role !== "admin" && user.netBalance !== undefined && (
                    <span className={`text-[10px] font-bold leading-none mt-0.5 ${user.netBalance >= 0 ? "text-white" : "text-red-500"}`}>
                      {user.netBalance > 0 ? "+" : ""}{user.netBalance} TND
                    </span>
                  )}
                </div>
                {user.role !== "admin" && user.netBalance !== undefined && (
                  <RankBadge netBalance={user.netBalance} showName={false} size="sm" />
                )}
                {user.role === "admin" && (
                  <span
                    className="text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(220,38,38,0.15)",
                      color: "#ef4444",
                      border: "1px solid rgba(220,38,38,0.3)",
                    }}
                  >
                    ADMIN
                  </span>
                )}
                <ChevronDown
                  className="w-3 h-3 text-neutral-600 transition-transform duration-200"
                  style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden slide-in-down z-50"
                  style={{
                    background: "#111",
                    border: "1px solid #222",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(220,38,38,0.05)",
                  }}
                >
                  <div className="px-4 py-3 border-b border-[#1f1f1f]">
                    <p className="text-xs font-black text-white capitalize">{user.username}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                    style={{ fontFamily: "var(--font-rajdhani)" }}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    My Profile
                  </Link>
                  <div className="border-t border-[#1f1f1f]" />
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/8 transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-rajdhani)" }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around px-2 py-2"
        style={{
          background: "rgba(8,8,8,0.97)",
          borderTop: "1px solid #1a1a1a",
          backdropFilter: "blur(20px)",
        }}
      >
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200"
              style={{
                color: active ? "#ef4444" : "#525252",
                background: active ? "rgba(220,38,38,0.08)" : "transparent",
              }}
            >
              <Icon className="w-5 h-5" />
              <span
                className="text-[9px] font-black tracking-wider uppercase"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all cursor-pointer"
            style={{ color: "#525252" }}
          >
            <LogOut className="w-5 h-5" />
            <span
              className="text-[9px] font-black tracking-wider uppercase"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              Logout
            </span>
          </button>
        </form>
      </nav>
    </>
  );
}
