"use client";

import Image from "next/image";
import { getRankInfo, getAllRanks } from "../lib/rankUtils";

interface RankBadgeProps {
  netBalance: number;
  showProgress?: boolean;
  showName?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  layout?: "stack" | "inline" | "iconOnly";
  customImgSize?: number;
  className?: string;
}

const sizeMap = {
  xs: { imgSize: 34, font: "text-[10px]" },
  sm: { imgSize: 48, font: "text-xs" },
  md: { imgSize: 72, font: "text-sm" },
  lg: { imgSize: 96, font: "text-base" },
  xl: { imgSize: 130, font: "text-lg" },
  xxl: { imgSize: 170, font: "text-xl" },
};

const RANK_IMAGE_MAP: Record<string, string> = {
  "bhim ta zebi": "/bhim ta zebi.png",
  "trash": "/trash.png",
  "wood": "/wood.png",
  "iron": "/iron.png",
  "bronze": "/bronze.png",
  "silver": "/silver.png",
  "gold": "/gold.png",
  "platinum": "/platinum.png",
  "emerald": "/emerald.png",
  "diamond": "/diamond.png",
  "master": "/master.png",
  "grandmaster": "/grandmaster.png",
  "challenger": "/challenger.png",
  "unranked": "/unranked.png",
};

export default function RankBadge({
  netBalance,
  showProgress = false,
  showName = true,
  size = "md",
  layout = "stack",
  customImgSize,
  className = "",
}: RankBadgeProps) {
  const rank = getRankInfo(netBalance);
  const defaultSize = sizeMap[size] || sizeMap.md;
  const imgSize = customImgSize ?? defaultSize.imgSize;
  const font = defaultSize.font;
  const logoSrc = RANK_IMAGE_MAP[rank.name.toLowerCase()] || `/${rank.name.toLowerCase()}.png`;

  if (layout === "iconOnly") {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
        style={{ width: imgSize, height: imgSize }}
        title={`${rank.name} Rank (${netBalance} TND)`}
      >
        <Image
          src={logoSrc}
          alt={rank.name}
          width={imgSize}
          height={imgSize}
          className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
          unoptimized
        />
      </div>
    );
  }

  if (layout === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
        <div
          className="relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
          style={{ width: imgSize, height: imgSize }}
        >
          <Image
            src={logoSrc}
            alt={rank.name}
            width={imgSize}
            height={imgSize}
            className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
            unoptimized
          />
        </div>
        {showName && (
          <div className="flex flex-col text-left">
            <span
              className={`${font} font-black tracking-wider uppercase text-white`}
              style={{ textShadow: `0 0 10px rgba(239,68,68,0.5)` }}
            >
              {rank.name}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              Rank
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center gap-1 shrink-0 ${className}`}>
      <div 
        className="relative flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{ width: imgSize, height: imgSize }}
      >
        <Image
          src={logoSrc}
          alt={rank.name}
          width={imgSize}
          height={imgSize}
          className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
          unoptimized
        />
      </div>
      {showName && (
        <span 
          className={`${font} font-black tracking-widest uppercase text-center text-white`}
          style={{ 
            textShadow: `0 0 10px rgba(239,68,68,0.6)`
          }}
        >
          {rank.name}
        </span>
      )}
      {showProgress && rank.name !== "Unranked" && rank.name !== "Challenger" && (
        <div className="w-full flex flex-col gap-0.5" style={{ minWidth: imgSize }}>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/20">
            <div
              className="h-full rounded-full transition-all duration-1000 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              style={{
                width: `${rank.progress}%`,
              }}
            />
          </div>
          <span className="text-[9px] text-zinc-400 font-bold text-center">
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
        const logoSrc = RANK_IMAGE_MAP[r.name.toLowerCase()] || `/${r.name.toLowerCase()}.png`;
        return (
          <div
            key={r.name}
            className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-red-900/30 hover:border-red-600/50 transition-colors"
          >
            <div className="w-14 h-14 relative flex-shrink-0">
              <Image
                src={logoSrc}
                alt={r.name}
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm uppercase text-white tracking-wide">
                  {r.name}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {r.min === -Infinity
                    ? `< ${r.max} TND`
                    : r.max === Infinity
                    ? `> ${r.min} TND`
                    : `${r.min} to ${r.max} TND`}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase text-red-400">
                  Tier Division
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
