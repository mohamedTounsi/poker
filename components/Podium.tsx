"use client";

import PlayerAvatar from "./PlayerAvatar";
import { formatTnd } from "../lib/utils";

interface PodiumPlayer {
  username: string;
  score: number;
  avatarUrl?: string | null;
}

interface PodiumProps {
  players: PodiumPlayer[];
  avatarMap?: Record<string, string | null>;
}

// SVG Donkey with player face as head
function DonkeyAvatar({ username, avatarUrl }: { username: string; avatarUrl?: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        {/* Donkey body SVG */}
        <svg viewBox="0 0 120 100" className="w-24 h-20" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <ellipse cx="65" cy="70" rx="35" ry="22" fill="#6b7280" />
          {/* Neck */}
          <rect x="42" y="45" width="18" height="22" rx="6" fill="#6b7280" />
          {/* Legs */}
          <rect x="38" y="85" width="8" height="14" rx="4" fill="#4b5563" />
          <rect x="52" y="85" width="8" height="14" rx="4" fill="#4b5563" />
          <rect x="72" y="85" width="8" height="14" rx="4" fill="#4b5563" />
          <rect x="86" y="85" width="8" height="14" rx="4" fill="#4b5563" />
          {/* Tail */}
          <path d="M98 65 Q112 55 106 45 Q102 38 108 32" stroke="#4b5563" strokeWidth="3" fill="none" strokeLinecap="round"/>
          {/* Ears */}
          <ellipse cx="42" cy="26" rx="5" ry="10" fill="#6b7280" transform="rotate(-15,42,26)" />
          <ellipse cx="42" cy="26" rx="3" ry="7" fill="#f9a8d4" transform="rotate(-15,42,26)" />
          <ellipse cx="58" cy="22" rx="5" ry="10" fill="#6b7280" transform="rotate(10,58,22)" />
          <ellipse cx="58" cy="22" rx="3" ry="7" fill="#f9a8d4" transform="rotate(10,58,22)" />
        </svg>
        {/* Player avatar overlaid as the donkey's head */}
        <div className="absolute" style={{ top: "2px", left: "26px" }}>
          <PlayerAvatar
            username={username}
            avatarUrl={avatarUrl}
            size="sm"
            showRing={false}
          />
        </div>
      </div>
      <span className="text-xs font-black text-zinc-400 capitalize">{username}</span>
      <span className="text-xs font-mono text-red-400 font-bold">{username ? `Last Place 🫏` : ""}</span>
    </div>
  );
}

export default function Podium({ players, avatarMap = {} }: PodiumProps) {
  if (!players || players.length === 0) return null;

  // Sort by score desc
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const last = sorted.length > 3 ? sorted[sorted.length - 1] : null;

  const podiumPlaces = [
    { player: second, place: 2, height: "h-24", label: "2ND", color: "#94a3b8", glow: "rgba(148,163,184,0.3)", avatarSize: "lg" as const },
    { player: first,  place: 1, height: "h-36", label: "1ST", color: "#f5c518", glow: "rgba(245,197,24,0.5)", avatarSize: "xl" as const },
    { player: third,  place: 3, height: "h-16", label: "3RD", color: "#d97706", glow: "rgba(217,119,6,0.3)", avatarSize: "lg" as const },
  ].filter((p) => p.player);

  return (
    <div className="space-y-6">
      {/* Podium Stage */}
      <div className="flex items-end justify-center gap-4 pt-4">
        {podiumPlaces.map(({ player, place, height, label, color, glow, avatarSize }) => {
          if (!player) return null;
          const score = player.score;
          return (
            <div key={place} className="flex flex-col items-center gap-2" style={{ minWidth: 90 }}>
              {/* Place number */}
              <span
                className="text-2xl font-black float-up"
                style={{ color, fontFamily: "var(--font-orbitron)", textShadow: `0 0 12px ${glow}`, animationDelay: `${place * 0.2}s` }}
              >
                {place === 1 ? "👑" : `#${place}`}
              </span>
              {/* Avatar */}
              <PlayerAvatar
                username={player.username}
                avatarUrl={avatarMap[player.username] ?? player.avatarUrl}
                size={avatarSize}
                showRing={true}
                ringColor={color}
              />
              {/* Name */}
              <span
                className="text-sm font-black capitalize text-center leading-tight"
                style={{ color, fontFamily: "var(--font-rajdhani)", textShadow: `0 0 10px ${glow}` }}
              >
                {player.username}
              </span>
              {/* Score with half value */}
              <span className="text-xs font-mono font-bold text-emerald-400">
                {score > 0 ? "+" : ""}{formatTnd(score)}
              </span>
              {/* Podium Bar */}
              <div
                className={`w-24 ${height} rounded-t-xl flex items-center justify-center font-black text-sm podium-bar podium-${place}`}
                style={{
                  background: `linear-gradient(180deg, ${color}33, ${color}11)`,
                  border: `1px solid ${color}44`,
                  boxShadow: `0 -6px 24px ${glow}`,
                  color,
                  animationFillMode: "both",
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Place Donkey */}
      {last && last.username !== (first?.username) && (
        <div
          className="flex flex-col items-center gap-2 pt-4 pb-2"
          style={{ borderTop: "1px dashed #1f2d45" }}
        >
          <span className="text-xs font-black tracking-widest uppercase text-zinc-500">Last Place</span>
          <DonkeyAvatar
            username={last.username}
            avatarUrl={avatarMap[last.username] ?? last.avatarUrl}
          />
          <span className="text-xs font-mono font-bold text-red-400">
            {last.score > 0 ? "+" : ""}{formatTnd(last.score)}
          </span>
        </div>
      )}
    </div>
  );
}
