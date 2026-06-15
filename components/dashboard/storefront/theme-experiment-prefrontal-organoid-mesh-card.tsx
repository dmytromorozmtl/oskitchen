import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePrefrontalOrganoidMeshGate,
  isPrefrontalOrganoidMeshEnabled,
  readPrefrontalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";

export function ThemeExperimentPrefrontalOrganoidMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const pfc = readPrefrontalOrganoidMesh(themeExperimentJson);
  const gate = evaluatePrefrontalOrganoidMeshGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Prefrontal organoid mesh</CardTitle>
        <CardDescription>
          Executive gating (go/no-go) over AA2 hippocampal plasticity windows (AC2).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isPrefrontalOrganoidMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isPrefrontalOrganoidMeshEnabled()
            ? "Prefrontal organoid mesh enabled"
            : "Set THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {pfc ? (
          <p className="font-mono text-xs">
            Go rate {Math.round(pfc.goRate * 100)}% · {pfc.executiveQuorum} go gates
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/prefrontal-organoid-mesh-sync</p>
      </CardContent>
    </Card>
  );
}
