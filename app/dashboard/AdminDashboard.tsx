"use client";

import { useState, useActionState } from "react";
import { createUserAction, startGameAction } from "../actions";
import { formatTnd } from "../../lib/utils";
import { Users, Play, Plus, History, Key, UserPlus, Spade, ArrowUpRight, ArrowDownRight, Loader2, PlayCircle } from "lucide-react";
import Link from "next/link";

interface AdminDashboardProps {
  currentUser: { username: string };
  players: any[];
  balances: Record<string, number>;
  activeGame: any | null;
  historyGames: any[];
}

export default function AdminDashboard({
  currentUser,
  players,
  balances,
  activeGame,
  historyGames,
}: AdminDashboardProps) {
  // State for creating user
  const [createUserState, createUserFormAction, isCreateUserPending] = useActionState(
    createUserAction,
    null
  );

  // State for starting game
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [startGameError, setStartGameError] = useState<string | null>(null);

  const togglePlayerSelection = (userId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleStartGame = async () => {
    if (selectedPlayers.length === 0) {
      setStartGameError("Please select at least one player to start the game.");
      return;
    }
    setStartGameError(null);
    setIsStartingGame(true);
    try {
      const res = await startGameAction(selectedPlayers);
      if (res && "error" in res) {
        setStartGameError(res.error as string);
      } else if (res && "gameId" in res) {
        window.location.href = `/game/${res.gameId}`;
      }
    } catch (e: any) {
      setStartGameError(e.message || "Failed to start game");
    } finally {
      setIsStartingGame(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Game Notice */}
      {activeGame ? (
        <div className="bg-gradient-to-r from-red-650/20 via-red-500/5 to-zinc-100 dark:to-zinc-900 border border-red-500/30 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 rounded-xl animate-pulse">
              <Spade className="w-8 h-8 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">Active Gameplay Session</h2>
              <p className="text-zinc-650 dark:text-zinc-400 text-sm mt-1 font-medium">
                There is an active poker game with {activeGame.players.length} players currently running.
              </p>
            </div>
          </div>
          <Link
            href={`/game/${activeGame._id}`}
            className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_15px_rgba(220,38,38,0.25)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume Game Session
          </Link>
        </div>
      ) : (
        /* Start New Game Section */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 text-red-650 dark:text-red-500 rounded-lg">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">Start New Game</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Select players to join the new gameplay session</p>
            </div>
          </div>

          {players.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">
              No players created yet. Use the form below to create accounts.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {players.map((player) => {
                  const isSelected = selectedPlayers.includes(player._id.toString());
                  return (
                    <button
                      key={player._id}
                      onClick={() => togglePlayerSelection(player._id.toString())}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-24 cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "bg-red-500/5 dark:bg-red-500/10 border-red-600 dark:border-red-550 shadow-[0_0_12px_rgba(220,38,38,0.15)] text-zinc-950 dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-350 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="font-bold capitalize truncate w-full text-sm">{player.username}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-455 font-mono font-bold mt-1">
                        {formatTnd(balances[player.username] || 0)}
                      </div>
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {startGameError && (
                <div className="text-red-650 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-sm p-3 rounded-lg text-center font-bold">
                  {startGameError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleStartGame}
                  disabled={isStartingGame || selectedPlayers.length === 0}
                  className="px-6 py-3 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-[0_4px_15px_rgba(220,38,38,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isStartingGame ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating game...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Start Gameplay ({selectedPlayers.length} Selected)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid: Global Standings & Admin Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Standings/Leaderboard (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-650 dark:text-red-500 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Global Player Standings</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Overall net gains and losses</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm font-semibold">
                  <th className="py-3 px-4 font-bold">Player</th>
                  <th className="py-3 px-4 font-bold text-right">Total Net Balance</th>
                  <th className="py-3 px-4 font-bold text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {players.map((player) => {
                  const netVal = balances[player.username] || 0;
                  const isPositive = netVal > 0;
                  const isNegative = netVal < 0;

                  return (
                    <tr key={player._id} className="text-zinc-800 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors font-medium">
                      <td className="py-3.5 px-4 capitalize font-semibold">{player.username}</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        isPositive ? "text-emerald-600 dark:text-emerald-450" : isNegative ? "text-red-600 dark:text-red-500" : "text-zinc-500"
                      }`}>
                        <span className="flex items-center justify-end gap-1">
                          {isPositive && <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          {isNegative && <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-550" />}
                          {formatTnd(netVal)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-750">
                          {player.role}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Player Account (Takes 1 column) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-650 dark:text-red-500 rounded-lg">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Create Player</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Add a new player account</p>
            </div>
          </div>

          <form action={createUserFormAction} className="space-y-4">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="e.g. yassine"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white px-3 py-2.5 rounded-lg border border-zinc-250 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:outline-none text-sm transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5" htmlFor="password">
                Temporary Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="At least 6 chars"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white px-3 py-2.5 rounded-lg border border-zinc-250 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:outline-none text-sm transition-all font-medium"
              />
            </div>

            {createUserState?.error && (
              <div className="text-red-650 dark:text-red-450 bg-red-500/10 border border-red-500/20 text-xs p-2.5 rounded-lg text-center font-bold">
                {createUserState.error}
              </div>
            )}

            {createUserState?.success && (
              <div className="text-emerald-650 dark:text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 text-xs p-2.5 rounded-lg text-center font-bold">
                {createUserState.success}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreateUserPending}
              className="w-full py-2.5 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isCreateUserPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Player Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
