"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  buildProfitWaterfallData,
  waterfallChartAriaLabel,
  WATERFALL_CHART_TEST_ID,
  type WaterfallChartDatum,
} from "@/lib/analytics/waterfall-chart-data";
import { chartAxisChrome } from "@/lib/design/color-tokens";
import { formatCurrency } from "@/lib/utils";
import type { RealTimeProfitSnapshot } from "@/services/analytics/real-time-profit-service";
import { cn } from "@/lib/utils";

function WaterfallTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ payload: WaterfallChartDatum }>;
  currency: string;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;
  return (
    <div
      className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md"
      style={{ borderColor: chartAxisChrome.tooltipBorder, background: chartAxisChrome.tooltipBackground }}
    >
      <p className="font-medium">{row.label}</p>
      <p className="tabular-nums text-muted-foreground">
        {row.delta >= 0 ? "+" : ""}
        {formatCurrency(row.delta, currency)}
      </p>
    </div>
  );
}

export function WaterfallChart({
  snapshot,
  currency = "USD",
  className,
  height = 220,
}: {
  snapshot: Pick<
    RealTimeProfitSnapshot,
    "revenue" | "foodCost" | "laborCost" | "deliveryCost" | "profit"
  >;
  currency?: string;
  className?: string;
  height?: number;
}) {
  const data = buildProfitWaterfallData(snapshot);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid={WATERFALL_CHART_TEST_ID}>
        No revenue yet — waterfall chart appears when sales land today.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)} data-testid={WATERFALL_CHART_TEST_ID}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>P&L waterfall</span>
        <span className="tabular-nums">Revenue → costs → net</span>
      </div>
      <div
        className="w-full"
        role="img"
        aria-label={waterfallChartAriaLabel(data)}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartAxisChrome.gridStroke} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: chartAxisChrome.tickFill, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis
              tick={{ fill: chartAxisChrome.tickFill, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}`}
            />
            <Tooltip content={<WaterfallTooltip currency={currency} />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
            <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="value" stackId="waterfall" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
