import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateCorticalOrganoidMeshGate,
  isCorticalOrganoidMeshEnabled,
  readCorticalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";

export function ThemeExperimentCorticalOrganoidMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const mesh = readCorticalOrganoidMesh(themeExperimentJson);
  const gate = evaluateCorticalOrganoidMeshGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Cortical organoid mesh</CardTitle>
        <CardDescription>
          Shared wetware plasticity graph across storefronts — multi-store synapse merge (Y2).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isCorticalOrganoidMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isCorticalOrganoidMeshEnabled()
            ? "Cortical organoid mesh enabled"
            : "Set THEME_EXPERIMENT_CORTICAL_ORGANOID_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {mesh ? (
          <p className="font-mono text-xs">
            {mesh.nodes.length} nodes · {mesh.edges.length} edges · synced{" "}
            {mesh.meshSynced ? "yes" : "no"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/cortical-organoid-mesh-sync · x-kos-cortical-organoid-mesh
        </p>
      </CardContent>
    </Card>
  );
}
