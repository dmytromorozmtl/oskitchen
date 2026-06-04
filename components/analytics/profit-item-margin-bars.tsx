"use client";

import {
  buildItemMarginBarRows,
  marginBarClassForZone,
  PROFIT_ITEM_MARGIN_BARS_TEST_ID,
} from "@/lib/analytics/profit-dashboard-margin-visualization-policy";
import type { ProfitItemRow } from "@/services/analytics/real-time-profit-service";
import { cn } from "@/lib/utils";

function ItemMarginBar({ row }: { row: ReturnType<typeof buildItemMarginBarRows>[number] }) {
  return (
    <div
      className="space-y-1"
      data-testid={`profit-item-margin-row-${row.productId}`}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-medium">{row.title}</span>
        <span
          className={cn(
            "shrink-0 tabular-nums text-xs font-semibold",
            row.zone === "green" && "text-emerald-600 dark:text-emerald-400",
            row.zone === "yellow" && "text-amber-600 dark:text-amber-400",
            row.zone === "red" && "text-rose-600 dark:text-rose-400",
          )}
        >
          {row.marginPercent}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className={cn("h-full rounded-full transition-all", marginBarClassForZone(row.zone))}
          style={{ width: `${row.barWidthPercent}%` }}
          role="presentation"
        />
      </div>
    </div>
  );
}

export function ProfitItemMarginBars({
  items,
  title,
  emptyLabel = "No items yet.",
  maxRows = 5,
  className,
}: {
  items: readonly ProfitItemRow[];
  title: string;
  emptyLabel?: string;
  maxRows?: number;
  className?: string;
}) {
  const rows = buildItemMarginBarRows(items, { maxRows });

  return (
    <div className={cn("space-y-3", className)} data-testid={PROFIT_ITEM_MARGIN_BARS_TEST_ID}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        rows.map((row) => <ItemMarginBar key={row.productId} row={row} />)
      )}
    </div>
  );
}
