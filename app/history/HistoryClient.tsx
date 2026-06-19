"use client";

import { useState } from "react";
import Podium from "@/components/Podium";
import PlayerAvatar from "@/components/PlayerAvatar";
import { formatTnd } from "@/lib/utils";
import { ChevronDown, ChevronUp, Users, Trophy, MoveRight, Clock } from "lucide-react";

interface HistoryClientProps {
  games: any[];
  currentUsername: string;
  isAdmin: boolean;
  avatarMap: Record<string, string | null>;
}

export default function HistoryClient({ games, currentUsername, isAdmin, avatarMap }: HistoryClientProps) {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  if (games.length === 0) {
    return (
      <div className="game-card p-16 text-center">
        <div className="text-5xl mb-4">🃏</div>
        <h3 className="text-lg font-black text-zinc-400" style={{ fontFamily: "var(--font-orbitron)" }}>
          NO MATCHES YET
        </h3>
        <p className="text-zinc-600 text-sm mt-2 font-medium">
          Completed games will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((game: any) => {
        const isExpanded = expandedGame === game._id;
        const totalPot = game.players.reduce(
          (sum: number, p: any) => (p.score > 0 ? sum + p.score : sum),
          0
        );
        const sorted = [...game.players].sort((a: any, b: any) => b.score - a.score);
        const winner = sorted[0];
        const myEntry = game.players.find((p: any) => p.username === currentUsername);
        const myScore = myEntry?.score;

        return (
          <div key={game._id} className="match-card">
            {/* Clickable Header */}
            <div
              className="match-card-header hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => setExpandedGame(isExpanded ? null : game._id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Date bubble */}
                <div
                  className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center"
                  style={{
                    background: "rgba(245,197,24,0.08)",
                    border: "1px solid rgba(245,197,24,0.15)",
                  }}
                >
                  <span className="text-[10px] font-bold text-yellow-500 uppercase">
                    {new Date(game.date).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-lg font-black text-yellow-400" style={{ fontFamily: "var(--font-orbitron)" }}>
                    {new Date(game.date).getDate()}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-black text-white"
                      style={{ fontFamily: "var(--font-rajdhani)" }}
                    >
                      {new Date(game.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.players.length} players
                    </span>
                    <span className="text-xs text-emerald-500 font-mono font-bold">
                      Pot: +{formatTnd(totalPot)}
                    </span>
                    {winner && (
                      <span className="text-xs text-yellow-400 font-bold">
                        👑 {winner.username}
                      </span>
                    )}
                    {myScore !== undefined && !isAdmin && (
                      <span className={`text-xs font-bold font-mono ${myScore > 0 ? "text-emerald-400" : myScore < 0 ? "text-red-400" : "text-zinc-500"}`}>
                        You: {myScore > 0 ? "+" : ""}{formatTnd(myScore)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-500" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="match-card-body space-y-6">
                <div style={{ borderTop: "1px solid #1f2d45", marginBottom: "0" }} />

                {/* Podium */}
                {game.players.length >= 2 && (
                  <div>
                    <p className="section-label mb-3 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" /> PODIUM
                    </p>
                    <Podium players={game.players} avatarMap={avatarMap} />
                  </div>
                )}

                {/* Scorecard */}
                <div>
                  <p className="section-label mb-3">SCORECARD</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sorted.map((player: any, idx: number) => {
                      const isW = player.score > 0;
                      const isL = player.score < 0;
                      const isMe = player.username === currentUsername;
                      return (
                        <div
                          key={player.userId}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{
                            background: isMe ? "rgba(245,197,24,0.06)" : "rgba(255,255,255,0.02)",
                            border: isMe ? "1px solid rgba(245,197,24,0.2)" : "1px solid #1f2d45",
                          }}
                        >
                          {/* Rank number */}
                          <span
                            className="w-6 shrink-0 text-sm font-black text-center"
                            style={{
                              color: idx === 0 ? "#f5c518" : idx === 1 ? "#94a3b8" : idx === 2 ? "#d97706" : "#4b5563",
                              fontFamily: "var(--font-orbitron)",
                            }}
                          >
                            {idx + 1}
                          </span>
                          {/* Avatar */}
                          <PlayerAvatar
                            username={player.username}
                            avatarUrl={avatarMap[player.username] ?? null}
                            size="sm"
                            showRing={isMe}
                            ringColor="#f5c518"
                          />
                          {/* Name */}
                          <span
                            className="flex-1 text-sm font-black text-white capitalize truncate"
                            style={{ fontFamily: "var(--font-rajdhani)" }}
                          >
                            {player.username}
                            {isMe && <span className="text-yellow-400"> (You)</span>}
                          </span>
                          {/* Score */}
                          <span
                            className={`text-xs font-black font-mono shrink-0 ${isW ? "text-emerald-400" : isL ? "text-red-400" : "text-zinc-500"}`}
                          >
                            {player.score > 0 ? "+" : ""}{formatTnd(player.score)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transaction Log — Avatar → Arrow → Avatar */}
                {game.transactions && game.transactions.length > 0 && (
                  <div>
                    <p className="section-label mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-400" />
                      TRANSACTION LOG ({game.transactions.length})
                    </p>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {game.transactions.map((tx: any, idx: number) => {
                        const fromPlayer = game.players.find((p: any) => p.username === tx.fromUser);
                        const toPlayer = game.players.find((p: any) => p.username === tx.toUser);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-2xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1f2d45" }}
                          >
                            {/* Giver */}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <PlayerAvatar
                                username={tx.fromUser}
                                avatarUrl={avatarMap[tx.fromUser] ?? fromPlayer?.avatarUrl ?? null}
                                size="sm"
                                showRing
                                ringColor="#10b981"
                              />
                              <span className="text-[10px] font-black text-emerald-400 capitalize">
                                {tx.fromUser}
                              </span>
                              <span className="text-[9px] text-emerald-500 font-bold">GIVER</span>
                            </div>

                            {/* Arrow + Amount */}
                            <div className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="px-3 py-1 rounded-lg font-mono font-black text-xs"
                                style={{
                                  background: "rgba(245,197,24,0.08)",
                                  border: "1px solid rgba(245,197,24,0.2)",
                                  color: "#f5c518",
                                }}
                              >
                                {formatTnd(tx.amount)}
                              </div>
                              <MoveRight className="w-5 h-5 text-zinc-600" />
                              <span className="text-[9px] text-zinc-600 font-mono">
                                {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            {/* Borrower */}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <PlayerAvatar
                                username={tx.toUser}
                                avatarUrl={avatarMap[tx.toUser] ?? toPlayer?.avatarUrl ?? null}
                                size="sm"
                                showRing
                                ringColor="#ef4444"
                              />
                              <span className="text-[10px] font-black text-red-400 capitalize">
                                {tx.toUser}
                              </span>
                              <span className="text-[9px] text-red-500 font-bold">BORROWER</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
