import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePonsAutonomicBridgeFailoverGate,
  isPonsAutonomicBridgeFailoverEnabled,
  readPonsAutonomicBridgeFailover,
} from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";

export function ThemeExperimentPonsAutonomicBridgeFailoverCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readPonsAutonomicBridgeFailover(themeExperimentJson);
  const gate = evaluatePonsAutonomicBridgeFailoverGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Pons autonomic bridge failover</CardTitle>
        <CardDescription>
          Graceful publish degrade over AH4 medulla + AG4 spinal throttle (AI4).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isPonsAutonomicBridgeFailoverEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isPonsAutonomicBridgeFailoverEnabled()
            ? "Pons autonomic bridge failover enabled"
            : "Set THEME_EXPERIMENT_PONS_AUTONOMIC_BRIDGE_FAILOVER=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            mode {snap.bridgeMode} · degrade {snap.gracefulDegradeActive ? "active" : "off"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/pons-autonomic-bridge-failover-sync · Header: x-kos-pons-failover-mode
        </p>
      </CardContent>
    </Card>
  );
}
