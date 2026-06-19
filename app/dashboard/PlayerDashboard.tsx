"use client";

import { useActionState, useRef, useState } from "react";
import { changePasswordAction } from "../actions";
import { formatTnd } from "../../lib/utils";
import { getRankInfo } from "../../lib/rankUtils";
import { Key, TrendingUp, TrendingDown, Award, Loader2, ShieldCheck, Camera, ChevronDown, ChevronUp } from "lucide-react";
import PlayerAvatar from "../../components/PlayerAvatar";
import RankBadge from "../../components/RankBadge";
import PerformanceChart from "../../components/PerformanceChart";

interface PlayerDashboardProps {
  currentUser: { username: string };
  myUser: any;
  myGames: any[];
  myStats: {
    netBalance: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
  };
}

export default function PlayerDashboard({
  currentUser,
  myUser,
  myGames,
  myStats,
}: PlayerDashboardProps) {
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState(
    changePasswordAction,
    null
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(myUser?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expandable match history
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const rank = getRankInfo(myStats.netBalance);


  const chartData = (() => {
    let running = 0;
    const result = [];
    const reversedGames = [...myGames].reverse();
    for (let i = 0; i < reversedGames.length; i++) {
      const game = reversedGames[i];
      const entry = game.players.find((p: any) => p.username === currentUser.username);
      running += entry?.score || 0;
      result.push({
        label: `G${i + 1}`,
        balance: running,
        date: new Date(game.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return result;
  })();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Max 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setUploadError(data.error);
      } else {
        setAvatarUrl(data.url);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card + Rank */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Identity */}
        <div className="game-card p-6 flex flex-col items-center gap-4 text-center">
          {/* Avatar upload */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <PlayerAvatar
              username={currentUser.username}
              avatarUrl={avatarUrl}
              size="xxl"
              showRing={true}
              ringColor={rank.glowColor.replace(/,[\d.]+\)/, ", 1)").replace("rgba", "rgb")}
            />
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          {uploadError && (
            <p className="text-xs text-red-400 font-bold">{uploadError}</p>
          )}

          <div>
            <h2
              className="text-xl font-black text-white capitalize"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              {currentUser.username}
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Click avatar to change photo</p>
          </div>

          {/* Rank Badge with Progress */}
          <div className="w-full">
            <RankBadge netBalance={myStats.netBalance} showProgress={true} size="lg" />
          </div>


        </div>

        {/* Stats + Chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Net Balance",
                value: formatTnd(myStats.netBalance),
                icon: myStats.netBalance >= 0 ? TrendingUp : TrendingDown,
                color: myStats.netBalance > 0 ? "#10b981" : myStats.netBalance < 0 ? "#ef4444" : "#6b7a99",
                suit: "♥",
              },
              {
                label: "Games Played",
                value: myStats.gamesPlayed,
                icon: Award,
                color: "#f5c518",
                suit: "♠",
              },
              {
                label: "Wins",
                value: myStats.wins,
                icon: TrendingUp,
                color: "#10b981",
                suit: "♦",
              },
              {
                label: "Losses",
                value: myStats.losses,
                icon: TrendingDown,
                color: "#ef4444",
                suit: "♣",
              },
            ].map(({ label, value, color, suit }) => (
              <div
                key={label}
                className="relative game-card p-4 text-center overflow-hidden"
              >
                <div className="absolute top-2 left-2 text-xs font-bold select-none opacity-30" style={{ color }}>
                  {suit}
                </div>
                <div className="absolute bottom-2 right-2 text-xs font-bold select-none opacity-30 rotate-180" style={{ color }}>
                  {suit}
                </div>
                <p className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2"
                  style={{ fontFamily: "var(--font-rajdhani)" }}>
                  {label}
                </p>
                <p
                  className="text-2xl font-black font-mono"
                  style={{ color, fontFamily: "var(--font-orbitron)" }}
                >
                  {typeof value === "number" && label === "Net Balance"
                    ? (myStats.netBalance > 0 ? "+" : "") + value
                    : value}
                </p>
              </div>
            ))}
          </div>

          {/* Performance chart */}
          <div className="game-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span
                className="text-xs font-black tracking-widest uppercase text-zinc-400"
                style={{ fontFamily: "var(--font-rajdhani)" }}
              >
                Balance Curve
              </span>
            </div>
            <PerformanceChart data={chartData} height={160} />
          </div>
        </div>
      </div>

      {/* Match History (expandable cards) */}
      <div className="game-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
              MATCH HISTORY
            </h2>
            <p className="text-zinc-500 text-xs font-medium">Click a game to expand details</p>
          </div>
        </div>

        {myGames.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm font-medium">
            No games yet. Get playing! 🃏
          </div>
        ) : (
          <div className="space-y-3">
            {myGames.map((game) => {
              const myEntry = game.players.find((p: any) => p.username === currentUser.username);
              const myScore = myEntry?.score || 0;
              const isPos = myScore > 0;
              const isNeg = myScore < 0;
              const isExpanded = expandedGame === game._id;

              return (
                <div key={game._id} className="match-card">
                  <div
                    className="match-card-header"
                    onClick={() => setExpandedGame(isExpanded ? null : game._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                        style={{
                          background: isPos ? "rgba(16,185,129,0.15)" : isNeg ? "rgba(224,48,48,0.15)" : "rgba(255,255,255,0.05)",
                          color: isPos ? "#10b981" : isNeg ? "#ef4444" : "#6b7a99",
                          border: `1px solid ${isPos ? "rgba(16,185,129,0.3)" : isNeg ? "rgba(224,48,48,0.3)" : "#1f2d45"}`,
                        }}
                      >
                        {isPos ? "W" : isNeg ? "L" : "D"}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>
                          {new Date(game.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-zinc-500 font-medium">
                          {game.players.length} players · {game.players.map((p: any) => p.username).join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-base font-black font-mono ${isPos ? "text-emerald-400" : isNeg ? "text-red-400" : "text-zinc-500"}`}
                        style={{ fontFamily: "var(--font-orbitron)" }}
                      >
                        {isPos ? "+" : ""}{myScore} TND
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="match-card-body space-y-4">
                      <div style={{ borderTop: "1px solid #1f2d45", marginBottom: "16px" }} />
                      {/* All players scorecard */}
                      <div>
                        <p className="section-label mb-2">Scorecard</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[...game.players]
                            .sort((a: any, b: any) => b.score - a.score)
                            .map((player: any) => {
                              const isW = player.score > 0;
                              const isL = player.score < 0;
                              const isMe = player.username === currentUser.username;
                              return (
                                <div
                                  key={player.userId}
                                  className="flex items-center justify-between p-2.5 rounded-lg"
                                  style={{
                                    background: isMe ? "rgba(245,197,24,0.05)" : "rgba(255,255,255,0.02)",
                                    border: isMe ? "1px solid rgba(245,197,24,0.2)" : "1px solid #1f2d45",
                                  }}
                                >
                                  <span className="text-sm font-bold text-white capitalize truncate pr-2"
                                    style={{ fontFamily: "var(--font-rajdhani)" }}>
                                    {player.username}{isMe ? " 👤" : ""}
                                  </span>
                                  <span className={`text-xs font-black font-mono ${isW ? "text-emerald-400" : isL ? "text-red-400" : "text-zinc-500"}`}>
                                    {player.score > 0 ? "+" : ""}{player.score}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Transactions */}
                      {game.transactions.length > 0 && (
                        <div>
                          <p className="section-label mb-2">Transactions ({game.transactions.length})</p>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {game.transactions.map((tx: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1f2d45" }}
                              >
                                <span className="text-zinc-400">
                                  <span className="text-red-400 font-bold capitalize">{tx.toUser}</span>
                                  {" borrowed "}
                                  <span className="text-white font-mono font-bold">{formatTnd(tx.amount)}</span>
                                  {" from "}
                                  <span className="text-zinc-200 font-bold capitalize">{tx.fromUser}</span>
                                </span>
                                <span className="text-zinc-600 font-mono ml-2 shrink-0">
                                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="game-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
              SECURITY
            </h2>
            <p className="text-zinc-500 text-xs font-medium">Change your account password</p>
          </div>
        </div>

        <form action={passwordFormAction} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold tracking-widest uppercase mb-2 text-zinc-500"
              style={{ fontFamily: "var(--font-rajdhani)" }}
              htmlFor="currentPassword"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              placeholder="Enter current password"
              className="game-input w-full px-3 py-2.5 text-sm font-semibold"
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold tracking-widest uppercase mb-2 text-zinc-500"
              style={{ fontFamily: "var(--font-rajdhani)" }}
              htmlFor="newPassword"
            >
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              placeholder="At least 6 characters"
              className="game-input w-full px-3 py-2.5 text-sm font-semibold"
            />
          </div>

          {passwordState?.error && (
            <div
              className="text-xs font-bold p-2.5 rounded-xl text-center"
              style={{ background: "rgba(224,48,48,0.1)", border: "1px solid rgba(224,48,48,0.3)", color: "#f87171" }}
            >
              {passwordState.error}
            </div>
          )}
          {passwordState?.success && (
            <div
              className="text-xs font-bold p-2.5 rounded-xl text-center flex items-center justify-center gap-1"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
            >
              <ShieldCheck className="w-4 h-4" />
              {passwordState.success}
            </div>
          )}

          <button
            type="submit"
            disabled={isPasswordPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm tracking-wider rounded-xl"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            {isPasswordPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />SAVING...</>
            ) : (
              "UPDATE PASSWORD"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
