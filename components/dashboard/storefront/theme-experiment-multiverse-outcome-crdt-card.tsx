import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMultiverseOutcomeCrdtGate,
  isMultiverseOutcomeCrdtEnabled,
  readMultiverseOutcomeCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";

export function ThemeExperimentMultiverseOutcomeCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMultiverseOutcomeCrdt(themeExperimentJson);
  const gate = evaluateMultiverseOutcomeCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Multiverse outcome CRDT</CardTitle>
        <CardDescription>Superposition collapse over cosmic web federation (AE5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMultiverseOutcomeCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMultiverseOutcomeCrdtEnabled()
            ? "Multiverse CRDT enabled"
            : "Set THEME_EXPERIMENT_MULTIVERSE_OUTCOME_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap?.collapsedArmId ? (
          <p className="font-mono text-xs">collapsed arm: {snap.collapsedArmId}</p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/multiverse-outcome-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
