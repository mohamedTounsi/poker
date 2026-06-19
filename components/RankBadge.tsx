"use client";

import Image from "next/image";
import { getRankInfo, getAllRanks } from "../lib/rankUtils";

interface RankBadgeProps {
  netBalance: number;
  showProgress?: boolean;
  showName?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
}

const sizeMap = {
  sm: { imgSize: 48, font: "text-xs" },
  md: { imgSize: 76, font: "text-sm" },
  lg: { imgSize: 110, font: "text-base" },
  xl: { imgSize: 150, font: "text-lg" },
  xxl: { imgSize: 200, font: "text-xl" },
};

export default function RankBadge({
  netBalance,
  showProgress = false,
  showName = true,
  size = "md",
}: RankBadgeProps) {
  const rank = getRankInfo(netBalance);
  const { imgSize, font } = sizeMap[size] || sizeMap.md;
  const logoSrc = `/${rank.name.toLowerCase()}.png`;

  return (
    <div className="inline-flex flex-col items-center gap-1.5 shrink-0">
      <div 
        className="relative flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{ width: imgSize, height: imgSize }}
      >
        <Image
          src={logoSrc}
          alt={rank.name}
          width={imgSize}
          height={imgSize}
          className="object-contain"
          unoptimized
        />
      </div>
      {showName && (
        <span 
          className={`${font} font-black tracking-widest uppercase text-center ${rank.color}`}
          style={{ 
            textShadow: `0 0 10px ${rank.glowColor}`
          }}
        >
          {rank.name}
        </span>
      )}
      {showProgress && rank.name !== "Unranked" && rank.name !== "Challenger" && (
        <div className="w-full flex flex-col gap-0.5" style={{ minWidth: imgSize }}>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${rank.progress}%`,
                background: `currentColor`,
                color: rank.glowColor.replace("rgba", "rgb").replace(/,[\d.]+\)/, ")"),
                boxShadow: `0 0 8px ${rank.glowColor}`,
              }}
            />
          </div>
          <span className="text-[9px] text-zinc-500 font-bold text-center">
            {Math.round(rank.progress)}% to {rank.maxScore === 999 ? "MAX" : `${rank.maxScore} TND`}
          </span>
        </div>
      )}
    </div>
  );
}

// Help display — shows all ranks in a table
export function RankTable() {
  const ranks = getAllRanks();
  return (
    <div className="space-y-2">
      {ranks.map((r) => {
        const logoSrc = `/${r.name.toLowerCase()}.png`;
        return (
          <div
            key={r.name}
            className="flex items-center gap-3 p-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-12 h-12 relative flex-shrink-0">
              <Image
                src={logoSrc}
                alt={r.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-black tracking-wide ${r.color}`}>{r.name}</div>
              <div className="text-xs text-zinc-500 font-medium">
                {r.max === Infinity ? `${r.min}+ TND` : `${r.min} – ${r.max} TND net balance`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
