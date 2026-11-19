"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updatePlayerScoreAction,
  rebuyPlayerAction,
  recordBorrowAction,
  undoLastAction,
  addMultiplePlayersToGameAction,
  removePlayerFromGameAction,
  endGameAction,
  decreaseAllPlayersScoreAction,
} from "../../actions";
import { formatTnd, formatCompactMoney } from "../../../lib/utils";
import {
  Spade,
  RotateCcw,
  HandCoins,
  ArrowRight,
  ArrowLeftRight,
  Trash2,
  Users,
  Coins,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import PlayerAvatar from "../../../components/PlayerAvatar";
import PokerChip from "../../../components/PokerChip";
import SettleUpModal from "../../../components/SettleUpModal";

interface GameClientProps {
  game: any;
  currentUser: { username: string; role: "admin" | "player" };
  allUsers: any[];
  playerBalances?: Record<string, number>;
}

const SUIT_LIST = [
  { symbol: "♠", name: "Spade", color: "text-white", border: "border-zinc-700", glow: "rgba(255,255,255,0.12)" },
  { symbol: "♥", name: "Heart", color: "text-red-500", border: "border-red-900/60", glow: "rgba(239,68,68,0.25)" },
  { symbol: "♣", name: "Trèfle", color: "text-white", border: "border-zinc-700", glow: "rgba(255,255,255,0.12)" },
  { symbol: "♦", name: "Diamond", color: "text-red-500", border: "border-red-900/60", glow: "rgba(239,68,68,0.25)" },
];

export default function GameClient({
  game,
  currentUser,
  allUsers,
  playerBalances = {},
}: GameClientProps) {
  const isAdmin = currentUser.role === "admin";
  const [isPending, startTransition] = useTransition();

  // Exchange state (Permanent In-Line Bar under cards)
  const [lender, setLender] = useState<string>(""); // Giver
  const [borrower, setBorrower] = useState<string>(""); // Receiver
  const [transferAmount, setTransferAmount] = useState<number>(1);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Per-card Montant input state for direct score +/-
  const [cardMontants, setCardMontants] = useState<Record<string, number>>({});

  // Settle Up Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);

  // Custom Website Confirmation Modals (replacing browser alerts)
  const [decreaseAllModalOpen, setDecreaseAllModalOpen] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ userId: string; username: string } | null>(null);
  const [endGameModalOpen, setEndGameModalOpen] = useState(false);
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  // Add player state (multi-select)
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [addError, setAddError] = useState<string | null>(null);

  // Status notification message
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const players = Array.isArray(game?.players) ? game.players : [];
  const totalScore = players.reduce((sum: number, p: any) => sum + (Number(p?.score) || 0), 0);
  const isBalanced = totalScore === 0;

  const activeUsernames = players.map((p: any) => p?.username).filter(Boolean);
  const availableUsersToAdd = (allUsers || []).filter(
    (u) => u?.role !== "admin" && !activeUsernames.includes(u?.username)
  );

  const avatarMap: Record<string, string | null> = {};
  (allUsers || []).forEach((u) => {
    if (u?.username) {
      avatarMap[u.username] = u.avatarUrl || null;
    }
  });

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const getMontant = (userId: string) => cardMontants[userId] ?? 5;
  const setMontant = (userId: string, val: number) => {
    setCardMontants((prev) => ({ ...prev, [userId]: Math.max(1, val) }));
  };

  // Adjust score from card (+ / -)
  const handleScoreAdjust = (userId: string, isAdd: boolean) => {
    if (!isAdmin) return;
    const amount = getMontant(userId);
    const delta = isAdd ? amount : -amount;
    startTransition(async () => {
      await updatePlayerScoreAction(game._id, userId, delta);
      showNotification(`${delta > 0 ? "+" : ""}${delta} TND applied`);
    });
  };

  // Undo Last Action
  const handleUndo = async () => {
    if (!isAdmin) return;
    startTransition(async () => {
      const res = await undoLastAction(game._id);
      if (res && "error" in res && res.error) {
        showNotification(`Undo failed: ${res.error}`);
      } else if (res && res.undoneDescription) {
        showNotification(`Undone: ${res.undoneDescription}`);
      } else {
        showNotification("Last action undone");
      }
    });
  };

  // Exchange Execute
  const handleExchangeSubmit = async () => {
    if (!isAdmin) return;
    if (!lender || !borrower || transferAmount <= 0) {
      setTransferError("Select both the giver, the receiver, and a chip amount.");
      return;
    }
    if (lender === borrower) {
      setTransferError("Giver and receiver cannot be the same player.");
      return;
    }

    setTransferError(null);
    startTransition(async () => {
      const res = await recordBorrowAction(game._id, lender, borrower, transferAmount);
      if (res && "error" in res && res.error) {
        setTransferError(res.error);
      } else {
        showNotification(`Exchange: ${lender} gave ${transferAmount} chip(s) to ${borrower}`);
        setBorrower("");
        setTransferAmount(1);
      }
    });
  };

  // Add Multiple Players at once
  const handleAddPlayers = async () => {
    if (!isAdmin || selectedToAdd.length === 0) return;
    setAddError(null);
    startTransition(async () => {
      const res = await addMultiplePlayersToGameAction(game._id, selectedToAdd);
      if (res && "error" in res && res.error) {
        setAddError(res.error);
      } else {
        const count = selectedToAdd.length;
        setSelectedToAdd([]);
        setSeatModalOpen(false);
        showNotification(`${count} player(s) seated at the table`);
      }
    });
  };

  const toggleSelectToAdd = (userId: string) => {
    setSelectedToAdd((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Decrease ALL players score by amount (-6) via Custom Modal
  const confirmDecreaseAll = () => {
    if (!isAdmin) return;
    startTransition(async () => {
      const res = await decreaseAllPlayersScoreAction(game._id, 6);
      setDecreaseAllModalOpen(false);
      if (res && "error" in res && res.error) {
        showNotification(`Error: ${res.error}`);
      } else {
        showNotification("-6 TND deducted from all players");
      }
    });
  };

  // Cash out player via Custom Modal
  const confirmRemovePlayer = () => {
    if (!isAdmin || !playerToRemove) return;
    const { userId, username } = playerToRemove;
    startTransition(async () => {
      const res = await removePlayerFromGameAction(game._id, userId);
      setPlayerToRemove(null);
      if (res && "error" in res && res.error) {
        showNotification(`Error: ${res.error}`);
      } else {
        showNotification(`${username} cashed out`);
      }
    });
  };

  // End Game via Custom Modal
  const confirmEndGame = () => {
    if (!isAdmin) return;
    startTransition(async () => {
      const res = await endGameAction(game._id);
      setEndGameModalOpen(false);
      if (res && "error" in res && res.error) {
        showNotification(`Error: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Action Notification Toast */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50 bg-red-600 text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(220,38,38,0.8)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> {actionNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Table HUD */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-zinc-950 via-black to-red-950/70 border border-red-900/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black border border-red-600/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <Spade className="w-6 h-6 sm:w-7 sm:h-7 fill-red-600 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                Live Table
              </h2>
            </div>
            <p suppressHydrationWarning className="text-[11px] sm:text-xs text-zinc-400 font-semibold mt-0.5">
              {players.length} Players Seated • Started {game?.date ? new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}
            </p>
          </div>
        </div>

        {/* Center Table Net Balance */}
        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-center">
          <div
            className={`px-3.5 py-2 rounded-2xl border flex flex-col items-center ${
              isBalanced
                ? "bg-black/80 border-zinc-800 text-white"
                : "bg-red-950/40 border-red-600/50 text-red-400 animate-pulse"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Table Net Balance
            </span>
            <span className={`text-base sm:text-lg font-mono font-black ${totalScore > 0 ? "text-emerald-400" : totalScore < 0 ? "text-red-500" : "text-white"}`}>
              {formatTnd(totalScore, true)}
            </span>
            <span className="text-[8px] font-bold uppercase mt-0.5">
              {isBalanced ? "✓ Perfectly Balanced" : "⚠️ Discrepancy"}
            </span>
          </div>

          {/* Quick HUD Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettleModalOpen(true)}
              className="p-2.5 sm:px-3 sm:py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 flex items-center gap-1.5 font-bold text-xs uppercase transition-all cursor-pointer"
              title="Preview Settle Up Debt Payouts"
            >
              <HandCoins className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Settle Up</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleUndo}
                disabled={isPending || !game.actions || game.actions.length <= 1}
                className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold text-xs uppercase transition-all cursor-pointer"
                title="Undo last action"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Admin Quick Action Row: Seat Players + -6 All Button */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2 px-1 flex-wrap"
        >
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            {players.length} Players Seated
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.93 }}
              type="button"
              onClick={() => {
                setSelectedToAdd([]);
                setSeatModalOpen(true);
              }}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider border border-zinc-700 shadow-md transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              Seat Players
              {availableUsersToAdd.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono">
                  +{availableUsersToAdd.length}
                </span>
              )}
            </motion.button>

            {players.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                type="button"
                onClick={() => setDecreaseAllModalOpen(true)}
                disabled={isPending}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_22px_rgba(220,38,38,0.55)] transition-all cursor-pointer disabled:opacity-50 border border-red-500/40"
              >
                <Minus className="w-4 h-4" />
                -6 All
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* 2-COLUMN PLAYING CARDS GRID ON PHONE */}
      {/* Each player card has:
          1. Authentic Ace playing card corners (♠, ♥, ♣, ♦)
          2. Big Player Photo with Rank Badge layered on bottom-right
          3. Username
          4. Big score (+win in green, -loss in red, half in parentheses)
          5. Under score: Montant input with [-] and [+] buttons to adjust score directly!
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {players.map((player: any, idx: number) => {
          const suitInfo = SUIT_LIST[idx % SUIT_LIST.length];
          const isWin = player.score > 0;
          const isLoss = player.score < 0;
          const money = formatCompactMoney(player.score);
          const careerBalance = playerBalances[player.username] ?? 0;
          const currentMontant = getMontant(player.userId);

          return (
            <motion.div
              key={player.userId}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className={`poker-playing-card relative p-3 sm:p-4 flex flex-col justify-between min-h-[300px] select-none ${
                isWin
                  ? "border-emerald-500/40 shadow-[0_8px_25px_rgba(16,185,129,0.12)]"
                  : isLoss
                  ? "border-red-600/50 shadow-[0_8px_25px_rgba(220,38,38,0.2)]"
                  : "border-zinc-800"
              }`}
            >
              {/* Playing Card Top-Left Corner: Ace & Suit */}
              <div className="absolute top-2 left-2.5 flex flex-col items-center leading-none pointer-events-none">
                <span className={`text-xs sm:text-sm font-black ${suitInfo.color}`}>
                  A
                </span>
                <span className={`text-sm sm:text-base ${suitInfo.color}`}>
                  {suitInfo.symbol}
                </span>
              </div>

              {/* Playing Card Bottom-Right Corner: Inverted Ace & Suit */}
              <div className="absolute bottom-2 right-2.5 flex flex-col items-center leading-none rotate-180 pointer-events-none">
                <span className={`text-xs sm:text-sm font-black ${suitInfo.color}`}>
                  A
                </span>
                <span className={`text-sm sm:text-base ${suitInfo.color}`}>
                  {suitInfo.symbol}
                </span>
              </div>

              {/* Watermark Ace Suit in Center of Card */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.035]">
                <span className={`text-8xl sm:text-9xl font-black ${suitInfo.color}`}>
                  {suitInfo.symbol}
                </span>
              </div>

              {/* Card Header: Cashout button + Avatar with Layered Rank Badge */}
              <div className="relative z-10 pt-1">
                <div className="flex items-start justify-end gap-1 mb-1">
                  {isAdmin && (
                    <button
                      onClick={() => setPlayerToRemove({ userId: player.userId, username: player.username })}
                      className="p-1 rounded-lg bg-zinc-900/80 hover:bg-red-600/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Cash out player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Big Player Photo with layered Rank Badge at bottom-right */}
                <div className="flex items-center justify-center mb-1.5">
                  <PlayerAvatar
                    username={player.username}
                    avatarUrl={avatarMap[player.username]}
                    size="md"
                    showRing={true}
                    ringColor={isWin ? "#10b981" : isLoss ? "#ef4444" : "#ffffff"}
                    rankScore={careerBalance}
                  />
                </div>

                {/* Username */}
                <div className="text-center px-1">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase truncate">
                    {player.username}
                  </h3>
                </div>
              </div>

              {/* Card Center: MONEY / SCORE DISPLAY */}
              <div className="my-2 text-center relative z-10 py-1.5 rounded-2xl bg-black/50 border border-white/5">
                <div
                  className={`text-3xl sm:text-4xl font-mono font-black tracking-tight leading-none ${
                    isWin ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" : isLoss ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-white"
                  }`}
                >
                  {money.main}
                </div>
                <div className="text-[10px] sm:text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mt-1">
                  TND <span className={isWin ? "text-emerald-400 font-black" : isLoss ? "text-red-400 font-black" : "text-zinc-400"}>{money.half} TND</span>
                </div>
              </div>

              {/* Card Footer: Montant input with Plus & Minus buttons directly under score */}
              {/* Requirement: "just put the score of him under under it an input to type a montant and plus minus buttons to either add to his score or not" */}
              {isAdmin && (
                <div className="relative z-10 pt-1.5 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between gap-1 bg-black/90 p-1 rounded-2xl border border-zinc-800">
                    {/* Minus Button */}
                    <button
                      type="button"
                      onClick={() => handleScoreAdjust(player.userId, false)}
                      disabled={isPending}
                      className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center font-black transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title={`Subtract ${currentMontant} from score`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    {/* Montant Input */}
                    <div className="flex-1 flex items-center justify-center">
                      <input
                        type="number"
                        min={1}
                        value={currentMontant}
                        onChange={(e) => setMontant(player.userId, parseInt(e.target.value) || 1)}
                        className="w-14 text-center bg-transparent font-mono font-black text-sm text-white outline-none"
                      />
                    </div>

                    {/* Plus Button */}
                    <button
                      type="button"
                      onClick={() => handleScoreAdjust(player.userId, true)}
                      disabled={isPending}
                      className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center font-black transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title={`Add ${currentMontant} to score`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* PERMANENT IN-LINE EXCHANGE BAR UNDER THE CARDS */}
      {/* Requirements:
          1. "in the exchange bar please do it big with icon of exchange"
          2. "dont make me open it each time make all the icons of player under the cards thats teh exchange place make it open always please"
          3. "when u click on icons of a player anothr bar opens with the icons of the other players and so on"
          4. "6 icons +1 +2 +3 +4 +5 +6 will appear u click on one of them and confirm"
          5. "remove the half montant under the chips"
      */}
      {isAdmin && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-7 bg-zinc-950/95 border-2 border-red-900/50 shadow-[0_10px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl space-y-6"
        >
          {/* Big Header with Icon of Exchange */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Exchange Chips <Sparkles className="w-4 h-4 text-red-500" />
                </h2>
                <p className="text-xs text-zinc-400">
                  Tap Giver photo → Tap Receiver photo → Tap chip (+1 to +6) → Confirm
                </p>
              </div>
            </div>

            {lender && (
              <button
                type="button"
                onClick={() => {
                  setLender("");
                  setBorrower("");
                }}
                className="text-xs font-bold uppercase text-zinc-400 hover:text-white px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* STEP 1: GIVER SELECTION (Permanent Player Icons - GREEN) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black">1</span>
                1. Select Giver (Qui donne les jetons)
              </label>
              {lender && (
                <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  Giver: {lender}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {players.map((p: any) => {
                const isSelected = lender === p.username;
                const career = playerBalances[p.username] ?? 0;
                return (
                  <motion.button
                    key={p.userId}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setLender(p.username);
                      if (borrower === p.username) setBorrower("");
                    }}
                    className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 relative cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105"
                        : "bg-black/90 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[9px] font-black shadow-md">
                        ✓
                      </span>
                    )}
                    <PlayerAvatar
                      username={p.username}
                      avatarUrl={avatarMap[p.username]}
                      size="sm"
                      rankScore={career}
                    />
                    <span className="text-xs font-black uppercase truncate max-w-full text-white">
                      {p.username}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: RECEIVER BAR (Opens smoothly when Giver is clicked - RED) */}
          <AnimatePresence>
            {lender && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden space-y-2.5 pt-2 border-t border-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-red-500 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                    2. Select Receiver (Qui reçoit les jetons)
                  </label>
                  {borrower && (
                    <span className="text-xs font-black uppercase text-red-400 bg-red-950 px-3 py-1 rounded-full border border-red-600/60 shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                      Receiver: {borrower}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {players
                    .filter((p: any) => p.username !== lender)
                    .map((p: any) => {
                      const isSelected = borrower === p.username;
                      const career = playerBalances[p.username] ?? 0;
                      return (
                        <motion.button
                          key={p.userId}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setBorrower(p.username)}
                          className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 relative cursor-pointer ${
                            isSelected
                              ? "bg-red-600/30 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-105"
                              : "bg-black/90 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black shadow-md">
                              ✓
                            </span>
                          )}
                          <PlayerAvatar
                            username={p.username}
                            avatarUrl={avatarMap[p.username]}
                            size="sm"
                            rankScore={career}
                          />
                          <span className="text-xs font-black uppercase truncate max-w-full text-white">
                            {p.username}
                          </span>
                        </motion.button>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 3: 6 CHIP ICONS (+1 +2 +3 +4 +5 +6) — WITHOUT HALF VALUE UNDER CHIPS */}
          {/* Requirement: "remove the half montant under the chips and 6 icons +1 +2 +3 +4 +5 +6 will appear" */}
          <AnimatePresence>
            {lender && borrower && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden space-y-4 pt-2 border-t border-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                    3. Select Chips Amount
                  </label>
                  <span className="text-xs font-mono font-black text-white bg-black px-3 py-1 rounded-full border border-zinc-800">
                    Selected: {transferAmount} chip(s)
                  </span>
                </div>

                {/* The 6 Chips: +1, +2, +3, +4, +5, +6 WITHOUT any half montant under them! */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const isSelected = transferAmount === num;
                    return (
                      <motion.button
                        key={num}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setTransferAmount(num)}
                        className={`py-3 px-1 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-red-600/30 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-105"
                            : "bg-black border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <PokerChip
                          size={46}
                          value={`+${num}`}
                          color={num % 2 === 0 ? "red" : "white"}
                        />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quick Higher Chips & Custom Input */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex items-center gap-2">
                    {[10, 20, 50].map((highVal) => (
                      <button
                        key={highVal}
                        type="button"
                        onClick={() => setTransferAmount(highVal)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                          transferAmount === highVal
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800"
                        }`}
                      >
                        +{highVal}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 bg-black px-3 py-1.5 rounded-xl border border-zinc-800">
                    <span className="text-xs text-zinc-500 font-bold uppercase">Custom:</span>
                    <input
                      type="number"
                      min={1}
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-14 text-right bg-transparent text-sm font-mono font-black text-white outline-none"
                    />
                  </div>
                </div>

                {transferError && (
                  <p className="text-red-400 text-xs font-bold bg-red-950/60 p-3 rounded-xl border border-red-600/40">
                    {transferError}
                  </p>
                )}

                {/* CONFIRM EXCHANGE BUTTON */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleExchangeSubmit}
                  disabled={isPending || !lender || !borrower || transferAmount <= 0}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all cursor-pointer disabled:opacity-50"
                >
                  CONFIRM
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Admin Extra Controls: Add Player & Ledger Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {isAdmin && (
          <div className="rounded-3xl p-5 sm:p-6 bg-zinc-950/90 border border-zinc-800 space-y-4 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" /> Seat Players
              </h3>
              <p className="text-xs text-zinc-400">
                {availableUsersToAdd.length === 0
                  ? "All players are currently seated at the table."
                  : `${availableUsersToAdd.length} registered player(s) available to join.`}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                setSelectedToAdd([]);
                setSeatModalOpen(true);
              }}
              disabled={availableUsersToAdd.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 border border-red-500/40"
            >
              <Users className="w-4 h-4" />
              {availableUsersToAdd.length === 0 ? "All Players Seated" : "Open Players List & Add"}
            </motion.button>
          </div>
        )}

        <div className={`space-y-6 ${isAdmin ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="rounded-3xl p-5 sm:p-6 bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-red-500" /> Session Transaction Ledger
              </h3>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {game.transactions ? game.transactions.length : 0} logs
              </span>
            </div>

            {(!game.transactions || game.transactions.length === 0) ? (
              <div className="p-8 text-center text-xs font-bold uppercase text-zinc-500">
                No chip exchanges recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {[...game.transactions].reverse().map((tx: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-black/60 border border-zinc-850 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase text-white">{tx.fromUser}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-red-500" />
                      <span className="font-black uppercase text-emerald-400">{tx.toUser}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-white">
                        {formatTnd(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isAdmin && (
              <div className="pt-4 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={() => setEndGameModalOpen(true)}
                  disabled={isPending}
                  className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer active:scale-95"
                >
                  End Game & Finalize Rankings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM WEBSITE MODAL: -6 ALL PLAYERS */}
      <AnimatePresence>
        {decreaseAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-3xl bg-zinc-950 border-2 border-red-600/70 p-6 shadow-[0_0_50px_rgba(220,38,38,0.6)] space-y-5 text-white"
            >
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500">
                  <Minus className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    -6 All Players
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Apply penalty to all seated players
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-black/70 border border-zinc-800 p-4 space-y-2">
                <p className="text-sm font-bold text-zinc-300">
                  Are you sure you want to deduct <span className="text-red-500 font-black text-base">-6 TND</span> from all <span className="text-white font-black">{players.length}</span> players?
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2 max-h-32 overflow-y-auto">
                  {players.map((p: any) => (
                    <span
                      key={p.userId}
                      className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-black uppercase text-zinc-300 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {p.username}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setDecreaseAllModalOpen(false)}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={confirmDecreaseAll}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(220,38,38,0.7)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? "Applying..." : "CONFIRM -6 ALL"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM WEBSITE MODAL: CASHOUT PLAYER */}
      <AnimatePresence>
        {playerToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl bg-zinc-950 border-2 border-red-600/50 p-6 shadow-[0_0_40px_rgba(220,38,38,0.4)] space-y-5 text-white"
            >
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Cash Out Player
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Remove from live session
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold text-zinc-300">
                Cash out & remove <span className="text-white font-black uppercase">{playerToRemove.username}</span> from this session?
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPlayerToRemove(null)}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={confirmRemovePlayer}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Removing..." : "CONFIRM"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM WEBSITE MODAL: END GAME */}
      <AnimatePresence>
        {endGameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-3xl bg-zinc-950 border-2 border-red-600/60 p-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] space-y-5 text-white"
            >
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500">
                  <Spade className="w-6 h-6 fill-red-600 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    End Game Session
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Finalize scores & save to history
                  </p>
                </div>
              </div>

              {!isBalanced && (
                <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-600 text-red-300 text-xs font-bold space-y-1">
                  <p className="font-black uppercase text-red-200">⚠️ CAUTION: Table Unbalanced</p>
                  <p>Net table balance is {formatTnd(totalScore)}. A balanced game should sum to 0.</p>
                </div>
              )}

              <p className="text-sm font-bold text-zinc-300">
                Are you sure you want to end this game and save the final rankings?
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEndGameModalOpen(false)}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={confirmEndGame}
                  disabled={isPending}
                  className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(220,38,38,0.7)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Ending..." : "CONFIRM END GAME"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM WEBSITE MODAL: SEAT PLAYERS (MULTI-SELECT) */}
      <AnimatePresence>
        {seatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-red-600/70 p-5 sm:p-6 shadow-[0_0_50px_rgba(220,38,38,0.6)] space-y-5 text-white flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shadow-inner">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                      Seat Players
                      {selectedToAdd.length > 0 && (
                        <span className="text-xs font-black bg-emerald-500 text-black px-2.5 py-0.5 rounded-full shadow-md">
                          {selectedToAdd.length} selected
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Tap players to select, then click ADD
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedToAdd([]);
                    setSeatModalOpen(false);
                  }}
                  className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer border border-zinc-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Player Icons Grid */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {availableUsersToAdd.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 font-bold uppercase text-xs">
                    All players are already seated at this table
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {availableUsersToAdd.map((u) => {
                      const isSelected = selectedToAdd.includes(u._id);
                      const career = playerBalances[u.username] ?? 0;
                      return (
                        <motion.button
                          key={u._id}
                          whileTap={{ scale: 0.93 }}
                          type="button"
                          onClick={() => toggleSelectToAdd(u._id)}
                          className={`relative p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600/25 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-102"
                              : "bg-black/90 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black shadow-md">
                              ✓
                            </span>
                          )}
                          <PlayerAvatar
                            username={u.username}
                            avatarUrl={u.avatarUrl || null}
                            size="sm"
                            rankScore={career}
                          />
                          <span className="text-[11px] font-black uppercase truncate max-w-full text-white text-center leading-tight">
                            {u.username}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {addError && (
                <p className="text-red-400 text-xs font-bold bg-red-950/60 p-3 rounded-xl border border-red-600/40 shrink-0">
                  {addError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-900 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedToAdd([]);
                    setSeatModalOpen(false);
                  }}
                  disabled={isPending}
                  className="py-3.5 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleAddPlayers}
                  disabled={isPending || selectedToAdd.length === 0}
                  className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(220,38,38,0.7)] transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  {isPending
                    ? "Adding..."
                    : selectedToAdd.length > 0
                    ? `ADD (${selectedToAdd.length}) PLAYER${selectedToAdd.length > 1 ? "S" : ""}`
                    : "SELECT PLAYERS TO ADD"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settle Up Summary Modal */}
      <SettleUpModal
        players={players}
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        avatarMap={avatarMap}
      />
    </div>
  );
}
