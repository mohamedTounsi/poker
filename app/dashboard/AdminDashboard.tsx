"use client";

import { useState, useActionState } from "react";
import { createUserAction, startGameAction } from "../actions";
import { formatTnd } from "../../lib/utils";
import { getRankInfo } from "../../lib/rankUtils";
import { Users, Play, Plus, UserPlus, ArrowUpRight, ArrowDownRight, Loader2, PlayCircle, Spade } from "lucide-react";
import Link from "next/link";
import PlayerAvatar from "../../components/PlayerAvatar";
import RankBadge from "../../components/RankBadge";

interface AdminDashboardProps {
  players: any[];
  balances: Record<string, number>;
  activeGame: any | null;
  avatarMap: Record<string, string | null>;
}

export default function AdminDashboard({
  players,
  balances,
  activeGame,
  avatarMap,
}: AdminDashboardProps) {
  const [createUserState, createUserFormAction, isCreateUserPending] = useActionState(
    createUserAction,
    null
  );

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

  // Sort players by balance desc for standings
  const sortedPlayers = [...players].sort(
    (a, b) => (balances[b.username] || 0) - (balances[a.username] || 0)
  );

  return (
    <div className="space-y-8">
      {/* Active Game Banner */}
      {activeGame ? (
        <div
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(224,48,48,0.15) 0%, rgba(224,48,48,0.05) 100%)",
            border: "1px solid rgba(224,48,48,0.35)",
            boxShadow: "0 0 30px rgba(224,48,48,0.1)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl"
              style={{ background: "rgba(224,48,48,0.15)", border: "1px solid rgba(224,48,48,0.3)" }}
            >
              <Spade className="w-8 h-8 fill-current text-red-400 live-blink" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-red-500 live-blink" />
                <span className="text-xs font-black tracking-widest uppercase text-red-400"
                  style={{ fontFamily: "var(--font-rajdhani)" }}>
                  LIVE SESSION
                </span>
              </div>
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                Game In Progress
              </h2>
              <p className="text-sm text-zinc-400 font-medium mt-0.5">
                {activeGame.players.length} players at the table
              </p>
            </div>
          </div>
          <Link
            href={`/game/${activeGame._id}`}
            className="btn-primary w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 rounded-xl text-sm tracking-wider"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME GAME
          </Link>
        </div>
      ) : (
        /* Start New Game Section */
        <div className="game-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: "rgba(224,48,48,0.1)", border: "1px solid rgba(224,48,48,0.2)" }}
            >
              <PlayCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                START NEW GAME
              </h2>
              <p className="text-zinc-500 text-sm font-medium">Select players to include in this session</p>
            </div>
          </div>

          {players.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">
              No players yet. Create accounts below.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {players.map((player) => {
                  const isSelected = selectedPlayers.includes(player._id.toString());
                  const net = balances[player.username] || 0;
                  return (
                    <button
                      key={player._id}
                      onClick={() => togglePlayerSelection(player._id.toString())}
                      className="relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/[0.04] active:scale-95"
                      style={{
                        background: isSelected ? "rgba(224,48,48,0.12)" : "rgba(255,255,255,0.02)",
                        border: isSelected
                          ? "2px solid rgba(224,48,48,0.6)"
                          : "1px solid #1f2d45",
                        boxShadow: isSelected ? "0 0 20px rgba(224,48,48,0.25)" : "none",
                      }}
                    >
                      <div className="relative inline-block">
                        <PlayerAvatar
                          username={player.username}
                          avatarUrl={avatarMap[player.username]}
                          size="xl"
                          showRing={isSelected}
                          ringColor="#ef4444"
                        />
                        <div className="absolute -bottom-5 -right-5 z-10 drop-shadow-md">
                          <RankBadge netBalance={net} showName={false} size="md" />
                        </div>
                      </div>
                      
                      <span className="text-xl font-black text-white capitalize truncate text-center w-full" style={{ fontFamily: "var(--font-orbitron)" }}>
                        {player.username}
                      </span>

                      {isSelected && (
                        <span
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white font-black"
                          style={{ boxShadow: "0 0 8px rgba(224,48,48,0.8)" }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {startGameError && (
                <div
                  className="text-sm font-bold p-3 rounded-xl text-center"
                  style={{ background: "rgba(224,48,48,0.1)", border: "1px solid rgba(224,48,48,0.3)", color: "#f87171" }}
                >
                  {startGameError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleStartGame}
                  disabled={isStartingGame || selectedPlayers.length === 0}
                  className="btn-primary px-6 py-3 flex items-center gap-2 rounded-xl text-sm tracking-wider"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  {isStartingGame ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />CREATING...</>
                  ) : (
                    <><Play className="w-4 h-4 fill-current" />START GAME ({selectedPlayers.length})</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Player Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Create Player */}
        <div className="game-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                ADD PLAYER
              </h2>
              <p className="text-zinc-500 text-xs font-medium">Create a new player account</p>
            </div>
          </div>

          <form action={createUserFormAction} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold tracking-widest uppercase mb-2 text-zinc-500"
                style={{ fontFamily: "var(--font-rajdhani)" }}
                htmlFor="new-username"
              >
                Username
              </label>
              <input
                id="new-username"
                name="username"
                type="text"
                required
                placeholder="e.g. yassine"
                className="game-input w-full px-3 py-2.5 text-sm font-semibold"
              />
            </div>

            <div>
              <label
                className="block text-xs font-bold tracking-widest uppercase mb-2 text-zinc-500"
                style={{ fontFamily: "var(--font-rajdhani)" }}
                htmlFor="new-password"
              >
                Password
              </label>
              <input
                id="new-password"
                name="password"
                type="password"
                required
                placeholder="At least 6 characters"
                className="game-input w-full px-3 py-2.5 text-sm font-semibold"
              />
            </div>

            {createUserState?.error && (
              <div
                className="text-xs font-bold p-2.5 rounded-xl text-center"
                style={{ background: "rgba(224,48,48,0.1)", border: "1px solid rgba(224,48,48,0.3)", color: "#f87171" }}
              >
                {createUserState.error}
              </div>
            )}
            {createUserState?.success && (
              <div
                className="text-xs font-bold p-2.5 rounded-xl text-center"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
              >
                {createUserState.success}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreateUserPending}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm tracking-wider rounded-xl"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              {isCreateUserPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />CREATING...</>
              ) : (
                <><Plus className="w-4 h-4" />CREATE PLAYER</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
