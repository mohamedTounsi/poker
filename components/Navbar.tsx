"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction } from "../app/actions";
import { Spade, LogOut, History, LayoutDashboard, Trophy, ChevronDown } from "lucide-react";
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
            ? "rgba(10,14,26,0.95)"
            : "rgba(10,14,26,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1f2d45",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="p-2 rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: "rgba(224,48,48,0.15)",
                border: "1px solid rgba(224,48,48,0.3)",
                boxShadow: "0 0 12px rgba(224,48,48,0.2)",
              }}
            >
              <Spade className="w-5 h-5 fill-current text-red-400" />
            </div>
            <span
              className="font-black text-white tracking-tight text-lg hidden sm:block"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              POKER<span className="text-red-400">ZONE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-rajdhani)",
                  letterSpacing: "0.04em",
                  background: isActive(href) ? "rgba(224,48,48,0.12)" : "transparent",
                  color: isActive(href) ? "#f87171" : "#6b7a99",
                  border: isActive(href) ? "1px solid rgba(224,48,48,0.25)" : "1px solid transparent",
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side: Help + User */}
          <div className="flex items-center gap-2">
            <HelpModal />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid #1f2d45",
                }}
              >
                <PlayerAvatar
                  username={user.username}
                  avatarUrl={user.avatarUrl}
                  size="xs"
                />
                <span
                  className="text-sm font-bold text-zinc-200 capitalize hidden sm:block"
                  style={{ fontFamily: "var(--font-rajdhani)" }}
                >
                  {user.username}
                </span>
                {user.role !== "admin" && user.netBalance !== undefined && (
                  <RankBadge netBalance={user.netBalance} showName={false} size="sm" />
                )}
                {user.role === "admin" && (
                  <span
                    className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-lg"
                    style={{
                      background: "rgba(224,48,48,0.15)",
                      color: "#f87171",
                      border: "1px solid rgba(224,48,48,0.3)",
                    }}
                  >
                    ADMIN
                  </span>
                )}
                <ChevronDown
                  className="w-3.5 h-3.5 text-zinc-500 transition-transform duration-200"
                  style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden slide-in-up z-50"
                  style={{
                    background: "#111827",
                    border: "1px solid #1f2d45",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    style={{ fontFamily: "var(--font-rajdhani)" }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Profile
                  </Link>
                  <div style={{ borderTop: "1px solid #1f2d45" }} />
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                      style={{ fontFamily: "var(--font-rajdhani)" }}
                    >
                      <LogOut className="w-4 h-4" />
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
          background: "rgba(10,14,26,0.97)",
          borderTop: "1px solid #1f2d45",
          backdropFilter: "blur(16px)",
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
                color: active ? "#f87171" : "#6b7a99",
                background: active ? "rgba(224,48,48,0.1)" : "transparent",
              }}
            >
              <Icon className="w-5 h-5" />
              <span
                className="text-[9px] font-black tracking-wider uppercase"
                style={{ fontFamily: "var(--font-rajdhani)" }}
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
            style={{ color: "#6b7a99" }}
          >
            <LogOut className="w-5 h-5" />
            <span
              className="text-[9px] font-black tracking-wider uppercase"
              style={{ fontFamily: "var(--font-rajdhani)" }}
            >
              Logout
            </span>
          </button>
        </form>
      </nav>
    </>
  );
}
