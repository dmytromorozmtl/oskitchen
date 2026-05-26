import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateSpilloverPublishGate,
  isCausalDagEnabled,
  readSpilloverDaily,
  spilloverBanThresholdPp,
} from "@/lib/storefront/theme-experiment-causal-dag";

export function ThemeExperimentCausalDagCard({ themeExperimentJson }: { themeExperimentJson: unknown }) {
  const snap = readSpilloverDaily(themeExperimentJson);
  const gate = evaluateSpilloverPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Causal DAG (spillover)</CardTitle>
        <CardDescription>
          {isCausalDagEnabled()
            ? `workspace → storefront → region → segment. Ban publish if spillover > ${spilloverBanThresholdPp()}pp.`
            : "Set THEME_EXPERIMENT_CAUSAL_DAG=1."}
        </CardDescription>
      </CardHeader>
      {snap ? (
        <CardContent className="space-y-2 text-sm">
          <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
          <p className="text-muted-foreground">{gate.detail}</p>
          <p className="font-mono text-xs">
            {snap.cells.length} cells · max {snap.maxSpilloverPp}pp · {snap.dagEdges.length} DAG edges
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
