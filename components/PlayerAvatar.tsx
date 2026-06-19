"use client";

import Image from "next/image";

interface PlayerAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";
  className?: string;
  showRing?: boolean;
  ringColor?: string;
}

const sizeMap = {
  xs: { px: 40, text: "text-xs" },
  sm: { px: 56, text: "text-sm" },
  md: { px: 80, text: "text-lg" },
  lg: { px: 110, text: "text-xl" },
  xl: { px: 140, text: "text-3xl" },
  xxl: { px: 180, text: "text-4xl" },
  xxxl: { px: 220, text: "text-5xl" },
};

// Generate a consistent color from username
function getUserColor(username: string): string {
  const colors = [
    "#e03030", "#f59e0b", "#10b981", "#3b82f6",
    "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
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
  ringColor = "#f5c518",
}: PlayerAvatarProps) {
  const { px, text } = sizeMap[size];
  const color = getUserColor(username);
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-black"
        style={{
          background: avatarUrl ? "transparent" : `${color}22`,
          border: showRing ? `2px solid ${ringColor}` : `1px solid ${color}44`,
          boxShadow: showRing ? `0 0 8px ${ringColor}88` : "none",
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={username}
            width={px}
            height={px}
            className="w-full h-full object-cover"
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
    </div>
  );
}
