import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateGalacticMeshPublishGate,
  isGalacticMeshEnabled,
  readGalacticMesh,
} from "@/lib/storefront/theme-experiment-galactic-mesh";

export function ThemeExperimentGalacticMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const gal = readGalacticMesh(themeExperimentJson);
  const gate = evaluateGalacticMeshPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Galactic mesh quorum</CardTitle>
        <CardDescription>
          Andromeda relay simulation + intergalactic CRDT merge into global mesh (Y5 + V5).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isGalacticMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isGalacticMeshEnabled() ? "Galactic mesh enabled" : "Set THEME_EXPERIMENT_GALACTIC_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {gal ? (
          <p className="font-mono text-xs">
            {gal.outcomes.length} outcomes · {gal.intergalacticQuorum} relays · lift ~
            {gal.mergedLiftPp.toFixed(1)}pp
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/galactic-mesh-sync · x-kos-galactic-mesh</p>
      </CardContent>
    </Card>
  );
}
