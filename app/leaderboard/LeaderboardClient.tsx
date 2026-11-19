"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTnd } from "../../lib/utils";
import { getRankInfo } from "../../lib/rankUtils";
import { Trophy, MessageSquare } from "lucide-react";
import PlayerAvatar from "../../components/PlayerAvatar";
import RankBadge, { RankTable } from "../../components/RankBadge";
import Podium from "../../components/Podium";

interface LeaderboardClientProps {
  allTimeRankings: any[];
  monthlyRankings: any[];
  weeklyRankings: any[];
  avatarMap: Record<string, string | null>;
  currentUsername: string;
}

export default function LeaderboardClient({
  allTimeRankings,
  monthlyRankings,
  weeklyRankings,
  avatarMap,
  currentUsername,
}: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "monthly" | "weekly">("all");

  const currentRankings =
    activeTab === "all"
      ? allTimeRankings
      : activeTab === "monthly"
      ? monthlyRankings
      : weeklyRankings;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Time Horizon Tabs — Red/Black/White */}
      <div className="flex items-center justify-center">
        <div className="flex items-center p-1.5 rounded-2xl bg-zinc-950 border border-red-950/60 shadow-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "monthly"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "weekly"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Top 3 Animated Podium */}
      {currentRankings.length >= 2 && (
        <div className="p-5 sm:p-8 rounded-3xl bg-zinc-950/90 border border-red-900/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block mb-1">
              Top Performers
            </span>
            <h2 className="text-xl font-black text-white uppercase flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" /> Crown Standings
            </h2>
          </div>

          <Podium
            players={currentRankings.slice(0, 3).map((p) => ({
              username: p.username,
              score: p.netBalance,
            }))}
            avatarMap={avatarMap}
          />
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
            <Trophy className="w-4 h-4 text-red-500" /> Full Standings ({currentRankings.length} Players)
          </h2>
        </div>

        {currentRankings.length === 0 ? (
          <div className="p-16 text-center text-xs font-bold text-zinc-500 uppercase">
            No matches found for this timeframe yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-850">
            {currentRankings.map((player, idx) => {
              const isMe = player.username === currentUsername;
              const isWin = player.netBalance > 0;
              const isLoss = player.netBalance < 0;

              return (
                <div
                  key={player.username}
                  className={`p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-colors hover:bg-white/[0.02] ${
                    isMe ? "bg-red-950/20" : ""
                  }`}
                >
                  {/* Rank Position & Player Info with BIG Rank Icon */}
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                    <span
                      className={`font-mono font-black text-sm sm:text-base w-6 sm:w-7 text-center shrink-0 ${
                        idx === 0
                          ? "text-red-500 text-base sm:text-lg"
                          : idx === 1
                          ? "text-white"
                          : idx === 2
                          ? "text-zinc-400"
                          : "text-zinc-600"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    {/* Avatar with layered Rank Badge at bottom-right */}
                    <PlayerAvatar
                      username={player.username}
                      avatarUrl={avatarMap[player.username]}
                      size="md"
                      rankScore={player.netBalance}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${player.username}`}
                          className="font-black text-xs sm:text-sm text-white uppercase hover:text-red-400 transition-colors truncate"
                        >
                          {player.username}
                        </Link>
                        {isMe && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-600/30">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block mt-0.5">
                        {player.gamesCount} games played
                      </span>
                    </div>
                  </div>

                  {/* Net Profit: Winning green, losing red, half in parentheses */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`font-mono font-black text-xs sm:text-base block ${
                          isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-white"
                        }`}
                      >
                        {formatTnd(player.netBalance, true)}
                      </span>
                    </div>

                    {!isMe && (
                      <Link
                        href={`/chat?dm=${player.username}`}
                        className="hidden sm:flex p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title={`Message ${player.username}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ranks & Requirements Info Table */}
      <div className="p-5 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-4">
        <h3 className="text-base font-black text-white uppercase tracking-tight">
          Club Tiers & Rank Requirements
        </h3>
        <p className="text-xs text-zinc-400 font-medium">
          Ranks are automatically awarded based on career net score (TND).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <RankTable />
        </div>
      </div>
    </div>
  );
}
