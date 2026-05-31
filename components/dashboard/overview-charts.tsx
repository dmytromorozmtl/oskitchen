"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; value: number };

export function OverviewCharts({
  fulfillmentTrend,
}: {
  fulfillmentTrend: Point[];
}) {
  return (
    <div className="h-[260px] w-full rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
        <p className="text-sm font-semibold font-display">Fulfillment throughput</p>
          <p className="text-xs text-muted-foreground">
            Orders moving through prep this week
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={fulfillmentTrend}>
          <defs>
            <linearGradient id="fillKitchen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent, #FF5F1F)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-accent, #FF5F1F)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              borderColor: "hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-accent, #FF5F1F)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#fillKitchen)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
