import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cislunarProductionLatencySloMs,
  evaluateCislunarDtnPublishGate,
  isCislunarDtnEnabled,
  readCislunarDtn,
} from "@/lib/storefront/theme-experiment-cislunar-dtn";

export function ThemeExperimentCislunarDtnCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const cis = readCislunarDtn(themeExperimentJson);
  const gate = evaluateCislunarDtnPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Cislunar DTN production</CardTitle>
        <CardDescription>
          GEO relay + Mars edge BPv7 bundles merged into W5 global mesh with production latency SLO.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isCislunarDtnEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isCislunarDtnEnabled() ? "Cislunar DTN enabled" : "Set THEME_EXPERIMENT_CISLUNAR_DTN=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {cis ? (
          <p className="font-mono text-xs">
            {cis.bpv7Count} BPv7 · p99 {cis.productionLatencyP99Ms}ms (SLO{" "}
            {cislunarProductionLatencySloMs()}ms)
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Webhook: experiment-cislunar-dtn-bundle · cron: cislunar-dtn-sync
        </p>
      </CardContent>
    </Card>
  );
}
