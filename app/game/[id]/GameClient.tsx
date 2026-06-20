"use client";

import { useState, useTransition } from "react";
import {
  updatePlayerScoreAction,
  recordBorrowAction,
  addPlayerToGameAction,
  removePlayerFromGameAction,
  endGameAction,
  decreaseAllPlayersScoreAction,
} from "../../actions";
import { formatTnd } from "../../../lib/utils";
import {
  Spade,
  Plus,
  Minus,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Loader2,
  MoveRight,
  HandCoins,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import Link from "next/link";
import PlayerAvatar from "../../../components/PlayerAvatar";

interface GameClientProps {
  game: any;
  currentUser: { username: string; role: "admin" | "player" };
  allUsers: any[];
}

export default function GameClient({ game, currentUser, allUsers }: GameClientProps) {
  const isAdmin = currentUser.role === "admin";
  const [isPending, startTransition] = useTransition();

  // Selected increment step for + and - buttons
  const [increment, setIncrement] = useState<number>(5);
  const [customIncrement, setCustomIncrement] = useState<string>("");

  // State for transaction logger (Redesigned)
  const [lender, setLender] = useState<string>("");
  const [borrower, setBorrower] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<number>(0);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [isTxPending, setIsTxPending] = useState(false);

  // State for adding a player
  const [selectedAddUser, setSelectedAddUser] = useState<string>("");
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);
  const [isAddPending, setIsAddPending] = useState(false);

  // Calculate game total net sum to check balance (should be 0)
  const totalScore = game.players.reduce((sum: number, p: any) => sum + p.score, 0);
  const isBalanced = totalScore === 0;

  // Filter users who are not already in the game
  const activeUsernames = game.players.map((p: any) => p.username);
  const availableUsersToAdd = allUsers.filter(
    (u) => u.role !== "admin" && !activeUsernames.includes(u.username)
  );

  const getUserAvatar = (username: string) => {
    const user = allUsers.find(u => u.username === username);
    return user?.avatarUrl || null;
  };

  const getIncrementValue = () => {
    if (customIncrement) {
      const parsed = parseFloat(customIncrement);
      return isNaN(parsed) ? 5 : parsed;
    }
    return increment;
  };

  const handleScoreChange = async (userId: string, change: number) => {
    if (!isAdmin) return;
    startTransition(async () => {
      await updatePlayerScoreAction(game._id, userId, change);
    });
  };

  const handleDecreaseAll = async (amount: number) => {
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to deduct ${amount} TND from ALL players?`)) return;
    startTransition(async () => {
      await decreaseAllPlayersScoreAction(game._id, amount);
    });
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!lender || !borrower || borrowAmount <= 0) {
      setTxError("Lender, borrower, and a valid amount are required.");
      return;
    }

    if (lender === borrower) {
      setTxError("Lender and borrower cannot be the same player.");
      return;
    }

    setTxError(null);
    setTxSuccess(null);
    setIsTxPending(true);

    try {
      const res = await recordBorrowAction(game._id, lender, borrower, borrowAmount);
      if (res && res.error) {
        setTxError(res.error);
      } else {
        setTxSuccess(`Success! Transfer of ${borrowAmount} TND from ${lender} to ${borrower} logged.`);
        setBorrowAmount(0);
        setLender("");
        setBorrower("");
        setTimeout(() => setTxSuccess(null), 4000);
      }
    } catch (err: any) {
      setTxError(err.message || "An error occurred");
    } finally {
      setIsTxPending(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!selectedAddUser) {
      setAddPlayerError("Please select a player to add.");
      return;
    }

    setAddPlayerError(null);
    setIsAddPending(true);

    try {
      const res = await addPlayerToGameAction(game._id, selectedAddUser);
      if (res && res.error) {
        setAddPlayerError(res.error);
      } else {
        setSelectedAddUser("");
      }
    } catch (err: any) {
      setAddPlayerError(err.message || "An error occurred");
    } finally {
      setIsAddPending(false);
    }
  };

  const handleRemovePlayer = async (userId: string, username: string) => {
    if (!isAdmin) return;
    if (
      !confirm(
        `Are you sure you want to remove ${username} from the game? Their current score in this session will be lost.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      await removePlayerFromGameAction(game._id, userId);
    });
  };

  const handleEndGame = async () => {
    if (!isAdmin) return;
    let message = "Are you sure you want to end this game and save the final balances?";
    if (!isBalanced) {
      message = `WARNING: The game is not balanced (Net Total is ${totalScore} TND). A balanced game should sum to 0. Do you still want to save and end this game?`;
    }

    if (!confirm(message)) {
      return;
    }

    startTransition(async () => {
      await endGameAction(game._id);
    });
  };

  // Dynamic card suit generator based on username
  const getPlayerSuit = (username: string) => {
    const suits = [
      { char: "♠", color: "text-zinc-900 dark:text-zinc-600/80" },
      { char: "♥", color: "text-red-500 dark:text-red-500/80" },
      { char: "♦", color: "text-red-500 dark:text-red-500/80" },
      { char: "♣", color: "text-zinc-900 dark:text-zinc-600/80" },
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % suits.length;
    return suits[index];
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Game Header Metrics - Redesigned to be Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game State Card */}
        <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-red-500/20" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mb-3 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Session
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Lobby Status</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Started {new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/20 text-red-600 dark:text-red-500 border border-red-500/20 rounded-2xl shadow-inner relative z-10">
            <Spade className="w-8 h-8 fill-current" />
          </div>
        </div>

        {/* Increment / Controls Config (Admin Only) */}
        <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-emerald-500/10" />
          <p className="text-zinc-400 text-xs font-black uppercase tracking-widest relative z-10 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            {isAdmin ? "Chip Denomination" : "Active Players"}
          </p>
          {isAdmin ? (
            <div className="flex items-center gap-2 relative z-10">
              {[1, 5, 10, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setIncrement(val);
                    setCustomIncrement("");
                  }}
                  className={`flex-1 py-2.5 text-sm font-black rounded-xl border transition-all cursor-pointer ${
                    increment === val && !customIncrement
                      ? "bg-gradient-to-b from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-lg scale-105"
                      : "bg-white/50 dark:bg-zinc-950/50 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900"
                  }`}
                >
                  {val}
                </button>
              ))}
              <input
                type="number"
                placeholder="Custom"
                value={customIncrement}
                onChange={(e) => {
                  setCustomIncrement(e.target.value);
                  setIncrement(0);
                }}
                className="w-20 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-3 py-2.5 text-sm rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 focus:border-red-500 focus:outline-none text-center font-black font-mono shadow-inner transition-all"
              />
            </div>
          ) : (
            <div className="text-xl font-black text-zinc-900 dark:text-white relative z-10">
              {game.players.length} Players at table
            </div>
          )}
        </div>

        {/* Balance Status Card */}
        <div className={`backdrop-blur-md border rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden transition-all duration-300 group ${
          isBalanced ? "bg-white/50 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50" : "bg-red-50/50 dark:bg-red-950/20 border-red-500/30"
        }`}>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[3rem] pointer-events-none transition-all duration-500 ${
            isBalanced ? "bg-emerald-500/5 group-hover:bg-emerald-500/10" : "bg-red-500/10 group-hover:bg-red-500/20"
          }`} />
          
          <div className="relative z-10">
            <p className="text-zinc-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 mb-2">
              Net Balance
            </p>
            <h3 className={`text-3xl font-black font-mono tracking-tighter flex items-center gap-2 ${
              isBalanced ? "text-zinc-900 dark:text-white" : "text-red-600 dark:text-red-500"
            }`}>
              {formatTnd(totalScore)}
              {isBalanced && <span className="text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg tracking-normal">PERFECT</span>}
            </h3>
            <span className="text-xs font-bold text-zinc-500 block mt-1.5">
              {isBalanced
                ? "Lobby is balanced (Net 0 TND)"
                : "Unbalanced: scores do not sum to 0"}
            </span>
          </div>
          <div className="relative z-10">
            {isBalanced ? (
              <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 rounded-2xl shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="p-3 bg-gradient-to-br from-red-500/10 to-orange-500/20 text-red-600 dark:text-red-500 border border-red-500/20 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roster Grid - Premium Playing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {game.players.map((player: any) => {
          const isPositive = player.score > 0;
          const isNegative = player.score < 0;
          const suitInfo = getPlayerSuit(player.username);

          return (
            <div
              key={player.userId}
              className={`relative overflow-hidden bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border rounded-[2rem] p-6 shadow-xl flex flex-col justify-between items-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] ${
                isPositive
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : isNegative
                  ? "border-red-500/30 hover:border-red-500/60"
                  : "border-zinc-200/50 dark:border-zinc-700/50 hover:border-zinc-500/50"
              }`}
            >
              {/* Card background glowing orb */}
              <div className={`absolute -inset-24 opacity-0 blur-[4rem] rounded-full pointer-events-none transition-all duration-700 group-hover:opacity-30 ${
                isPositive ? "bg-emerald-500" : isNegative ? "bg-red-500" : "bg-zinc-500"
              }`} />

              {/* Playing Card Corner Decor - Top Left */}
              <div className={`absolute top-5 left-5 text-lg font-black flex flex-col items-center select-none ${suitInfo.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                <span>{player.username.charAt(0).toUpperCase()}</span>
                <span className="leading-none text-2xl">{suitInfo.char}</span>
              </div>

              {/* Playing Card Corner Decor - Bottom Right (Rotated) */}
              <div className={`absolute bottom-5 right-5 text-lg font-black flex flex-col items-center select-none rotate-180 ${suitInfo.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                <span>{player.username.charAt(0).toUpperCase()}</span>
                <span className="leading-none text-2xl">{suitInfo.char}</span>
              </div>

              {/* Delete button (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => handleRemovePlayer(player.userId, player.username)}
                  className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-red-50 dark:bg-zinc-950/40 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-md z-20"
                  title="Remove player from game"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Center Suit or Avatar */}
              <div className="mt-8 mb-4 relative z-10">
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-full blur-xl scale-150" />
                <PlayerAvatar 
                   username={player.username} 
                   avatarUrl={getUserAvatar(player.username)} 
                   size="lg" 
                   showRing={isPositive || isNegative} 
                   ringColor={isPositive ? "#10b981" : isNegative ? "#ef4444" : undefined}
                />
              </div>

              {/* Username */}
              <h4 className="text-2xl font-black text-zinc-900 dark:text-white capitalize tracking-wide mb-1 z-10 drop-shadow-sm">{player.username}</h4>
              
              {/* Trend indicator */}
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-6 z-10 ${
                isPositive ? "text-emerald-600 dark:text-emerald-400" : isNegative ? "text-red-600 dark:text-red-400" : "text-zinc-500"
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <span className="w-3 h-3 block rounded-full bg-zinc-500/20 border border-zinc-500/50" />}
                {isPositive ? "Winning" : isNegative ? "Losing" : "Even"}
              </div>

              {/* Current Score Display & Controls */}
              <div className="w-full flex items-center justify-between gap-2 z-10 bg-white/40 dark:bg-zinc-950/40 p-2 rounded-[1.5rem] border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md">
                {isAdmin ? (
                  <button
                    onClick={() => handleScoreChange(player.userId, -getIncrementValue())}
                    disabled={isPending}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
                    title="Subtract Chips (Red Chip)"
                  >
                    <Minus className="w-6 h-6 stroke-[3]" />
                  </button>
                ) : <div className="w-12" />}

                <div className="flex-1 flex flex-col items-center justify-center min-w-[90px]">
                  <span className={`text-3xl font-black font-mono tracking-tighter block ${
                    isPositive ? "text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" : isNegative ? "text-red-600 dark:text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "text-zinc-700 dark:text-zinc-300"
                  }`}>
                    {player.score > 0 ? "+" : ""}
                    {player.score}
                  </span>
                  <span className="text-[10px] text-zinc-500 block font-bold font-mono tracking-widest mt-0.5">
                    ({player.score / 2} BUY-IN)
                  </span>
                </div>

                {isAdmin ? (
                  <button
                    onClick={() => handleScoreChange(player.userId, getIncrementValue())}
                    disabled={isPending}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 hover:from-zinc-700 hover:to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 dark:hover:from-white dark:hover:to-zinc-200 text-white dark:text-zinc-900 shadow-lg active:scale-90 transition-all cursor-pointer disabled:opacity-50"
                    title="Add Chips (Black/White Chip)"
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </button>
                ) : <div className="w-12" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Operations Section */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Visual Transaction Logger - Takes up more space */}
          <div className="lg:col-span-8 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
             {/* Abstract Glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500/5 rounded-full blur-[4rem] pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400 rounded-2xl shadow-inner border border-red-500/20">
                <HandCoins className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Express Chip Transfer</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Visually log borrows and transfers between players</p>
              </div>
            </div>

            <form onSubmit={handleBorrow} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1: Giver */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px]">1</span>
                    Who is Giving? (Lender +)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {game.players.map((p: any) => (
                      <button
                        key={p.userId}
                        type="button"
                        onClick={() => {
                          setLender(p.username);
                          if (borrower === p.username) setBorrower("");
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                          lender === p.username 
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-105" 
                            : "bg-white/50 dark:bg-zinc-950/50 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:scale-105"
                        }`}
                      >
                        <PlayerAvatar username={p.username} avatarUrl={getUserAvatar(p.username)} size="md" showRing={lender === p.username} ringColor="#10b981" />
                        <span className="font-bold text-xs">{p.username}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Receiver */}
                <div className={`space-y-4 transition-all duration-500 ${!lender ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                  <label className="flex items-center gap-2 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px]">2</span>
                    Who is Receiving? (Borrower −)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {game.players.filter((p: any) => p.username !== lender).map((p: any) => (
                      <button
                        key={p.userId}
                        type="button"
                        onClick={() => setBorrower(p.username)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                          borrower === p.username 
                            ? "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)] scale-105" 
                            : "bg-white/50 dark:bg-zinc-950/50 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:scale-105"
                        }`}
                      >
                        <PlayerAvatar username={p.username} avatarUrl={getUserAvatar(p.username)} size="md" showRing={borrower === p.username} ringColor="#ef4444" />
                        <span className="font-bold text-xs">{p.username}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Amount */}
              <div className={`space-y-4 transition-all duration-500 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 ${(!lender || !borrower) ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                <label className="flex items-center gap-2 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px]">3</span>
                  Select Amount (TND)
                </label>
                
                <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-inner flex flex-col lg:flex-row items-center gap-6">
                  {/* +/- Control */}
                  <div className="flex items-center justify-between lg:justify-start gap-6 w-full lg:w-auto">
                    <button 
                      type="button" 
                      onClick={() => setBorrowAmount(Math.max(0, borrowAmount - 1))} 
                      className="w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl text-zinc-600 dark:text-zinc-300 shadow-sm transition-all active:scale-90"
                    >
                      <Minus className="w-7 h-7 stroke-[3]" />
                    </button>
                    
                    <div className="flex flex-col items-center justify-center min-w-[100px]">
                      <span className="text-6xl font-black font-mono text-zinc-900 dark:text-white tracking-tighter">{borrowAmount}</span>
                      <span className="text-xs text-zinc-400 font-black uppercase tracking-widest mt-1">TND</span>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => setBorrowAmount(borrowAmount + 1)} 
                      className="w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl text-zinc-600 dark:text-zinc-300 shadow-sm transition-all active:scale-90"
                    >
                      <Plus className="w-7 h-7 stroke-[3]" />
                    </button>
                  </div>

                  <div className="hidden lg:block w-px h-16 bg-zinc-200 dark:bg-zinc-800" />

                  {/* Quick Chips */}
                  <div className="flex-1 w-full grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button 
                        key={val} 
                        type="button" 
                        onClick={() => setBorrowAmount(borrowAmount + val)}
                        className="py-4 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-black text-lg transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md active:scale-90 flex flex-col items-center justify-center gap-1"
                      >
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">ADD</span>
                        +{val}
                      </button>
                    ))}
                  </div>

                  <button 
                      type="button" 
                      onClick={() => setBorrowAmount(0)}
                      className="lg:ml-2 py-4 px-6 bg-red-50/50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm transition-all border border-red-200 dark:border-red-500/20 active:scale-90 whitespace-nowrap"
                    >
                      CLEAR
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              <div className="min-h-[48px]">
                {txError && (
                  <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-sm py-3 px-4 rounded-xl font-bold animate-in fade-in slide-in-from-bottom-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {txError}
                  </div>
                )}

                {txSuccess && (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-sm py-3 px-4 rounded-xl font-bold animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    {txSuccess}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isTxPending || !lender || !borrower || borrowAmount <= 0}
                className="w-full py-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-xl tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:grayscale cursor-pointer shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.4)] active:scale-[0.98]"
              >
                {isTxPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Confirm Chip Transfer
                    <ArrowRight className="w-6 h-6 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Add Player & End Game */}
          <div className="lg:col-span-4 space-y-8 flex flex-col">
            {/* Add Players to Game */}
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">Add Player</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-0.5">Invite to table</p>
                </div>
              </div>

              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <select
                    value={selectedAddUser}
                    onChange={(e) => setSelectedAddUser(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:border-red-500 focus:outline-none text-sm cursor-pointer font-bold shadow-sm"
                  >
                    <option value="">Choose a player...</option>
                    {availableUsersToAdd.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                  {availableUsersToAdd.length === 0 && (
                    <span className="text-xs text-zinc-500 mt-2 block font-medium">
                      All registered players are in the game.
                    </span>
                  )}
                </div>

                {addPlayerError && (
                  <div className="text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-xs p-3 rounded-xl text-center font-bold">
                    {addPlayerError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAddPending || !selectedAddUser}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-black rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  {isAddPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5 stroke-[3]" />
                      Add to Lobby
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Decrease All Players */}
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 shadow-xl space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-red-500/20" />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 bg-red-500/10 text-red-600 dark:text-red-500 rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">Decrease All</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black mt-0.5 uppercase tracking-widest">Subtract from everyone</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 relative z-10">
                 {[1, 2, 3, 4, 5].map(val => (
                   <button
                     key={val}
                     onClick={() => handleDecreaseAll(val)}
                     disabled={isPending || game.players.length === 0}
                     className="py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-900 dark:text-white rounded-xl font-black text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:grayscale"
                     title={`Deduct ${val} from all players`}
                   >
                     -{val}
                   </button>
                 ))}
              </div>
            </div>

            {/* End Game Actions */}
            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 shadow-xl flex-1 flex flex-col justify-between gap-6 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-[3rem] pointer-events-none transition-all group-hover:bg-red-500/10" />
              
              <div className="space-y-3 relative z-10">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Finalize Gameplay</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium">
                  Closing the lobby locks player scores and permanently adds these results to their global accounts.
                </p>
                {!isBalanced && (
                  <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs mt-3 font-bold animate-pulse">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>
                      Lobby is unbalanced. Scores should sum to 0 before closing.
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 relative z-10">
                <button
                  onClick={handleEndGame}
                  disabled={isPending}
                  className="w-full py-4 bg-zinc-900 dark:bg-zinc-800 hover:bg-red-600 dark:hover:bg-red-600 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-50 cursor-pointer group active:scale-[0.98]"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      End Game & Save
                    </>
                  )}
                </button>

                <Link
                  href="/dashboard"
                  className="w-full py-3 bg-white/50 hover:bg-white dark:bg-zinc-950/50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold rounded-xl flex items-center justify-center text-sm transition-all"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Log (Audit Log) */}
      <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-900 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight" style={{ fontFamily: "var(--font-orbitron, inherit)" }}>TRANSACTION LOG</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Timeline of chip transfers in this session</p>
          </div>
        </div>

        {game.transactions.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/50 dark:bg-zinc-950/50 border border-dashed border-zinc-300 dark:border-zinc-800">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">No transactions recorded yet</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {[...game.transactions].reverse().map((tx: any, idx: number) => {
              const fromPlayer = game.players.find((p: any) => p.username === tx.fromUser);
              const toPlayer = game.players.find((p: any) => p.username === tx.toUser);
              return (
                <div
                  key={tx._id || idx}
                  className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Giver (lender) */}
                  <div className="flex items-center gap-3 w-1/3">
                    <PlayerAvatar
                      username={tx.fromUser}
                      avatarUrl={getUserAvatar(tx.fromUser)}
                      size="md"
                      showRing
                      ringColor="#10b981"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 capitalize tracking-wide">
                        {tx.fromUser}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Lender +</span>
                    </div>
                  </div>

                  {/* Amount Badge */}
                  <div className="flex flex-col items-center gap-1.5 w-1/3 shrink-0">
                    <div className="px-5 py-2 rounded-xl font-mono font-black text-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm flex items-center gap-2">
                      <MoveRight className="w-4 h-4 text-zinc-400" />
                      {formatTnd(tx.amount)}
                      <MoveRight className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold tracking-widest">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {/* Receiver (borrower) */}
                  <div className="flex items-center justify-end gap-3 w-1/3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 capitalize tracking-wide">
                        {tx.toUser}
                      </span>
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">Borrower −</span>
                    </div>
                    <PlayerAvatar
                      username={tx.toUser}
                      avatarUrl={getUserAvatar(tx.toUser)}
                      size="md"
                      showRing
                      ringColor="#ef4444"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
