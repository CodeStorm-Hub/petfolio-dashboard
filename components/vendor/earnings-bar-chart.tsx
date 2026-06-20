"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function EarningsBarChart({
  data,
}: {
  data: { month: string; earnings: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tickFormatter={(value: number) => `$${value}`}
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
          width={56}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === "number"
              ? [`$${value.toFixed(2)}`, "Earnings"]
              : [String(value), "Earnings"]
          }
          contentStyle={{
            fontSize: 13,
            borderRadius: 8,
          }}
        />
        <Bar dataKey="earnings" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  );
}
