import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateSaturnRingDtnShepherdGate,
  isSaturnRingDtnShepherdEnabled,
  readSaturnRingDtnShepherd,
} from "@/lib/storefront/theme-experiment-saturn-ring-dtn-shepherd";

export function ThemeExperimentSaturnRingDtnShepherdCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readSaturnRingDtnShepherd(themeExperimentJson);
  const gate = evaluateSaturnRingDtnShepherdGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Saturn ring DTN shepherd</CardTitle>
        <CardDescription>Ring segments as relay tier over AJ1 Jupiter trojan + AE heliopause (AK1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isSaturnRingDtnShepherdEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isSaturnRingDtnShepherdEnabled()
            ? "Saturn ring shepherd enabled"
            : "Set THEME_EXPERIMENT_SATURN_RING_DTN_SHEPHERD=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.segmentQuorum} segments · max {snap.maxRingLatencyMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/saturn-ring-dtn-shepherd-sync</p>
      </CardContent>
    </Card>
  );
}
