import type { ExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export function ThemeExperimentMetrics({ rows }: { rows: ExperimentArmMetrics[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.arm} className="rounded-xl border border-border/80 bg-muted/20 p-4 text-sm">
          <p className="font-medium capitalize">{r.arm} arm</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
            <dt>Exposures</dt>
            <dd className="text-right font-medium text-foreground">{r.exposures}</dd>
            <dt>Checkouts started</dt>
            <dd className="text-right font-medium text-foreground">{r.checkouts}</dd>
            <dt>Submissions</dt>
            <dd className="text-right font-medium text-foreground">{r.conversions}</dd>
            <dt>Checkout → submit</dt>
            <dd className="text-right font-medium text-foreground">{r.conversionRatePercent}%</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}
