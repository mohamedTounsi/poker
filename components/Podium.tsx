"use client";

import PlayerAvatar from "./PlayerAvatar";
import RankBadge from "./RankBadge";
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

// SVG Donkey with player face as head for last place
function DonkeyAvatar({
  username,
  avatarUrl,
  score,
}: {
  username: string;
  avatarUrl?: string | null;
  score: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg viewBox="0 0 120 100" className="w-24 h-20" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="65" cy="70" rx="35" ry="22" fill="#3f3f46" />
          <rect x="42" y="45" width="18" height="22" rx="6" fill="#3f3f46" />
          <rect x="38" y="85" width="8" height="14" rx="4" fill="#27272a" />
          <rect x="52" y="85" width="8" height="14" rx="4" fill="#27272a" />
          <rect x="72" y="85" width="8" height="14" rx="4" fill="#27272a" />
          <rect x="86" y="85" width="8" height="14" rx="4" fill="#27272a" />
          <path d="M98 65 Q112 55 106 45 Q102 38 108 32" stroke="#27272a" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <ellipse cx="42" cy="26" rx="5" ry="10" fill="#3f3f46" transform="rotate(-15,42,26)" />
          <ellipse cx="42" cy="26" rx="3" ry="7" fill="#ef4444" transform="rotate(-15,42,26)" />
          <ellipse cx="58" cy="22" rx="5" ry="10" fill="#3f3f46" transform="rotate(10,58,22)" />
          <ellipse cx="58" cy="22" rx="3" ry="7" fill="#ef4444" transform="rotate(10,58,22)" />
        </svg>
        <div className="absolute" style={{ top: "2px", left: "26px" }}>
          <PlayerAvatar
            username={username}
            avatarUrl={avatarUrl}
            size="sm"
            showRing={false}
            rankScore={score}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs font-black text-white capitalize">{username}</span>
      </div>
      <span className="text-xs font-mono font-bold text-red-500">
        {formatTnd(score, true)} 🫏
      </span>
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
    { player: second, place: 2, height: "h-24", label: "2ND", color: "#e4e4e7", glow: "rgba(228,228,231,0.4)", avatarSize: "md" as const },
    { player: first,  place: 1, height: "h-36", label: "1ST", color: "#ef4444", glow: "rgba(239,68,68,0.6)", avatarSize: "lg" as const },
    { player: third,  place: 3, height: "h-16", label: "3RD", color: "#a1a1aa", glow: "rgba(161,161,170,0.3)", avatarSize: "md" as const },
  ].filter((p) => p.player);

  return (
    <div className="space-y-6">
      {/* Podium Stage */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4">
        {podiumPlaces.map(({ player, place, height, label, color, glow, avatarSize }) => {
          if (!player) return null;
          const score = player.score;
          const isWin = score > 0;
          const isLoss = score < 0;

          return (
            <div key={place} className="flex flex-col items-center gap-2" style={{ minWidth: 95 }}>
              {/* Place crown/badge */}
              <span
                className="text-xl sm:text-2xl font-black float-up"
                style={{ color, fontFamily: "var(--font-orbitron)", textShadow: `0 0 12px ${glow}`, animationDelay: `${place * 0.2}s` }}
              >
                {place === 1 ? "👑" : `#${place}`}
              </span>

              {/* Avatar with layered Rank Badge at bottom-right */}
              <PlayerAvatar
                username={player.username}
                avatarUrl={avatarMap[player.username] ?? player.avatarUrl}
                size={avatarSize}
                showRing={true}
                ringColor={color}
                rankScore={score}
              />

              {/* Name */}
              <span
                className="text-xs sm:text-sm font-black capitalize text-center leading-tight text-white"
              >
                {player.username}
              </span>

              {/* Score with half value: winning green, losing red */}
              <span className={`text-[11px] sm:text-xs font-mono font-black ${isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-white"}`}>
                {formatTnd(score, true)}
              </span>

              {/* Podium Bar */}
              <div
                className={`w-24 sm:w-28 ${height} rounded-t-2xl flex items-center justify-center font-black text-sm`}
                style={{
                  background: place === 1 
                    ? "linear-gradient(180deg, rgba(239,68,68,0.4) 0%, rgba(20,20,25,0.9) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(20,20,25,0.9) 100%)",
                  border: `1.5px solid ${color}66`,
                  borderBottom: "none",
                  boxShadow: `0 -6px 20px ${glow}`,
                  color,
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
          className="flex flex-col items-center gap-2 pt-4 pb-2 border-t border-zinc-900"
        >
          <span className="text-[10px] font-black tracking-widest uppercase text-red-400">Club Donkey</span>
          <DonkeyAvatar
            username={last.username}
            avatarUrl={avatarMap[last.username] ?? last.avatarUrl}
            score={last.score}
          />
        </div>
      )}
    </div>
  );
}
