import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateAntarcticSubglacialMeshGate,
  isAntarcticSubglacialMeshEnabled,
  readAntarcticSubglacialMesh,
} from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";

export function ThemeExperimentAntarcticSubglacialMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readAntarcticSubglacialMesh(themeExperimentJson);
  const gate = evaluateAntarcticSubglacialMeshGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Antarctic subglacial mesh</CardTitle>
        <CardDescription>McMurdo–Palmer relay over AF1 Greenland–Iceland quorum (AG1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isAntarcticSubglacialMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isAntarcticSubglacialMeshEnabled()
            ? "Antarctic subglacial mesh enabled"
            : "Set THEME_EXPERIMENT_ANTARCTIC_SUBGLACIAL_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.relayQuorum} MP relays · max {snap.maxSubglacialLatencyMs}ms subglacial
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/antarctic-subglacial-mesh-sync</p>
      </CardContent>
    </Card>
  );
}
