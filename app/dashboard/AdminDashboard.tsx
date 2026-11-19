"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { createUserAction, startGameAction } from "../actions";
import { formatTnd } from "../../lib/utils";
import {
  Users,
  Play,
  UserPlus,
  Loader2,
  PlayCircle,
  Spade,
  Search,
  Trophy,
} from "lucide-react";
import PlayerAvatar from "../../components/PlayerAvatar";
import RankBadge from "../../components/RankBadge";
import Podium from "../../components/Podium";
import PokerChip from "../../components/PokerChip";

interface AdminDashboardProps {
  players: any[];
  balances: Record<string, number>;
  activeGame: any | null;
  avatarMap: Record<string, string | null>;
  sortedPlayers: any[];
  historyGames: any[];
}

export default function AdminDashboard({
  players,
  balances,
  activeGame,
  avatarMap,
  sortedPlayers,
  historyGames,
}: AdminDashboardProps) {
  const [createUserState, createUserFormAction, isCreateUserPending] = useActionState(
    createUserAction,
    null
  );

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [startGameError, setStartGameError] = useState<string | null>(null);

  const togglePlayerSelection = (userId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map((p) => p._id.toString()));
    }
  };

  const handleStartGame = async () => {
    if (selectedPlayers.length === 0) {
      setStartGameError("Please select at least one player to start.");
      return;
    }
    setStartGameError(null);
    setIsStartingGame(true);
    try {
      const res = await startGameAction(selectedPlayers);
      if (res && "error" in res && res.error) {
        setStartGameError(res.error as string);
      } else if (res && "gameId" in res && res.gameId) {
        window.location.href = `/game/${res.gameId}`;
      }
    } catch (e: any) {
      setStartGameError(e.message || "Failed to start game");
    } finally {
      setIsStartingGame(false);
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const topWinner = sortedPlayers.find((p) => (balances[p.username] || 0) > 0);
  const topLoser = [...sortedPlayers].reverse().find((p) => (balances[p.username] || 0) < 0);
  const totalVolume = Object.values(balances).reduce((sum, val) => sum + Math.abs(val), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Command Lounge
            </h1>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
            POKER FRERE Tournament Suite • Tables, Players & Chip Exchanges
          </p>
        </div>
      </div>

      {/* Active Game Banner */}
      {activeGame ? (
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-red-950/80 via-black to-zinc-950 border border-red-600/50 shadow-[0_10px_40px_rgba(220,38,38,0.2)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black border border-red-600/50 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <Spade className="w-7 h-7 fill-red-600 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  Session Active
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase">
                Active Game In Progress
              </h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                {activeGame.players.length} players currently seated at the table
              </p>
            </div>
          </div>

          <Link
            href={`/game/${activeGame._id}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume Live Table
          </Link>
        </div>
      ) : (
        /* New Game Wizard — Optimized for phone and touch */
        <div className="rounded-3xl p-5 sm:p-8 bg-zinc-950/90 border border-red-900/40 shadow-xl backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-950/60 border border-red-600/40 flex items-center justify-center text-red-500">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase">
                  Start New Session
                </h2>
                <p className="text-xs text-zinc-400">
                  Select players to seat at the table. Everyone starts at 0 TND score.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold uppercase transition-colors border border-zinc-800"
              >
                {selectedPlayers.length === players.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search players by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-black border border-zinc-800 focus:border-red-600 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold text-white outline-none transition-colors"
            />
          </div>

          {/* Players Selection Grid — 2 columns on phone! */}
          {players.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500 font-bold uppercase">
              No players found. Create player accounts below.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayers.includes(player._id.toString());
                const net = balances[player.username] || 0;
                const isWin = net > 0;
                const isLoss = net < 0;

                return (
                  <button
                    key={player._id}
                    type="button"
                    onClick={() => togglePlayerSelection(player._id.toString())}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 relative cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.35)]"
                        : "bg-black/80 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                        ✓
                      </span>
                    )}

                    {/* Photo with layered Rank Badge at bottom-right */}
                    <PlayerAvatar
                      username={player.username}
                      avatarUrl={player.avatarUrl}
                      size="md"
                      showRing={isSelected}
                      ringColor="#ef4444"
                      rankScore={net}
                    />

                    <div className="text-center w-full px-1">
                      <span className="block text-xs font-black text-white uppercase truncate">
                        {player.username}
                      </span>
                      {/* Winning green, losing red, half in parentheses */}
                      <span
                        className={`text-[10px] font-mono font-bold block mt-0.5 ${
                          isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-zinc-400"
                        }`}
                      >
                        {formatTnd(net, true)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {startGameError && (
            <div className="p-3 rounded-2xl bg-red-950/50 border border-red-600/40 text-red-400 text-xs font-bold text-center">
              {startGameError}
            </div>
          )}

          {/* Launch Button */}
          <div className="flex justify-end pt-2 border-t border-zinc-800">
            <button
              onClick={handleStartGame}
              disabled={isStartingGame || selectedPlayers.length === 0}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isStartingGame ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Deal Cards ({selectedPlayers.length} Seated)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Global Club Financial Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 shadow-lg text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Registered Players
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-white">{players.length}</span>
        </div>

        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 shadow-lg text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Completed Games
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-white">{historyGames.length}</span>
        </div>

        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 shadow-lg text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Top Club Earner
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase truncate block">
            {topWinner ? `${topWinner.username} (${formatTnd(balances[topWinner.username], true)})` : "None"}
          </span>
        </div>

        <div className="rounded-3xl p-4 sm:p-5 bg-zinc-950/80 border border-zinc-800 shadow-lg text-center backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
            Total Turnover
          </span>
          <span className="text-xl sm:text-2xl font-mono font-black text-white">
            {formatTnd(totalVolume / 2)}
          </span>
        </div>
      </div>

      {/* Create Player Account Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl p-5 sm:p-7 bg-zinc-950/90 border border-red-900/40 shadow-xl backdrop-blur-xl space-y-5 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-600/40 flex items-center justify-center text-red-500">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase">
                Add Player Account
              </h2>
              <p className="text-xs text-zinc-400">Direct admin enrollment</p>
            </div>
          </div>

          <form action={createUserFormAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                placeholder="e.g. sammy"
                className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white outline-none"
              />
            </div>

            {createUserState?.error && (
              <p className="text-red-400 text-xs font-bold bg-red-950/50 p-2.5 rounded-xl border border-red-600/40">
                {createUserState.error}
              </p>
            )}
            {createUserState?.success && (
              <p className="text-emerald-400 text-xs font-bold bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/40">
                {createUserState.success}
              </p>
            )}

            <button
              type="submit"
              disabled={isCreateUserPending}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              {isCreateUserPending ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Podium Preview on Dashboard */}
        <div className="rounded-3xl p-5 sm:p-7 bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" /> Club Champions
            </h2>
            <Link
              href="/leaderboard"
              className="text-xs text-red-400 font-bold uppercase hover:underline"
            >
              Full Standings →
            </Link>
          </div>

          {sortedPlayers.length >= 2 ? (
            <Podium
              players={sortedPlayers.slice(0, 3).map((p) => ({
                username: p.username,
                score: balances[p.username] || 0,
              }))}
              avatarMap={avatarMap}
            />
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500 uppercase font-bold">
              Play matches to generate club rankings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
