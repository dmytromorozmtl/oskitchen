import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMultiverseCounterfactualCrdtGate,
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export function ThemeExperimentMultiverseCounterfactualCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMultiverseCounterfactualCrdt(themeExperimentJson);
  const gate = evaluateMultiverseCounterfactualCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Multiverse counterfactual CRDT</CardTitle>
        <CardDescription>What-if branches over collapsed arm + AF5 omniverse DAG (AG5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMultiverseCounterfactualCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMultiverseCounterfactualCrdtEnabled()
            ? "Counterfactual CRDT enabled"
            : "Set THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.branchQuorum} branches · DAG acyclic {snap.omniverseDagAcyclic ? "yes" : "no"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/multiverse-counterfactual-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
