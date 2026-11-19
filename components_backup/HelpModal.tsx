"use client";

import { useState } from "react";
import { X, HelpCircle, Trophy, Star } from "lucide-react";
import { RankTable } from "./RankBadge";

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl text-zinc-400 hover:text-yellow-400 transition-all hover:bg-yellow-400/10 border border-transparent hover:border-yellow-400/20"
        title="Help — How rankings work"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden slide-in-up"
            style={{
              background: "#111827",
              border: "1px solid #1f2d45",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #1f2d45", background: "rgba(245,197,24,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.3)" }}>
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wider text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                    HOW IT WORKS
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">Ranks & the leaderboard system</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Rank Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-black tracking-widest uppercase text-zinc-400">Rank System</span>
                </div>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                  Your rank is determined by your <strong className="text-white">total net balance (TND)</strong> across all completed games. Win more games to climb the leaderboard!
                </p>
                <RankTable />
              </div>

              {/* Tips */}
              <div style={{ borderTop: "1px solid #1f2d45", paddingTop: "20px" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-black tracking-widest uppercase text-zinc-400">Pro Tips</span>
                </div>
                <ul className="space-y-2 text-sm text-zinc-400">
                  {[
                    "🃏 Ranks update in real-time on the leaderboard",
                    "📈 Track your balance curve in your profile",
                    "🏆 Visit the Leaderboard to see the full standings",
                    "💰 All balances show the TND value and half-value (chip value)",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="text-base leading-none mt-0.5">{tip.charAt(0)}</span>
                      <span className="leading-relaxed">{tip.slice(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
