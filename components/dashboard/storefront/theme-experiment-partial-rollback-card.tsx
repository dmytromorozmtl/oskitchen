import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isPartialRollbackEnabled,
  readPartialRollbackSnapshot,
} from "@/lib/storefront/theme-experiment-partial-rollback";

export function ThemeExperimentPartialRollbackCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readPartialRollbackSnapshot(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Bayesian partial rollback</CardTitle>
        <CardDescription>
          {isPartialRollbackEnabled()
            ? "Revert layout tokens only; keep copy/pricing winner. Slack: partial vs full revert."
            : "Set THEME_EXPERIMENT_PARTIAL_ROLLBACK=1."}
        </CardDescription>
      </CardHeader>
      {snap ? (
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Snapshot {snap.at.slice(0, 10)} · PyMC counterfactual {snap.counterfactualLiftPp}pp
          </p>
          <p className="font-mono text-xs">
            Layout: brand {snap.layoutTokens?.brandColor ?? "—"} · winner nav preserved
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
