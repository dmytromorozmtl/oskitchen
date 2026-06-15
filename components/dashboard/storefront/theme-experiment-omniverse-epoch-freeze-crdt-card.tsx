import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateOmniverseEpochFreezeCrdtGate,
  isOmniverseEpochFreezeCrdtEnabled,
  readOmniverseEpochFreezeCrdt,
} from "@/lib/storefront/theme-experiment-omniverse-epoch-freeze-crdt";

export function ThemeExperimentOmniverseEpochFreezeCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readOmniverseEpochFreezeCrdt(themeExperimentJson);
  const gate = evaluateOmniverseEpochFreezeCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Omniverse epoch freeze CRDT</CardTitle>
        <CardDescription>Absolute epoch freeze after AL5 causality lock (AM5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isOmniverseEpochFreezeCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isOmniverseEpochFreezeCrdtEnabled()
            ? "Omniverse epoch freeze enabled"
            : "Set THEME_EXPERIMENT_OMNIVERSE_EPOCH_FREEZE_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.phaseQuorum} phases · consensus {snap.consensusFrozenLiftPp.toFixed(1)}pp frozen
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/omniverse-epoch-freeze-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
