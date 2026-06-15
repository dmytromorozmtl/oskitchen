import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePlutoCharonBinaryDtnBarycenterGate,
  isPlutoCharonBinaryDtnBarycenterEnabled,
  readPlutoCharonBinaryDtnBarycenter,
} from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";

export function ThemeExperimentPlutoCharonBinaryDtnBarycenterCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readPlutoCharonBinaryDtnBarycenter(themeExperimentJson);
  const gate = evaluatePlutoCharonBinaryDtnBarycenterGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Pluto Charon binary DTN barycenter</CardTitle>
        <CardDescription>Barycenter relay over AM1 Neptune halo + AE heliopause (AN1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isPlutoCharonBinaryDtnBarycenterEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isPlutoCharonBinaryDtnBarycenterEnabled()
            ? "Pluto Charon barycenter enabled"
            : "Set THEME_EXPERIMENT_PLUTO_CHARON_BINARY_DTN_BARYCENTER=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.barycenterQuorum} nodes · max {snap.maxBarycenterLatencyMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/pluto-charon-binary-dtn-barycenter-sync</p>
      </CardContent>
    </Card>
  );
}
