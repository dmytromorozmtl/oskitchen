import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateOmniverseCausalGraphCrdtGate,
  isOmniverseCausalGraphCrdtEnabled,
  readOmniverseCausalGraph,
} from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";

export function ThemeExperimentOmniverseCausalGraphCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readOmniverseCausalGraph(themeExperimentJson);
  const gate = evaluateOmniverseCausalGraphCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Omniverse causal graph CRDT</CardTitle>
        <CardDescription>Treatment→mediator→outcome DAG over AE5 multiverse collapse (AF5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isOmniverseCausalGraphCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isOmniverseCausalGraphCrdtEnabled()
            ? "Omniverse causal graph CRDT enabled"
            : "Set THEME_EXPERIMENT_OMNIVERSE_CAUSAL_GRAPH_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.nodeQuorum} nodes · lift {snap.mergedLiftPp.toFixed(1)}pp
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/omniverse-causal-graph-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
