"use client";

import { readHierarchicalBayesianPrior } from "@/lib/storefront/theme-experiment-bayesian-hierarchical";

const COLORS = ["hsl(var(--primary))", "hsl(142 76% 36%)", "hsl(262 83% 58%)"];

export function ThemeExperimentBayesianHierarchicalChart({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const hier = readHierarchicalBayesianPrior(themeExperimentJson);
  if (!hier?.metrics?.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Multi-metric posterior (hierarchical)</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {hier.metrics.map((m, i) => (
          <div
            key={m.metricId}
            className="rounded-md border border-border/60 p-3"
            style={{ borderTopColor: COLORS[i % COLORS.length], borderTopWidth: 3 }}
          >
            <p className="text-xs font-mono uppercase text-muted-foreground">{m.metricId}</p>
            <p className="mt-1 text-lg font-semibold">{m.probWinning}%</p>
            <p className="text-[10px] text-muted-foreground">P(win) · lift {m.liftPp}pp</p>
            <p className="mt-1 text-[10px] font-mono">
              P(lift&gt;{hier.thresholdPp}pp)={m.probLiftAboveThreshold}%
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, m.probWinning)}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {(m.meanControl * 100).toFixed(1)}% → {(m.meanTreatment * 100).toFixed(1)}% [
              {(m.ciLow * 100).toFixed(1)}–{(m.ciHigh * 100).toFixed(1)}%]
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {hier.allMetricsPass
          ? "All metrics pass — eligible for hierarchical publish gate."
          : "Waiting for all metrics to exceed probability threshold."}
      </p>
    </div>
  );
}
