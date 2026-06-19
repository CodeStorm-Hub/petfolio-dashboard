"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          minTickGap={24}
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--primary)"
          fill="url(#revenueFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
