// Rank utility — computes player rank based on net balance (TND)

export interface RankInfo {
  name: string;
  emoji: string;
  color: string; // Tailwind text color class
  bgColor: string; // Tailwind bg color class
  borderColor: string; // Tailwind border color class
  glowColor: string; // CSS box-shadow color (rgba)
  minScore: number;
  maxScore: number;
  progress: number; // 0–100 how far into current rank
}

const RANKS = [
  // NEGATIVE RANKS
  {
    name: "Bhim ta zebi",
    emoji: "🫏",
    color: "text-zinc-600",
    bgColor: "bg-zinc-950",
    borderColor: "border-zinc-800",
    glowColor: "rgba(39,39,42,0.8)",
    min: -Infinity,
    max: -60,
  },
  {
    name: "Trash",
    emoji: "🗑️",
    color: "text-zinc-500",
    bgColor: "bg-zinc-900",
    borderColor: "border-zinc-700",
    glowColor: "rgba(63,63,70,0.6)",
    min: -60,
    max: -40,
  },
  {
    name: "Wood",
    emoji: "🪵",
    color: "text-red-900",
    bgColor: "bg-red-950/40",
    borderColor: "border-red-900/50",
    glowColor: "rgba(127,29,29,0.5)",
    min: -40,
    max: -20,
  },
  {
    name: "Iron",
    emoji: "⛓️",
    color: "text-red-700",
    bgColor: "bg-red-950/60",
    borderColor: "border-red-800/60",
    glowColor: "rgba(185,28,28,0.5)",
    min: -20,
    max: 0,
  },

  // POSITIVE RANKS (Black/White/Red themed mostly, but preserving some distinction)
  {
    name: "Bronze",
    emoji: "🥉",
    color: "text-zinc-400",
    bgColor: "bg-zinc-900/50",
    borderColor: "border-zinc-500",
    glowColor: "rgba(161,161,170,0.5)",
    min: 0,
    max: 20,
  },
  {
    name: "Silver",
    emoji: "🥈",
    color: "text-zinc-300",
    bgColor: "bg-zinc-800/50",
    borderColor: "border-zinc-400",
    glowColor: "rgba(212,212,216,0.6)",
    min: 20,
    max: 40,
  },
  {
    name: "Gold",
    emoji: "🥇",
    color: "text-white",
    bgColor: "bg-zinc-700/50",
    borderColor: "border-zinc-300",
    glowColor: "rgba(255,255,255,0.7)",
    min: 40,
    max: 60,
  },
  {
    name: "Platinum",
    emoji: "💠",
    color: "text-red-300",
    bgColor: "bg-red-950/30",
    borderColor: "border-red-400/50",
    glowColor: "rgba(252,165,165,0.5)",
    min: 60,
    max: 80,
  },
  {
    name: "Emerald",
    emoji: "💎",
    color: "text-red-400",
    bgColor: "bg-red-900/30",
    borderColor: "border-red-500",
    glowColor: "rgba(248,113,113,0.6)",
    min: 80,
    max: 100,
  },
  {
    name: "Diamond",
    emoji: "🔷",
    color: "text-red-500",
    bgColor: "bg-red-900/40",
    borderColor: "border-red-500",
    glowColor: "rgba(239,68,68,0.7)",
    min: 100,
    max: 120,
  },
  {
    name: "Master",
    emoji: "👑",
    color: "text-red-600",
    bgColor: "bg-red-900/50",
    borderColor: "border-red-600",
    glowColor: "rgba(220,38,38,0.8)",
    min: 120,
    max: 140,
  },
  {
    name: "Grandmaster",
    emoji: "🌟",
    color: "text-red-700",
    bgColor: "bg-red-950/80",
    borderColor: "border-red-600",
    glowColor: "rgba(185,28,28,0.9)",
    min: 140,
    max: 160,
  },
  {
    name: "Challenger",
    emoji: "⚡",
    color: "text-white",
    bgColor: "bg-red-600/30",
    borderColor: "border-red-500",
    glowColor: "rgba(255,0,0,1)",
    min: 160,
    max: Infinity,
  },
];

export function getRankInfo(netBalance: number): RankInfo {
  const rank =
    RANKS.find((r) => netBalance >= r.min && netBalance < r.max) || RANKS[0];

  let progress = 0;
  if (rank.max !== Infinity && rank.min !== -Infinity) {
    progress = Math.min(
      100,
      Math.max(0, ((netBalance - rank.min) / (rank.max - rank.min)) * 100)
    );
  } else if (rank.max === Infinity) {
    // Challenger — show progress based on excess beyond 160
    progress = Math.min(100, ((netBalance - 160) / 20) * 100);
  } else if (rank.min === -Infinity) {
    // Bhim ta zebi - no real progress towards max, but let's invert it or cap it
    progress = 100;
  }

  return {
    name: rank.name,
    emoji: rank.emoji,
    color: rank.color,
    bgColor: rank.bgColor,
    borderColor: rank.borderColor,
    glowColor: rank.glowColor,
    minScore: rank.min === -Infinity ? -999 : rank.min,
    maxScore: rank.max === Infinity ? 999 : rank.max,
    progress,
  };
}

export function getAllRanks() {
  return RANKS;
}
