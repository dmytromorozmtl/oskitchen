import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateBrainstemAutonomicGuardGate,
  isBrainstemAutonomicGuardEnabled,
  readBrainstemAutonomicGuard,
} from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";

export function ThemeExperimentBrainstemAutonomicGuardCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readBrainstemAutonomicGuard(themeExperimentJson);
  const gate = evaluateBrainstemAutonomicGuardGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Brainstem autonomic publish guard</CardTitle>
        <CardDescription>Parasympathetic publish path after AE4 cerebellar clearance (AF4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isBrainstemAutonomicGuardEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isBrainstemAutonomicGuardEnabled()
            ? "Brainstem autonomic guard enabled"
            : "Set THEME_EXPERIMENT_BRAINSTEM_AUTONOMIC_GUARD=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            reflex {snap.latestReflex ?? "—"} · {snap.meanAutonomicLatencyMs.toFixed(1)}ms mean
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/brainstem-autonomic-guard-sync</p>
      </CardContent>
    </Card>
  );
}
