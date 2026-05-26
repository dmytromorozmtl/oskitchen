"use client";

import type { BatchYieldSummary } from "@/services/production/batch-yield";

type Props = {
  summary: BatchYieldSummary | null;
  onActualYieldChange?: (value: number) => void;
};

export function BatchYieldCalculator({ summary, onActualYieldChange }: Props) {
  if (!summary) {
    return (
      <p className="text-sm text-muted-foreground">Generate a batch to see yield totals.</p>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 text-sm space-y-3">
      <h3 className="font-medium">Batch yield</h3>
      <dl className="grid grid-cols-2 gap-2">
        <dt className="text-muted-foreground">Scale factor</dt>
        <dd>{summary.scaleFactor}×</dd>
        <dt className="text-muted-foreground">Total units</dt>
        <dd>{summary.totalQuantity}</dd>
        <dt className="text-muted-foreground">Expected yield</dt>
        <dd>{summary.expectedYield}</dd>
        <dt className="text-muted-foreground">Yield %</dt>
        <dd>
          {summary.yieldPercent != null ? `${summary.yieldPercent}%` : "—"}
        </dd>
      </dl>
      {onActualYieldChange ? (
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">Actual yield (for %)</span>
          <input
            type="number"
            min={0}
            step={1}
            className="rounded-md border px-2 py-1"
            placeholder={String(summary.expectedYield)}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isNaN(v)) onActualYieldChange(v);
            }}
          />
        </label>
      ) : null}
    </div>
  );
}
