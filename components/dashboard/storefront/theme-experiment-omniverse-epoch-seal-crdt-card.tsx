import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateOmniverseEpochSealCrdtGate,
  isOmniverseEpochSealCrdtEnabled,
  readOmniverseEpochSealCrdt,
} from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";

export function ThemeExperimentOmniverseEpochSealCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readOmniverseEpochSealCrdt(themeExperimentJson);
  const gate = evaluateOmniverseEpochSealCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Omniverse epoch seal CRDT</CardTitle>
        <CardDescription>Final epoch stamp after AI5 multiverse reconciliation (AJ5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isOmniverseEpochSealCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isOmniverseEpochSealCrdtEnabled()
            ? "Omniverse epoch seal CRDT enabled"
            : "Set THEME_EXPERIMENT_OMNIVERSE_EPOCH_SEAL_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.epochQuorum} epochs · sealed {snap.omniverseEpochSealed ? "yes" : "no"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/omniverse-epoch-seal-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
