import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHomomorphicMetricsPublishGate,
  isHomomorphicMetricsEnabled,
  readHomomorphicMetrics,
} from "@/lib/storefront/theme-experiment-homomorphic-metrics";

export function ThemeExperimentHomomorphicMetricsCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHomomorphicMetrics(themeExperimentJson);
  const gate = evaluateHomomorphicMetricsPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Homomorphic metrics (CKKS-sim)</CardTitle>
        <CardDescription>
          {isHomomorphicMetricsEnabled()
            ? "Aggregate arm metrics on audit stream without per-visitor decrypt at edge."
            : "Set THEME_EXPERIMENT_HOMOMORPHIC_METRICS=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.scheme} · {snap.arms.length} arms · budget {snap.noiseBudgetRemaining} · lift ~
            {snap.aggregatedLiftPp}pp
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
