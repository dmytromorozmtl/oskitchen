import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHoldoutWsGate,
  isHoldoutWsEnabled,
  readHoldoutWsControlPlane,
} from "@/lib/storefront/theme-experiment-holdout-ws";

export function ThemeExperimentHoldoutWsCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const plane = readHoldoutWsControlPlane(themeExperimentJson);
  const gate = evaluateHoldoutWsGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Holdout WebSocket control plane</CardTitle>
        <CardDescription>
          {isHoldoutWsEnabled()
            ? "Cross-region holdout sync · sub-second policy push · kos_holdout_ws_ver cookie."
            : "Set THEME_EXPERIMENT_HOLDOUT_WS=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {plane ? (
          <p className="font-mono text-xs">
            v{plane.policyVersion} · {plane.regions.length} regions · p99 {plane.pushLatencyMsP99}ms
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
