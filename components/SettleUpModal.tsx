"use client";

import { useState } from "react";
import { calculateSettlements, SettleTransaction } from "../lib/settleUp";
import { formatTnd, getMoneyColor } from "../lib/utils";
import { HandCoins, Check, Copy, ArrowRight, Sparkles, X, ShieldAlert } from "lucide-react";
import PlayerAvatar from "./PlayerAvatar";

interface SettleUpModalProps {
  players: Array<{ userId: string; username: string; score: number; rebuys?: number }>;
  isOpen: boolean;
  onClose: () => void;
  avatarMap?: Record<string, string | null>;
}

export default function SettleUpModal({
  players,
  isOpen,
  onClose,
  avatarMap = {},
}: SettleUpModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { transactions, isBalanced, netTotal } = calculateSettlements(players);

  const handleCopySummary = () => {
    let text = "🃏 POKER FRERE — SESSION SETTLE UP 🃏\n\n";
    if (!isBalanced) {
      text += `⚠️ Warning: Session was not balanced (Net: ${formatTnd(netTotal)})\n\n`;
    }
    text += "Transactions to settle debts (minimal cash flow):\n";
    transactions.forEach((tx, idx) => {
      text += `${idx + 1}. ${tx.from.toUpperCase()} pays ${tx.to.toUpperCase()} ➡️ ${formatTnd(tx.amount)}\n`;
    });
    text += "\nFinal Balances:\n";
    players
      .sort((a, b) => b.score - a.score)
      .forEach((p) => {
        text += `• ${p.username.toUpperCase()}: ${formatTnd(p.score, true)}${
          p.rebuys ? ` (${p.rebuys} rebuys)` : ""
        }\n`;
      });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-red-900/50 p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.9)] space-y-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-600/50 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <HandCoins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              Settle Up Summary <Sparkles className="w-4 h-4 text-red-500" />
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              Debt settlement with minimal transactions
            </p>
          </div>
        </div>

        {/* Balance Warning if not 0 */}
        {!isBalanced && (
          <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-600/40 flex items-center gap-3 text-red-300 text-xs">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <span className="font-bold">Table is unbalanced!</span> Net sum is{" "}
              <span className="font-mono font-black">{formatTnd(netTotal, true)}</span>.
              Scores should sum to 0 for a closed session.
            </div>
          </div>
        )}

        {/* Minimal Transactions */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Optimal Payouts ({transactions.length})
          </h4>

          {transactions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-black border border-zinc-800 text-center text-sm text-zinc-400">
              All players are currently even or no debt exists.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: SettleTransaction, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-red-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      <PlayerAvatar
                        username={tx.from}
                        avatarUrl={avatarMap[tx.from]}
                        size="xs"
                      />
                      <PlayerAvatar
                        username={tx.to}
                        avatarUrl={avatarMap[tx.to]}
                        size="xs"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white">
                        <span>{tx.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-emerald-400">{tx.to}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">
                        Debt payout
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-black text-white">
                      {formatTnd(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Player Balances Quick List */}
        <div className="space-y-2 pt-2 border-t border-zinc-900">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Player Standings
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {players.map((p) => {
              const isWin = p.score > 0;
              const isLoss = p.score < 0;
              return (
                <div
                  key={p.userId}
                  className="flex items-center justify-between p-2 rounded-xl bg-black border border-zinc-800 text-xs"
                >
                  <span className="font-bold text-zinc-200 uppercase truncate max-w-[80px]">
                    {p.username}
                  </span>
                  <span
                    className={`font-mono font-black ${
                      isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-zinc-400"
                    }`}
                  >
                    {formatTnd(p.score, true)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Copy Button */}
        <div className="pt-2">
          <button
            onClick={handleCopySummary}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Settlement Breakdown
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
