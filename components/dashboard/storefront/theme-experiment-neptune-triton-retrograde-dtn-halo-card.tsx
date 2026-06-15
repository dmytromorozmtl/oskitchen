import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateNeptuneTritonRetrogradeDtnHaloGate,
  isNeptuneTritonRetrogradeDtnHaloEnabled,
  readNeptuneTritonRetrogradeDtnHalo,
} from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";

export function ThemeExperimentNeptuneTritonRetrogradeDtnHaloCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readNeptuneTritonRetrogradeDtnHalo(themeExperimentJson);
  const gate = evaluateNeptuneTritonRetrogradeDtnHaloGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Neptune Triton retrograde DTN halo</CardTitle>
        <CardDescription>Halo relay over AL1 Uranus polar + AE heliopause (AM1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isNeptuneTritonRetrogradeDtnHaloEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isNeptuneTritonRetrogradeDtnHaloEnabled()
            ? "Neptune Triton halo enabled"
            : "Set THEME_EXPERIMENT_NEPTUNE_TRITON_RETROGRADE_DTN_HALO=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.haloQuorum} segments · max {snap.maxHaloLatencyMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/neptune-triton-retrograde-dtn-halo-sync</p>
      </CardContent>
    </Card>
  );
}
