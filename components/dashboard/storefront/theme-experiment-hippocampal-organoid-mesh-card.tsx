import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHippocampalOrganoidMeshGate,
  isHippocampalOrganoidMeshEnabled,
  readHippocampalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";

export function ThemeExperimentHippocampalOrganoidMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const hippo = readHippocampalOrganoidMesh(themeExperimentJson);
  const gate = evaluateHippocampalOrganoidMeshGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hippocampal organoid mesh</CardTitle>
        <CardDescription>
          Temporal plasticity windows over Z2 cortical graph — decay-weighted synapse boost.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isHippocampalOrganoidMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isHippocampalOrganoidMeshEnabled()
            ? "Hippocampal organoid mesh enabled"
            : "Set THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {hippo ? (
          <p className="font-mono text-xs">
            {hippo.activeWindowCount} active windows · synced {hippo.hippocampalSynced ? "yes" : "no"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/hippocampal-organoid-mesh-sync · x-kos-hippocampal-organoid-mesh
        </p>
      </CardContent>
    </Card>
  );
}
