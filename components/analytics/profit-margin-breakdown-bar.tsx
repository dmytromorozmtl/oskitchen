"use client";

import {
  buildProfitMarginStackSegments,
  marginStackBarClassForSegment,
  PROFIT_MARGIN_STACK_TEST_ID,
  summarizeMarginStackSegments,
  type MarginStackSegment,
} from "@/lib/analytics/profit-dashboard-margin-visualization-policy";
import type { RealTimeProfitSnapshot } from "@/services/analytics/real-time-profit-service";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function MarginStackLegend({ segments }: { segments: MarginStackSegment[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      {segments.map((segment) => (
        <div key={segment.id} className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", segment.barClass)} aria-hidden />
          <span className="text-muted-foreground">
            {segment.label}{" "}
            <span className="font-medium tabular-nums text-foreground">{segment.percent}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProfitMarginBreakdownBar({
  snapshot,
  currency = "USD",
  className,
}: {
  snapshot: Pick<
    RealTimeProfitSnapshot,
    "revenue" | "foodCost" | "laborCost" | "deliveryCost" | "profit"
  >;
  currency?: string;
  className?: string;
}) {
  const segments = buildProfitMarginStackSegments(snapshot);
  const summary = summarizeMarginStackSegments(segments);

  if (segments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid={PROFIT_MARGIN_STACK_TEST_ID}>
        No revenue yet — margin stack appears when sales land today.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)} data-testid={PROFIT_MARGIN_STACK_TEST_ID}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Revenue composition</span>
        <span className="tabular-nums">{formatCurrency(snapshot.revenue, currency)} total</span>
      </div>
      <div
        className="flex h-4 w-full overflow-hidden rounded-full bg-muted/40"
        role="img"
        aria-label={`Margin stack: ${segments.map((s) => `${s.label} ${s.percent}%`).join(", ")}`}
      >
        {segments.map((segment) => (
          <div
            key={segment.id}
            data-testid={`profit-margin-stack-${segment.id}`}
            className={cn("h-full transition-all", marginStackBarClassForSegment(segment.id))}
            style={{
              width: `${Math.max(Math.abs(segment.percent), segment.percent !== 0 ? 0.5 : 0)}%`,
            }}
            title={`${segment.label}: ${formatCurrency(segment.amount, currency)} (${segment.percent}%)`}
          />
        ))}
      </div>
      <MarginStackLegend segments={segments} />
      <p className="text-[11px] text-muted-foreground">
        Stack covers {summary.totalPercent}% of revenue — costs + profit from today&apos;s orders.
      </p>
    </div>
  );
}
