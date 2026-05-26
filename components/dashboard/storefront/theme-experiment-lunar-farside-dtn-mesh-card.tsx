import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateLunarFarsideDtnMeshGate,
  isLunarFarsideDtnMeshEnabled,
  readLunarFarsideDtnMesh,
} from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";

export function ThemeExperimentLunarFarsideDtnMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readLunarFarsideDtnMesh(themeExperimentJson);
  const gate = evaluateLunarFarsideDtnMeshGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Lunar far-side DTN mesh</CardTitle>
        <CardDescription>
          Shackleton–Malapert relay over AG1 subglacial quorum + AE DTN stack (AH1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isLunarFarsideDtnMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isLunarFarsideDtnMeshEnabled()
            ? "Lunar far-side DTN mesh enabled"
            : "Set THEME_EXPERIMENT_LUNAR_FARSIDE_DTN_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.nodeQuorum} nodes · max {snap.maxFarsideLatencyMs}ms farside · heliopause{" "}
            {snap.heliopauseReachable ? "reachable" : "pending"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/lunar-farside-dtn-mesh-sync</p>
      </CardContent>
    </Card>
  );
}
