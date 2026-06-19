"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  label: string;
  balance: number;
  date: string;
}

interface PerformanceChartProps {
  data: DataPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const isPos = val >= 0;
  return (
    <div
      className="px-3 py-2 rounded-xl text-sm font-semibold"
      style={{
        background: "#111827",
        border: "1px solid #1f2d45",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div className="text-zinc-400 text-xs mb-1">{payload[0]?.payload?.date}</div>
      <div className={isPos ? "text-emerald-400" : "text-red-400"}>
        {isPos ? "+" : ""}{val} TND
      </div>
    </div>
  );
};

export default function PerformanceChart({ data, height = 180 }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500 text-sm font-medium rounded-xl"
        style={{ height, background: "rgba(255,255,255,0.02)", border: "1px dashed #1f2d45" }}
      >
        No game data yet — play some games to see your curve!
      </div>
    );
  }

  const allPositive = data.every((d) => d.balance >= 0);
  const allNegative = data.every((d) => d.balance < 0);
  const strokeColor = allPositive ? "#10b981" : allNegative ? "#ef4444" : "#f5c518";
  const gradientId = allPositive ? "greenGrad" : allNegative ? "redGrad" : "goldGrad";
  const gradientColor = allPositive ? "#10b981" : allNegative ? "#ef4444" : "#f5c518";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#6b7a99", fontSize: 10, fontFamily: "var(--font-rajdhani)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7a99", fontSize: 10, fontFamily: "var(--font-rajdhani)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#2a3f60" strokeDasharray="4 2" />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={strokeColor}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: strokeColor, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: strokeColor, strokeWidth: 2, stroke: "#111827" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
