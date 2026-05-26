import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateArcticQuantumMeshGate,
  isArcticQuantumMeshEnabled,
  readArcticQuantumMesh,
} from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";

export function ThemeExperimentArcticQuantumMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readArcticQuantumMesh(themeExperimentJson);
  const gate = evaluateArcticQuantumMeshGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Arctic quantum mesh</CardTitle>
        <CardDescription>Greenland–Iceland relay over AE1 pan-Pacific quantum mesh (AF1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isArcticQuantumMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isArcticQuantumMeshEnabled()
            ? "Arctic quantum mesh enabled"
            : "Set THEME_EXPERIMENT_ARCTIC_QUANTUM_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.relayQuorum} GI relays · max latency {snap.maxLatencyMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/arctic-quantum-mesh-sync</p>
      </CardContent>
    </Card>
  );
}
