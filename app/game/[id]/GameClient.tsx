"use client";

import { useState, useTransition } from "react";
import {
  updatePlayerScoreAction,
  recordBorrowAction,
  addPlayerToGameAction,
  removePlayerFromGameAction,
  endGameAction,
} from "../../actions";
import { formatTnd } from "../../../lib/utils";
import {
  Spade,
  Plus,
  Minus,
  ArrowRightLeft,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Loader2,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

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

  // State for transaction logger
  const [lender, setLender] = useState<string>("");
  const [borrower, setBorrower] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<string>("");
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

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!lender || !borrower || !borrowAmount) {
      setTxError("Lender, borrower, and amount are required.");
      return;
    }

    const amount = parseFloat(borrowAmount);
    if (isNaN(amount) || amount <= 0) {
      setTxError("Please enter a valid positive amount.");
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
      const res = await recordBorrowAction(game._id, lender, borrower, amount);
      if (res && res.error) {
        setTxError(res.error);
      } else {
        setTxSuccess(`Logged: ${borrower} borrowed ${amount} TND from ${lender}`);
        setBorrowAmount("");
        setTimeout(() => setTxSuccess(null), 3000);
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
      { char: "♠", color: "text-zinc-950 dark:text-zinc-400" },
      { char: "♥", color: "text-red-650 dark:text-red-500" },
      { char: "♦", color: "text-red-650 dark:text-red-500" },
      { char: "♣", color: "text-zinc-950 dark:text-zinc-400" },
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % suits.length;
    return suits[index];
  };

  return (
    <div className="space-y-8">
      {/* Game Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game State Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-550/10 text-red-650 dark:text-red-400 border border-red-500/20 mb-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500" />
              Live Gameplay
            </span>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Lobby Status</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-405 mt-0.5 font-medium">
              Started {new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-650 dark:text-red-500 border border-red-500/20 rounded-xl">
            <Spade className="w-8 h-8 fill-current" />
          </div>
        </div>

        {/* Increment / Controls Config (Admin Only) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3 transition-colors">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            {isAdmin ? "Adjust Increment Step" : "Active Players"}
          </p>
          {isAdmin ? (
            <div className="flex items-center gap-2">
              {[1, 5, 10, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setIncrement(val);
                    setCustomIncrement("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${
                    increment === val && !customIncrement
                      ? "bg-red-605 border-red-605 text-white shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                  }`}
                >
                  {val} TND
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
                className="w-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-850 focus:border-red-600 dark:focus:border-red-500 focus:outline-none text-center font-extrabold font-mono"
              />
            </div>
          ) : (
            <div className="text-sm font-bold text-zinc-950 dark:text-white">
              {game.players.length} Players on the table
            </div>
          )}
        </div>

        {/* Balance Status Card */}
        <div className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm flex items-center justify-between transition-colors duration-200 ${
          isBalanced ? "border-zinc-200 dark:border-zinc-800" : "border-red-500/35"
        }`}>
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Net Game Balance</p>
            <h3 className={`text-2xl font-black font-mono mt-1 ${
              isBalanced ? "text-zinc-950 dark:text-white" : "text-red-600 dark:text-red-500"
            }`}>
              {formatTnd(totalScore)}
            </h3>
            <span className="text-[11px] font-bold text-zinc-500 block mt-0.5">
              {isBalanced
                ? "Lobby is balanced (Net 0 TND)"
                : "Unbalanced: scores do not sum to 0"}
            </span>
          </div>
          <div>
            {isBalanced ? (
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-950 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850 rounded-xl" title="Lobby is balanced">
                <CheckCircle className="w-6 h-6" />
              </div>
            ) : (
              <div className="p-2.5 bg-red-550/10 text-red-650 dark:text-red-500 rounded-xl animate-bounce" title="Total sum must equal 0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roster Grid - playing card style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {game.players.map((player: any) => {
          const isPositive = player.score > 0;
          const isNegative = player.score < 0;
          const suitInfo = getPlayerSuit(player.username);

          return (
            <div
              key={player.userId}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-md relative flex flex-col justify-between items-center group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                isPositive
                  ? "border-zinc-350 dark:border-zinc-700"
                  : isNegative
                  ? "border-red-600 dark:border-red-500/50"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {/* Playing Card Corner Decor - Top Left */}
              <div className={`absolute top-3 left-3 text-xs font-bold flex flex-col items-center select-none ${suitInfo.color}`}>
                <span>{player.username.charAt(0).toUpperCase()}</span>
                <span className="leading-none mt-0.5">{suitInfo.char}</span>
              </div>

              {/* Playing Card Corner Decor - Bottom Right (Rotated) */}
              <div className={`absolute bottom-3 right-3 text-xs font-bold flex flex-col items-center select-none rotate-180 ${suitInfo.color}`}>
                <span>{player.username.charAt(0).toUpperCase()}</span>
                <span className="leading-none mt-0.5">{suitInfo.char}</span>
              </div>

              {/* Delete button (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => handleRemovePlayer(player.userId, player.username)}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-950/60 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-850 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Remove player from game"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Dynamic Center Suit Icon */}
              <div className={`text-4xl my-3 select-none ${suitInfo.color}`}>
                {suitInfo.char}
              </div>

              {/* Username */}
              <h4 className="text-lg font-black text-zinc-950 dark:text-white capitalize tracking-wide mb-1">{player.username}</h4>

              {/* Current Score Display */}
              <div className="my-4 flex items-center gap-4 z-10">
                {isAdmin && (
                  <button
                    onClick={() => handleScoreChange(player.userId, -getIncrementValue())}
                    disabled={isPending}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    title="Subtract Chips (Red Chip)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}

                <div className="text-center min-w-[85px]">
                  <span className={`text-2xl font-black font-mono tracking-tight block ${
                    isPositive ? "text-emerald-600 dark:text-emerald-450" : isNegative ? "text-red-600 dark:text-red-500" : "text-zinc-500"
                  }`}>
                    {player.score > 0 ? "+" : ""}
                    {player.score}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 block font-bold font-mono mt-0.5">
                    ({player.score / 2})
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleScoreChange(player.userId, getIncrementValue())}
                    disabled={isPending}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    title="Add Chips (Black/White Chip)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Operations Section */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Borrow Transaction Logger */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Log Borrow Transaction</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Record chip transfers between players</p>
              </div>
            </div>

            <form onSubmit={handleBorrow} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-650 dark:text-zinc-400 text-xs font-semibold mb-1.5">Lender (Giver +)</label>
                  <select
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-950 dark:text-white px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:outline-none text-sm cursor-pointer font-semibold"
                  >
                    <option value="">Select...</option>
                    {game.players.map((p: any) => (
                      <option key={p.userId} value={p.username}>
                        {p.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-655 dark:text-zinc-400 text-xs font-semibold mb-1.5">Borrower (Getter -)</label>
                  <select
                    value={borrower}
                    onChange={(e) => setBorrower(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-950 dark:text-white px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:outline-none text-sm cursor-pointer font-semibold"
                  >
                    <option value="">Select...</option>
                    {game.players.map((p: any) => (
                      <option key={p.userId} value={p.username}>
                        {p.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-650 dark:text-zinc-400 text-xs font-semibold mb-1.5">Amount (TND)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:outline-none text-sm font-bold font-mono"
                />
              </div>

              {txError && (
                <div className="text-red-650 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-xs p-2.5 rounded-lg text-center font-bold">
                  {txError}
                </div>
              )}

              {txSuccess && (
                <div className="text-emerald-650 dark:text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 text-xs p-2.5 rounded-lg text-center font-bold">
                  {txSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isTxPending}
                className="w-full py-2.5 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isTxPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Record Transaction
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Add Players to Game */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Add Player to Session</h3>
                <p className="text-zinc-550 dark:text-zinc-400 text-xs font-medium">Let a registered player join this lobby</p>
              </div>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-zinc-650 dark:text-zinc-400 text-xs font-semibold mb-1.5">Select Player</label>
                <select
                  value={selectedAddUser}
                  onChange={(e) => setSelectedAddUser(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-950 dark:text-white px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:border-red-600 dark:focus:border-red-500 focus:outline-none text-sm cursor-pointer font-semibold"
                >
                  <option value="">Choose a player...</option>
                  {availableUsersToAdd.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.username}
                    </option>
                  ))}
                </select>
                {availableUsersToAdd.length === 0 && (
                  <span className="text-[11px] text-zinc-500 mt-1.5 block font-medium">
                    All registered players are in the game.
                  </span>
                )}
              </div>

              {addPlayerError && (
                <div className="text-red-650 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-xs p-2.5 rounded-lg text-center font-bold">
                  {addPlayerError}
                </div>
              )}

              <button
                type="submit"
                disabled={isAddPending || !selectedAddUser}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-850 font-bold rounded-lg flex items-center justify-center gap-1.5 text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {isAddPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Selected Player
                  </>
                )}
              </button>
            </form>
          </div>

          {/* End Game Actions */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Finalize Gameplay</h3>
              <p className="text-zinc-550 dark:text-zinc-400 text-xs leading-relaxed font-medium">
                Clicking this will close the lobby, lock player scores, and permanently add these results to players' global accounts.
              </p>
              {!isBalanced && (
                <div className="flex gap-2 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-650 dark:text-red-500 text-xs mt-3 leading-relaxed font-bold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>
                    Caution: The lobby is unbalanced. It is recommended to settle scores (summing to 0) before closing.
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleEndGame}
                disabled={isPending}
                className="w-full py-3 bg-red-600 hover:bg-red-750 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_15px_rgba(220,38,38,0.2)] disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 fill-current" />
                    End Game & Save Results
                  </>
                )}
              </button>

              <Link
                href="/dashboard"
                className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white font-bold rounded-xl flex items-center justify-center text-sm transition-all"
              >
                Go back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Log (Audit Log) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-650 dark:text-red-500 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Lobby Transaction Log</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Timeline of borrow / lend activities logged in this game</p>
          </div>
        </div>

        {game.transactions.length === 0 ? (
          <p className="text-zinc-550 text-sm text-center py-6 font-medium">
            No transactions have been recorded in this game session yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {[...game.transactions].reverse().map((tx: any, idx: number) => (
              <div
                key={tx._id || idx}
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-sm transition-colors"
              >
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-300 font-semibold">
                  <span className="font-extrabold text-red-600 dark:text-red-400 capitalize">{tx.toUser}</span>
                  <span className="text-zinc-500 dark:text-zinc-500 text-xs font-medium">borrowed</span>
                  <span className="font-mono font-bold text-zinc-950 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    {formatTnd(tx.amount)}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-500 text-xs font-medium">from</span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-200 capitalize">{tx.fromUser}</span>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
