import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateFederatedLearningPublishGate,
  isFederatedLearningEnabled,
  readFederatedLearningSnapshot,
} from "@/lib/storefront/theme-experiment-federated-learning";

export function ThemeExperimentFederatedLearningCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readFederatedLearningSnapshot(themeExperimentJson);
  const gate = evaluateFederatedLearningPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Federated learning (ε-DP)</CardTitle>
        <CardDescription>
          {isFederatedLearningEnabled()
            ? "Cross-workspace gradient aggregation · privacy budget · no raw PII export."
            : "Set THEME_EXPERIMENT_FEDERATED_LEARNING=1."}
        </CardDescription>
      </CardHeader>
      {snap ? (
        <CardContent className="space-y-2 text-sm">
          <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
          <p className="text-muted-foreground">{gate.detail}</p>
          <p className="font-mono text-xs">
            ε={snap.epsilon} · budget {snap.privacyBudgetRemaining}/{snap.privacyBudgetSpent} spent ·{" "}
            {snap.cells.length} workspaces · θ dim {snap.aggregatedTheta.length}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
