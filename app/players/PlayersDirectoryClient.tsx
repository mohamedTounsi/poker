"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTnd } from "../../lib/utils";
import { getRankInfo } from "../../lib/rankUtils";
import {
  Search,
  ArrowUpDown,
  MessageSquare,
  User,
} from "lucide-react";
import PlayerAvatar from "../../components/PlayerAvatar";
import RankBadge from "../../components/RankBadge";

interface PlayersDirectoryClientProps {
  players: any[];
  balances: Record<string, number>;
  gamesCounts: Record<string, number>;
  currentUsername: string;
}

export default function PlayersDirectoryClient({
  players,
  balances,
  gamesCounts,
  currentUsername,
}: PlayersDirectoryClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"profit" | "games" | "name">("profit");

  const filtered = players
    .filter((p) => p.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "profit") {
        return (balances[b.username] || 0) - (balances[a.username] || 0);
      }
      if (sortBy === "games") {
        return (gamesCounts[b.username] || 0) - (gamesCounts[a.username] || 0);
      }
      return a.username.localeCompare(b.username);
    });

  return (
    <div className="space-y-6">
      {/* Search & Sort Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950/90 border border-red-900/40 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 font-bold uppercase flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setSortBy("profit")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                sortBy === "profit"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Profit
            </button>
            <button
              onClick={() => setSortBy("games")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                sortBy === "games"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Matches
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                sortBy === "name"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Name
            </button>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 rounded-3xl bg-zinc-950/60 border border-zinc-800 text-center text-xs font-bold text-zinc-500 uppercase">
          No matching players found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((player) => {
            const net = balances[player.username] || 0;
            const games = gamesCounts[player.username] || 0;
            const isMe = player.username === currentUsername;
            const isWin = net > 0;
            const isLoss = net < 0;

            return (
              <div
                key={player._id}
                className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 hover:border-red-900/50 transition-all shadow-lg backdrop-blur-xl flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      username={player.username}
                      avatarUrl={player.avatarUrl}
                      size="lg"
                      rankScore={net}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-black text-white uppercase truncate max-w-[130px]">
                          {player.username}
                        </h3>
                        {isMe && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-600/30">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 font-semibold block mt-0.5">
                        {games} {games === 1 ? "game" : "games"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-black text-sm sm:text-base ${
                        isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-white"
                      }`}
                    >
                      {formatTnd(net, true)}
                    </span>
                  </div>
                </div>

                {player.bio && (
                  <p className="text-xs text-zinc-400 line-clamp-2 italic">
                    &ldquo;{player.bio}&rdquo;
                  </p>
                )}

                {/* Bottom Action Links */}
                <div className="pt-3 border-t border-zinc-900 flex items-center gap-2">
                  <Link
                    href={`/profile/${player.username}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors border border-zinc-800"
                  >
                    <User className="w-3.5 h-3.5 text-red-500" /> Profile
                  </Link>
                  {!isMe && (
                    <Link
                      href={`/chat?dm=${player.username}`}
                      className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-600/20 text-red-400 border border-red-900/60 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                      title={`Message ${player.username}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
