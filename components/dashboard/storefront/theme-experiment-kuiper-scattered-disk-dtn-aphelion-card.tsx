import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateKuiperScatteredDiskDtnAphelionGate,
  isKuiperScatteredDiskDtnAphelionEnabled,
  readKuiperScatteredDiskDtnAphelion,
} from "@/lib/storefront/theme-experiment-kuiper-scattered-disk-dtn-aphelion";

export function ThemeExperimentKuiperScatteredDiskDtnAphelionCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readKuiperScatteredDiskDtnAphelion(themeExperimentJson);
  const gate = evaluateKuiperScatteredDiskDtnAphelionGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Kuiper scattered-disk DTN aphelion</CardTitle>
        <CardDescription>Aphelion relay over AN1 Pluto barycenter + AE heliopause (AO1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isKuiperScatteredDiskDtnAphelionEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isKuiperScatteredDiskDtnAphelionEnabled()
            ? "Kuiper aphelion relay enabled"
            : "Set THEME_EXPERIMENT_KUIPER_SCATTERED_DISK_DTN_APHELION=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.aphelionQuorum} nodes · max {snap.maxAphelionLatencyMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/kuiper-scattered-disk-dtn-aphelion-sync</p>
      </CardContent>
    </Card>
  );
}
