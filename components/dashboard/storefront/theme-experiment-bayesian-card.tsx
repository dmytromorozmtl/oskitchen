import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeExperimentBayesianFanChart } from "@/components/dashboard/storefront/theme-experiment-bayesian-fan-chart";
import { ThemeExperimentBayesianHierarchicalChart } from "@/components/dashboard/storefront/theme-experiment-bayesian-hierarchical-chart";
import { isHierarchicalBayesianEnabled } from "@/lib/storefront/theme-experiment-bayesian-hierarchical";
import {
  isBayesianBqOnlyMode,
  isBayesianDecisionEnabled,
  resolveBayesianExperimentDecision,
} from "@/lib/storefront/theme-experiment-bayesian";
import { isBayesianPriorFresh, readBayesianPriorSnapshot } from "@/lib/storefront/theme-experiment-bayesian-prior";
import type { ExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export function ThemeExperimentBayesianCard({
  armMetrics,
  themeExperimentJson,
  minLiftPp = 2,
}: {
  armMetrics: ExperimentArmMetrics[];
  themeExperimentJson?: unknown;
  minLiftPp?: number;
}) {
  const prior = readBayesianPriorSnapshot(themeExperimentJson);
  const bayesian = resolveBayesianExperimentDecision({
    arms: armMetrics.map((m) => ({
      armId: String(m.arm),
      conversions: m.conversions,
      checkouts: m.checkouts,
    })),
    thresholdPp: minLiftPp,
    themeExperimentJson,
  });

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Bayesian posterior</CardTitle>
        <CardDescription>
          {isBayesianDecisionEnabled()
            ? `${isBayesianBqOnlyMode() ? "BQ-primary · " : ""}P(lift > ${minLiftPp}pp) = ${bayesian.probLiftAboveThreshold}% · ${bayesian.headline}`
            : "Set THEME_EXPERIMENT_BAYESIAN=1 for posterior decision gate."}
          {prior && isBayesianPriorFresh(prior) ? (
            <span className="mt-1 block text-xs">
              Batch prior ({prior.source}) updated {new Date(prior.at).toLocaleString()}
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      {bayesian.enabled ? (
        <CardContent className="space-y-4 text-sm">
          <p>{bayesian.detail}</p>
          {isHierarchicalBayesianEnabled() ? (
            <ThemeExperimentBayesianHierarchicalChart themeExperimentJson={themeExperimentJson} />
          ) : null}
          <ThemeExperimentBayesianFanChart
            posteriors={bayesian.posteriors}
            themeExperimentJson={themeExperimentJson}
          />
          <ul className="space-y-1">
            {bayesian.posteriors.map((p) => (
              <li key={p.armId} className="flex justify-between font-mono text-xs">
                <span>{p.armId}</span>
                <span>
                  {(p.meanRate * 100).toFixed(1)}% [{ (p.credibleIntervalLow * 100).toFixed(1)}%,{" "}
                  {(p.credibleIntervalHigh * 100).toFixed(1)}%]
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      ) : null}
    </Card>
  );
}
