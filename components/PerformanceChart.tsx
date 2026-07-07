"use client";

import {
  ComposedChart,
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

  // Compute the min/max to anchor gradient stops correctly
  const values = data.map((d) => d.balance);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  // What fraction of the chart height is the "zero line" from the top?
  // If maxVal <= 0 → zero is at or above the top → full red
  // If minVal >= 0 → zero is at or below the bottom → full green
  const zeroFraction = maxVal <= 0 ? 0 : minVal >= 0 ? 1 : maxVal / range;
  // zeroFraction = proportion of the chart that is ABOVE zero (green zone)
  const greenStop = `${(zeroFraction * 100).toFixed(1)}%`;
  const redStart = greenStop;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          {/* Green fill — covers area above zero */}
          <linearGradient id="greenAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset={greenStop} stopColor="#10b981" stopOpacity={0.08} />
            <stop offset={redStart} stopColor="#10b981" stopOpacity={0} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>

          {/* Red fill — covers area below zero */}
          <linearGradient id="redAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0} />
            <stop offset={greenStop} stopColor="#ef4444" stopOpacity={0} />
            <stop offset={redStart} stopColor="#ef4444" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.35} />
          </linearGradient>

          {/* Stroke gradient: green above zero, red below */}
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset={greenStop} stopColor="#10b981" />
            <stop offset={redStart} stopColor="#ef4444" />
            <stop offset="100%" stopColor="#ef4444" />
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

        {/* Green fill layer (above zero) */}
        <Area
          type="monotone"
          dataKey="balance"
          stroke="none"
          fill="url(#greenAreaGrad)"
          dot={false}
          activeDot={false}
          legendType="none"
          baseLine={0}
        />

        {/* Red fill layer (below zero) */}
        <Area
          type="monotone"
          dataKey="balance"
          stroke="none"
          fill="url(#redAreaGrad)"
          dot={false}
          activeDot={false}
          legendType="none"
          baseLine={0}
        />

        {/* Stroke layer with gradient color */}
        <Area
          type="monotone"
          dataKey="balance"
          stroke="url(#strokeGrad)"
          strokeWidth={2.5}
          fill="transparent"
          dot={(props: any) => {
            const { cx, cy, payload } = props;
            const color = payload.balance >= 0 ? "#10b981" : "#ef4444";
            return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={color} />;
          }}
          activeDot={(props: any) => {
            const { cx, cy, payload } = props;
            const color = payload.balance >= 0 ? "#10b981" : "#ef4444";
            return (
              <circle
                key={`adot-${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r={5}
                fill={color}
                stroke="#111827"
                strokeWidth={2}
              />
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
