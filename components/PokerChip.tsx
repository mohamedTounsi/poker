"use client";

interface PokerChipProps {
  value?: string | number;
  size?: number; // size in px, e.g. 36, 48, 64
  color?: "red" | "black" | "white" | "green" | "gold";
  className?: string;
}

export default function PokerChip({
  value,
  size = 40,
  color = "red",
  className = "",
}: PokerChipProps) {
  // Color palette definitions
  const palette = {
    red: {
      outer: "#dc2626",
      inner: "#991b1b",
      edge1: "#ffffff",
      edge2: "#18181b",
      center: "#09090b",
      text: "#ffffff",
      border: "#ef4444",
      glow: "rgba(239,68,68,0.45)",
    },
    black: {
      outer: "#18181b",
      inner: "#09090b",
      edge1: "#dc2626",
      edge2: "#ffffff",
      center: "#000000",
      text: "#ffffff",
      border: "#3f3f46",
      glow: "rgba(255,255,255,0.2)",
    },
    white: {
      outer: "#f4f4f5",
      inner: "#e4e4e7",
      edge1: "#dc2626",
      edge2: "#18181b",
      center: "#ffffff",
      text: "#09090b",
      border: "#ffffff",
      glow: "rgba(255,255,255,0.4)",
    },
    green: {
      outer: "#10b981",
      inner: "#047857",
      edge1: "#ffffff",
      edge2: "#064e3b",
      center: "#06281e",
      text: "#34d399",
      border: "#34d399",
      glow: "rgba(16,185,129,0.45)",
    },
    gold: {
      outer: "#d97706",
      inner: "#b45309",
      edge1: "#fef3c7",
      edge2: "#78350f",
      center: "#451a03",
      text: "#fbbf24",
      border: "#f59e0b",
      glow: "rgba(245,158,11,0.45)",
    },
  }[color];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-200 hover:scale-105 shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 4px 8px ${palette.glow})`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Shadow & Rim */}
        <circle cx="50" cy="50" r="48" fill={palette.outer} stroke={palette.border} strokeWidth="2" />

        {/* Casino Edge Inserts (6 alternating notches) */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <rect
              x="45"
              y="2"
              width="10"
              height="8"
              rx="1.5"
              fill={i % 2 === 0 ? palette.edge1 : palette.edge2}
            />
            <rect
              x="45"
              y="90"
              width="10"
              height="8"
              rx="1.5"
              fill={i % 2 === 0 ? palette.edge1 : palette.edge2}
            />
          </g>
        ))}

        {/* Inner Ring with stitching effect */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={palette.edge1}
          strokeWidth="2"
          strokeDasharray="4 3"
          opacity="0.85"
        />

        {/* Inner Colored Disc */}
        <circle cx="50" cy="50" r="32" fill={palette.inner} />

        {/* Center Recessed Disc */}
        <circle
          cx="50"
          cy="50"
          r="26"
          fill={palette.center}
          stroke={palette.border}
          strokeWidth="1.5"
        />

        {/* Suit symbol background watermark if no custom value */}
        {value === undefined && (
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fill={palette.border}
            fontSize="26"
            fontFamily="sans-serif"
            fontWeight="bold"
            opacity="0.9"
          >
            ♠
          </text>
        )}
      </svg>

      {/* Value Overlay */}
      {value !== undefined && (
        <span
          className="absolute inset-0 flex items-center justify-center font-black font-mono leading-none tracking-tight"
          style={{
            fontSize: typeof value === "string" && value.length > 2 ? size * 0.32 : size * 0.38,
            color: palette.text,
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
