"use client";

import Image from "next/image";
import RankBadge from "./RankBadge";

interface PlayerAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";
  className?: string;
  showRing?: boolean;
  ringColor?: string;
  rankScore?: number;
}

const sizeMap = {
  xs: { px: 44, badgeSize: 22, text: "text-xs" },
  sm: { px: 62, badgeSize: 28, text: "text-base" },
  md: { px: 84, badgeSize: 36, text: "text-xl" },
  lg: { px: 115, badgeSize: 46, text: "text-2xl" },
  xl: { px: 145, badgeSize: 56, text: "text-3xl" },
  xxl: { px: 185, badgeSize: 68, text: "text-4xl" },
  xxxl: { px: 225, badgeSize: 80, text: "text-5xl" },
};

// Generate a consistent color from username
function getUserColor(username: string): string {
  const colors = [
    "#ef4444", "#dc2626", "#b91c1c", "#f87171",
    "#ffffff", "#e4e4e7", "#d4d4d8", "#a1a1aa",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function PlayerAvatar({
  username,
  avatarUrl,
  size = "md",
  className = "",
  showRing = false,
  ringColor = "#ef4444",
  rankScore,
}: PlayerAvatarProps) {
  const { px, badgeSize, text } = sizeMap[size] || sizeMap.md;
  const color = getUserColor(username);
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      {/* The Circular Player Photo */}
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-black bg-zinc-900"
        style={{
          border: showRing ? `2.5px solid ${ringColor}` : `1.5px solid rgba(255,255,255,0.15)`,
          boxShadow: showRing ? `0 0 12px ${ringColor}88` : "0 4px 10px rgba(0,0,0,0.6)",
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={username}
            width={px * 2}
            height={px * 2}
            className="w-full h-full object-cover"
            quality={100}
            unoptimized
          />
        ) : (
          <span
            className={`${text} font-black select-none`}
            style={{ color }}
          >
            {initial}
          </span>
        )}
      </div>

      {/* Layered Rank Icon on Bottom Right of the Player Photo */}
      {rankScore !== undefined && (
        <div
          className="absolute -bottom-1 -right-1 z-20 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)] transition-transform hover:scale-110"
          style={{ width: badgeSize, height: badgeSize }}
        >
          <RankBadge
            netBalance={rankScore}
            size="xs"
            customImgSize={badgeSize}
            layout="iconOnly"
          />
        </div>
      )}
    </div>
  );
}
