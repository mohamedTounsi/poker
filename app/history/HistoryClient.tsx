"use client";

import { useState } from "react";
import Podium from "../../components/Podium";
import PlayerAvatar from "../../components/PlayerAvatar";
import { formatTnd } from "../../lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Trophy,
  MoveRight,
  Clock,
  Search,
} from "lucide-react";

interface HistoryClientProps {
  games: any[];
  currentUsername: string;
  isAdmin: boolean;
  avatarMap: Record<string, string | null>;
}

export default function HistoryClient({
  games,
  currentUsername,
  isAdmin,
  avatarMap,
}: HistoryClientProps) {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [playerFilter, setPlayerFilter] = useState("");
  const [resultFilter, setResultFilter] = useState<"all" | "win" | "loss">("all");

  const filteredGames = games.filter((game: any) => {
    // Player filter
    if (playerFilter) {
      const match = game.players.some((p: any) =>
        p.username.toLowerCase().includes(playerFilter.toLowerCase().trim())
      );
      if (!match) return false;
    }

    // Result filter (for non-admin viewer)
    if (!isAdmin && resultFilter !== "all") {
      const myEntry = game.players.find((p: any) => p.username === currentUsername);
      if (!myEntry) return false;
      if (resultFilter === "win" && myEntry.score <= 0) return false;
      if (resultFilter === "loss" && myEntry.score >= 0) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950/90 border border-red-900/40 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter by player name..."
            value={playerFilter}
            onChange={(e) => setPlayerFilter(e.target.value)}
            className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold text-white outline-none"
          />
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setResultFilter("all")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                resultFilter === "all"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setResultFilter("win")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                resultFilter === "win"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Wins
            </button>
            <button
              onClick={() => setResultFilter("loss")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                resultFilter === "loss"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Losses
            </button>
          </div>
        )}
      </div>

      {filteredGames.length === 0 ? (
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-16 text-center shadow-xl backdrop-blur-md">
          <div className="text-5xl mb-4 select-none">🃏</div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider">
            NO MATCHES FOUND
          </h3>
          <p className="text-zinc-500 text-sm mt-2 font-medium">
            Try adjusting your search filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGames.map((game: any, idx: number) => {
            const isExpanded = expandedGame === game._id;
            const totalPot = game.players.reduce(
              (sum: number, p: any) => (p.score > 0 ? sum + p.score : sum),
              0
            );
            const sorted = [...game.players].sort((a: any, b: any) => b.score - a.score);
            const winner = sorted[0];
            const myEntry = game.players.find((p: any) => p.username === currentUsername);
            const myScore = myEntry?.score;
            const isBalanced = game.players.reduce((sum: number, p: any) => sum + p.score, 0) === 0;

            return (
              <div
                key={game._id}
                className="bg-zinc-950/90 border border-zinc-800 hover:border-red-900/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl backdrop-blur-md"
              >
                {/* Header */}
                <div
                  className="p-4 sm:p-6 hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  onClick={() => setExpandedGame(isExpanded ? null : game._id)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                    <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black border border-red-600/40 text-red-500 font-mono font-black text-base sm:text-lg flex items-center justify-center shadow-inner">
                      #{filteredGames.length - idx}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {new Date(game.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {!isBalanced && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-600/40">
                            Unbalanced
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs">
                        <span className="text-zinc-400 flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-zinc-500" />
                          {game.players.length} players
                        </span>
                        <span className="text-white font-mono font-bold">
                          Pot: +{formatTnd(totalPot)}
                        </span>
                        {winner && (
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            👑 {winner.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-between w-full sm:w-auto gap-4">
                    {myScore !== undefined && !isAdmin && (
                      <div
                        className={`px-3.5 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm border ${
                          myScore > 0
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                            : myScore < 0
                            ? "bg-red-950/40 text-red-500 border-red-600/40"
                            : "bg-black text-zinc-400 border-zinc-800"
                        }`}
                      >
                        {formatTnd(myScore, true)}
                      </div>
                    )}
                    <div className="p-2 rounded-xl bg-zinc-900 text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 pt-0 border-t border-zinc-900 space-y-6">
                    {/* Podium */}
                    {game.players.length >= 2 && (
                      <div className="pt-6">
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-red-500" /> Top Finishers
                        </p>
                        <Podium players={game.players} avatarMap={avatarMap} />
                      </div>
                    )}

                    {/* Scorecard with BIG Rank Icons */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                        Full Scorecard
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {sorted.map((player: any) => {
                          const isMe = player.username === currentUsername;
                          const isWin = player.score > 0;
                          const isLoss = player.score < 0;
                          return (
                            <div
                              key={player.userId}
                              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                                isMe
                                  ? "border-red-600/50 bg-red-950/30"
                                  : "border-zinc-850 bg-black/60"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <PlayerAvatar
                                  username={player.username}
                                  avatarUrl={avatarMap[player.username]}
                                  size="xs"
                                />
                                <span className="font-bold text-xs uppercase truncate text-white">
                                  {player.username}
                                </span>
                              </div>
                              <span
                                className={`font-mono font-black text-xs sm:text-sm shrink-0 ${
                                  isWin
                                    ? "text-emerald-400"
                                    : isLoss
                                    ? "text-red-500"
                                    : "text-zinc-400"
                                }`}
                              >
                                {formatTnd(player.score, true)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Transactions Log */}
                    {game.transactions && game.transactions.length > 0 && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" /> Transactions Log (
                          {game.transactions.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {game.transactions.map((tx: any, tIdx: number) => (
                            <div
                              key={tIdx}
                              className="flex items-center justify-between bg-black border border-zinc-850 p-2.5 rounded-xl text-xs"
                            >
                              <span className="font-bold text-white uppercase truncate max-w-[120px]">
                                {tx.fromUser}
                              </span>
                              <div className="flex items-center gap-1.5 font-mono font-bold text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                                <MoveRight className="w-3 h-3 text-red-500" />
                                {formatTnd(tx.amount)}
                              </div>
                              <span className="font-bold text-emerald-400 uppercase truncate max-w-[120px] text-right">
                                {tx.toUser}
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
  );
}
