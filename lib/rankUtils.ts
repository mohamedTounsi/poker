// Rank utility — computes player rank based on net balance (TND)

export interface RankInfo {
  name: string;
  emoji: string;
  color: string;       // Tailwind text color class
  bgColor: string;     // Tailwind bg color class
  borderColor: string; // Tailwind border color class
  glowColor: string;   // CSS box-shadow color (rgba)
  minScore: number;
  maxScore: number;
  progress: number;    // 0–100 how far into current rank
}

const RANKS = [
  {
    name: "Unranked",
    emoji: "💀",
    color: "text-zinc-500",
    bgColor: "bg-zinc-800",
    borderColor: "border-zinc-600",
    glowColor: "rgba(113,113,122,0.4)",
    min: -Infinity,
    max: 0,
  },
  {
    name: "Bronze",
    emoji: "🥉",
    color: "text-amber-600",
    bgColor: "bg-amber-900/30",
    borderColor: "border-amber-600",
    glowColor: "rgba(217,119,6,0.5)",
    min: 0,
    max: 20,
  },
  {
    name: "Silver",
    emoji: "🥈",
    color: "text-slate-300",
    bgColor: "bg-slate-700/30",
    borderColor: "border-slate-400",
    glowColor: "rgba(148,163,184,0.5)",
    min: 20,
    max: 40,
  },
  {
    name: "Gold",
    emoji: "🥇",
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/30",
    borderColor: "border-yellow-400",
    glowColor: "rgba(250,204,21,0.5)",
    min: 40,
    max: 60,
  },
  {
    name: "Platinum",
    emoji: "💠",
    color: "text-cyan-300",
    bgColor: "bg-cyan-900/30",
    borderColor: "border-cyan-400",
    glowColor: "rgba(34,211,238,0.5)",
    min: 60,
    max: 80,
  },
  {
    name: "Emerald",
    emoji: "💎",
    color: "text-emerald-400",
    bgColor: "bg-emerald-900/30",
    borderColor: "border-emerald-400",
    glowColor: "rgba(52,211,153,0.5)",
    min: 80,
    max: 120,
  },
  {
    name: "Diamond",
    emoji: "🔷",
    color: "text-blue-300",
    bgColor: "bg-blue-900/30",
    borderColor: "border-blue-400",
    glowColor: "rgba(147,197,253,0.6)",
    min: 120,
    max: 140,
  },
  {
    name: "Master",
    emoji: "👑",
    color: "text-purple-400",
    bgColor: "bg-purple-900/30",
    borderColor: "border-purple-400",
    glowColor: "rgba(192,132,252,0.6)",
    min: 140,
    max: 160,
  },
  {
    name: "Grandmaster",
    emoji: "🌟",
    color: "text-rose-400",
    bgColor: "bg-rose-900/30",
    borderColor: "border-rose-500",
    glowColor: "rgba(251,113,133,0.6)",
    min: 160,
    max: 180,
  },
  {
    name: "Challenger",
    emoji: "⚡",
    color: "text-orange-300",
    bgColor: "bg-orange-900/30",
    borderColor: "border-orange-400",
    glowColor: "rgba(253,186,116,0.7)",
    min: 180,
    max: Infinity,
  },
];

export function getRankInfo(netBalance: number): RankInfo {
  const rank = RANKS.find((r) => netBalance >= r.min && netBalance < r.max) || RANKS[0];

  let progress = 0;
  if (rank.max !== Infinity && rank.min !== -Infinity) {
    progress = Math.min(100, Math.max(0, ((netBalance - rank.min) / (rank.max - rank.min)) * 100));
  } else if (rank.max === Infinity) {
    // Challenger — show progress based on excess beyond 180
    progress = Math.min(100, ((netBalance - 180) / 20) * 100);
  } else {
    progress = 0;
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
  return RANKS.filter((r) => r.min !== -Infinity);
}
