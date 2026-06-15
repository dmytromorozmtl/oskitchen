import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateCausalForestPublishGate,
  isCausalForestEnabled,
  readCausalLiftDaily,
} from "@/lib/storefront/theme-experiment-causal-forest";

export function ThemeExperimentCausalForestCard({
  themeExperimentJson,
  globalLiftPp = 0,
}: {
  themeExperimentJson: unknown;
  globalLiftPp?: number;
}) {
  const snap = readCausalLiftDaily(themeExperimentJson);
  const gate = evaluateCausalForestPublishGate({ themeExperimentJson, globalLiftPp });

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Causal forest (geo holdout)</CardTitle>
        <CardDescription>
          {isCausalForestEnabled()
            ? "Region×segment lifts from BQ — auto postWinnerHoldoutPercent."
            : "Set THEME_EXPERIMENT_CAUSAL_FOREST=1."}
        </CardDescription>
      </CardHeader>
      {snap ? (
        <CardContent className="space-y-2 text-sm">
          <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
          <p className="text-muted-foreground">{gate.detail}</p>
          <p className="font-mono text-xs">
            {snap.cells.length} cells · synthetic {snap.syntheticControlLiftPp}pp · holdout{" "}
            {snap.recommendedHoldoutPercent}%
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
