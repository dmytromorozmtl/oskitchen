import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateGlobalMeshPublishGate,
  isGlobalExperimentMeshEnabled,
  readGlobalExperimentMesh,
} from "@/lib/storefront/theme-experiment-global-mesh";

export function ThemeExperimentGlobalMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const mesh = readGlobalExperimentMesh(themeExperimentJson);
  const gate = evaluateGlobalMeshPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Global experiment mesh</CardTitle>
        <CardDescription>
          {isGlobalExperimentMeshEnabled()
            ? "CRDT outcomes across AWS/GCP/Azure · federated publish quorum."
            : "Set THEME_EXPERIMENT_GLOBAL_MESH=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {mesh ? (
          <p className="font-mono text-xs">
            clouds={mesh.cloudsReporting.join(",")} · quorum {mesh.quorumRequired} · conflicts{" "}
            {mesh.crdtConflicts}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
