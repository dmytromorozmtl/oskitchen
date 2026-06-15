import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePanPacificQuantumMeshGate,
  isPanPacificQuantumMeshEnabled,
  readPanPacificQuantumMesh,
} from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";

export function ThemeExperimentPanPacificQuantumMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readPanPacificQuantumMesh(themeExperimentJson);
  const gate = evaluatePanPacificQuantumMeshGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Pan-Pacific quantum mesh</CardTitle>
        <CardDescription>Tasman Sea relay over Indo-Pacific compact (AE1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isPanPacificQuantumMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isPanPacificQuantumMeshEnabled()
            ? "Pan-Pacific quantum mesh enabled"
            : "Set THEME_EXPERIMENT_PAN_PACIFIC_QUANTUM_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.relayQuorum} relays · fidelity {snap.meanFidelity.toFixed(3)}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/pan-pacific-quantum-mesh-sync</p>
      </CardContent>
    </Card>
  );
}
