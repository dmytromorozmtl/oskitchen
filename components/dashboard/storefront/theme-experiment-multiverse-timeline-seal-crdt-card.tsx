import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMultiverseTimelineSealCrdtGate,
  isMultiverseTimelineSealCrdtEnabled,
  readMultiverseTimelineSealCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-timeline-seal-crdt";

export function ThemeExperimentMultiverseTimelineSealCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMultiverseTimelineSealCrdt(themeExperimentJson);
  const gate = evaluateMultiverseTimelineSealCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Multiverse timeline seal CRDT</CardTitle>
        <CardDescription>Timeline seal after AM5 epoch freeze + AG5 counterfactual (AN5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMultiverseTimelineSealCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMultiverseTimelineSealCrdtEnabled()
            ? "Timeline seal CRDT enabled"
            : "Set THEME_EXPERIMENT_MULTIVERSE_TIMELINE_SEAL_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.phaseQuorum} phases · consensus {snap.consensusSealedLiftPp.toFixed(1)}pp
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/multiverse-timeline-seal-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
