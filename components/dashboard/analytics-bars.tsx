/**
 * Server-rendered, dependency-free bar chart. Each row renders a label
 * and a CSS-width bar relative to the maximum value. Good enough for
 * the executive overview and per-tab breakdowns; can be swapped for a
 * client charting library later.
 */
export function AnalyticsBars({
  rows,
  formatValue = (n) => String(n),
  emptyText = "No data in the selected window.",
  className,
}: {
  rows: { label: string; value: number }[];
  formatValue?: (n: number) => string;
  emptyText?: string;
  className?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      {rows.map((row, idx) => {
        const pct = Math.max(2, Math.round((row.value / max) * 100));
        return (
          <div key={`${row.label}-${idx}`} className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate">{row.label}</span>
              <span className="tabular-nums text-muted-foreground">{formatValue(row.value)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsDailyArea({
  data,
  formatValue = (n) => String(n),
  label,
}: {
  data: { date: string; value: number }[];
  formatValue?: (n: number) => string;
  label?: string;
}) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data.</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      {label ? <p className="text-xs text-muted-foreground mb-2">{label}</p> : null}
      <div className="flex h-32 items-end gap-0.5">
        {data.map((d) => {
          const pct = Math.max(2, Math.round((d.value / max) * 100));
          return (
            <div key={d.date} className="flex-1" title={`${d.date} · ${formatValue(d.value)}`}>
              <div
                className="w-full rounded-t bg-primary/80"
                style={{ height: `${pct}%` }}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
