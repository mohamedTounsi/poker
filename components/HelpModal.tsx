"use client";

import { useState } from "react";
import { X, HelpCircle, Trophy } from "lucide-react";
import { RankTable } from "./RankBadge";

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl text-zinc-400 hover:text-red-500 transition-all hover:bg-red-600/10 border border-transparent hover:border-red-900/40 cursor-pointer"
        title="Help — How rankings work"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-lg rounded-3xl bg-zinc-950 border border-red-900/50 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-red-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-600/40 text-red-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wider text-white uppercase">
                    POKER FRERE RANKS
                  </h2>
                  <p className="text-xs text-zinc-400 font-medium">Rankings & Tier Divisions</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-2xl bg-black border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <p className="font-bold text-white">💰 Scoring & Exchange:</p>
                <p>• Winning money is displayed in <span className="text-emerald-400 font-black">Green</span>.</p>
                <p>• Lost money is displayed in <span className="text-red-500 font-black">Red</span>.</p>
                <p>• Every score displays its half value next to it between parentheses: <span className="font-mono font-bold text-white">10 TND (5 TND)</span>.</p>
                <p>• In live tables, tap player photos to instantly exchange chips (+1, +2, +3, +4, +5, +6).</p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-zinc-400 mb-2">Available Rank Tiers</h3>
                <RankTable />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
