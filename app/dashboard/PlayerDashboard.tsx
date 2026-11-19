"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTnd } from "../../lib/utils";
import { getRankInfo } from "../../lib/rankUtils";
import {
  TrendingUp,
  Play,
  Spade,
  User,
  History,
} from "lucide-react";
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
    bestWin: number;
    worstLoss: number;
    rebuys: number;
  };
  activeGame?: any;
  topPlayers?: any[];
  balances?: Record<string, number>;
  avatarMap?: Record<string, string | null>;
}

export default function PlayerDashboard({
  currentUser,
  myUser,
  myGames,
  myStats,
  activeGame,
}: PlayerDashboardProps) {
  const rank = getRankInfo(myStats.netBalance);
  const winRate =
    myStats.gamesPlayed > 0
      ? ((myStats.wins / myStats.gamesPlayed) * 100).toFixed(1)
      : "0.0";

  const isSeatedInActiveGame = activeGame?.players?.some(
    (p: any) => p.username === currentUser.username
  );

  // Performance graph data
  const chartData = (() => {
    let running = 0;
    const result = [];
    const reversed = [...myGames].reverse();
    for (let i = 0; i < reversed.length; i++) {
      const g = reversed[i];
      const entry = g.players.find((p: any) => p.username === currentUser.username);
      running += entry?.score || 0;
      result.push({
        label: `G${i + 1}`,
        balance: running,
        date: new Date(g.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return result;
  })();

  const isWin = myStats.netBalance > 0;
  const isLoss = myStats.netBalance < 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Active Game Notice Banner */}
      {activeGame && (
        <div className="rounded-3xl p-5 bg-gradient-to-r from-red-950/80 via-black to-zinc-950 border border-red-600/50 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black border border-red-600/50 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <Spade className="w-6 h-6 fill-red-600 text-red-600 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                Table Open Now
              </span>
              <h2 className="text-base font-black text-white uppercase">
                {isSeatedInActiveGame ? "You are seated at the live table!" : "Active session in progress"}
              </h2>
            </div>
          </div>

          <Link
            href={`/game/${activeGame._id}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isSeatedInActiveGame ? "Go To Table" : "Spectate Game"}
          </Link>
        </div>
      )}

      {/* Hero Profile Card with BIG Rank Badge */}
      <div className="rounded-3xl p-6 sm:p-8 bg-zinc-950/90 border border-red-900/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
          <div className="flex items-center">
            <PlayerAvatar
              username={currentUser.username}
              avatarUrl={myUser?.avatarUrl}
              size="xxl"
              rankScore={myStats.netBalance}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                {currentUser.username}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-bold uppercase">
                {rank.name}
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-md">
              {myUser?.bio || "No bio added yet. Add your poker motto in settings!"}
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <Link
                href={`/profile/${currentUser.username}`}
                className="text-xs text-red-400 font-bold uppercase flex items-center gap-1 hover:underline"
              >
                <User className="w-3.5 h-3.5" /> View Public Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Big Balance Tag: Winning Green, Losing Red, Half in Parentheses */}
        <div className="z-10 p-5 rounded-2xl bg-black/80 border border-zinc-800 text-center min-w-[200px]">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
            Career Net Profit
          </span>
          <span
            className={`text-2xl sm:text-3xl font-mono font-black ${
              isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-white"
            }`}
          >
            {formatTnd(myStats.netBalance, true)}
          </span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Total Sessions
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-white">
            {myStats.gamesPlayed}
          </span>
        </div>

        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Win Rate
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
            {winRate}%
          </span>
        </div>

        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Best Session Win
          </span>
          <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
            {formatTnd(myStats.bestWin, true)}
          </span>
        </div>

        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Worst Session Loss
          </span>
          <span className="text-xl sm:text-2xl font-mono font-black text-red-500">
            {formatTnd(myStats.worstLoss)}
          </span>
        </div>
      </div>

      {/* Chart & Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="rounded-3xl p-5 sm:p-7 bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" /> Career Profit Curve
            </h3>
            <span className="text-xs text-zinc-500 font-mono font-bold">
              {myGames.length} data points
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <PerformanceChart data={chartData} />
          </div>
        </div>

        {/* Recent Matches */}
        <div className="rounded-3xl p-5 sm:p-7 bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" /> Recent Matches
            </h3>
            <Link
              href="/history"
              className="text-xs text-red-400 font-bold uppercase hover:underline"
            >
              All →
            </Link>
          </div>

          {myGames.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500 font-bold uppercase">
              No games played yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {myGames.slice(0, 5).map((game) => {
                const entry = game.players.find((p: any) => p.username === currentUser.username);
                if (!entry) return null;
                const isGameWin = entry.score > 0;
                const isGameLoss = entry.score < 0;

                return (
                  <div
                    key={game._id}
                    className="p-3 rounded-2xl bg-black border border-zinc-850 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="text-white font-bold block">
                        {new Date(game.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                        {game.players.length} players
                      </span>
                    </div>

                    <span
                      className={`font-mono font-black text-sm ${
                        isGameWin ? "text-emerald-400" : isGameLoss ? "text-red-500" : "text-white"
                      }`}
                    >
                      {formatTnd(entry.score, true)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
