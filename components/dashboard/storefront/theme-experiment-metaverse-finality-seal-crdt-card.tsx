import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMetaverseFinalitySealCrdtGate,
  isMetaverseFinalitySealCrdtEnabled,
  readMetaverseFinalitySealCrdt,
} from "@/lib/storefront/theme-experiment-metaverse-finality-seal-crdt";

export function ThemeExperimentMetaverseFinalitySealCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMetaverseFinalitySealCrdt(themeExperimentJson);
  const gate = evaluateMetaverseFinalitySealCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Metaverse finality seal CRDT</CardTitle>
        <CardDescription>Irreversible finality after AJ5 omniverse epoch seal (AK5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMetaverseFinalitySealCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMetaverseFinalitySealCrdtEnabled()
            ? "Metaverse finality seal enabled"
            : "Set THEME_EXPERIMENT_METAVERSE_FINALITY_SEAL_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.phaseQuorum} phases · consensus {snap.consensusFinalLiftPp.toFixed(1)}pp
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/metaverse-finality-seal-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
