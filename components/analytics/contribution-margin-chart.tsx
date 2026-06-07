"use client";

import {
  buildContributionMarginRows,
  CONTRIBUTION_MARGIN_CHART_TEST_ID,
  type ContributionMarginRow,
} from "@/lib/analytics/contribution-margin-data";
import type { ProfitItemRow } from "@/services/analytics/real-time-profit-service";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function ContributionMarginBar({ row, currency }: { row: ContributionMarginRow; currency: string }) {
  return (
    <div className="space-y-1" data-testid={`contribution-margin-row-${row.productId}`}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-medium">{row.title}</span>
        <span className="shrink-0 text-right text-xs">
          <span
            className={cn(
              "font-semibold tabular-nums",
              row.zone === "green" && "text-emerald-600 dark:text-emerald-400",
              row.zone === "yellow" && "text-amber-600 dark:text-amber-400",
              row.zone === "red" && "text-rose-600 dark:text-rose-400",
            )}
          >
            {row.contributionMarginPercent}%
          </span>
          <span className="ml-2 tabular-nums text-muted-foreground">
            {formatCurrency(row.contributionDollars, currency)}
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className={cn("h-full rounded-full transition-all", row.barClass)}
          style={{ width: `${row.barWidthPercent}%` }}
          role="presentation"
        />
      </div>
      <p className="text-[11px] text-muted-foreground tabular-nums">
        {row.units} sold · {formatCurrency(row.revenue, currency)} revenue
      </p>
    </div>
  );
}

export function ContributionMarginChart({
  items,
  title = "Contribution margin",
  emptyLabel = "No item sales yet today.",
  maxRows = 5,
  currency = "USD",
  className,
}: {
  items: readonly ProfitItemRow[];
  title?: string;
  emptyLabel?: string;
  maxRows?: number;
  currency?: string;
  className?: string;
}) {
  const rows = buildContributionMarginRows(items, { maxRows });

  return (
    <div className={cn("space-y-3", className)} data-testid={CONTRIBUTION_MARGIN_CHART_TEST_ID}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-[11px] text-muted-foreground">$ contribution · % margin</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        rows.map((row) => <ContributionMarginBar key={row.productId} row={row} currency={currency} />)
      )}
    </div>
  );
}
