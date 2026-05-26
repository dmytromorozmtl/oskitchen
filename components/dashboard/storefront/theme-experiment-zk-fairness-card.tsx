import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateZkAssignmentFairnessGate,
  isZkAssignmentFairnessEnabled,
  readZkAssignmentFairness,
} from "@/lib/storefront/theme-experiment-zk-assignment-fairness";

export function ThemeExperimentZkFairnessCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readZkAssignmentFairness(themeExperimentJson);
  const gate = evaluateZkAssignmentFairnessGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ZK assignment fairness (Groth16)</CardTitle>
        <CardDescription>
          {isZkAssignmentFairnessEnabled()
            ? "Proof of fair bucket→arm mapping without revealing visitorId."
            : "Set THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.proofs.length} proofs · verify {Math.round(snap.verificationRate * 100)}%
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
