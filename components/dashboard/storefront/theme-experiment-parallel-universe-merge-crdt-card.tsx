import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateParallelUniverseMergeCrdtGate,
  isParallelUniverseMergeCrdtEnabled,
  readParallelUniverseMergeCrdt,
} from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";

export function ThemeExperimentParallelUniverseMergeCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readParallelUniverseMergeCrdt(themeExperimentJson);
  const gate = evaluateParallelUniverseMergeCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Parallel universe merge CRDT</CardTitle>
        <CardDescription>
          Alpha/beta/gamma universe consensus over AG5 counterfactual branches (AH5).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isParallelUniverseMergeCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isParallelUniverseMergeCrdtEnabled()
            ? "Parallel universe merge CRDT enabled"
            : "Set THEME_EXPERIMENT_PARALLEL_UNIVERSE_MERGE_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.universeQuorum} universes · consensus {snap.consensusLiftPp.toFixed(1)}pp lift
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/parallel-universe-merge-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
