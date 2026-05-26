import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMedullaOblongataEmergencyHaltGate,
  isMedullaOblongataEmergencyHaltEnabled,
  readMedullaOblongataEmergencyHalt,
} from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";

export function ThemeExperimentMedullaOblongataEmergencyHaltCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMedullaOblongataEmergencyHalt(themeExperimentJson);
  const gate = evaluateMedullaOblongataEmergencyHaltGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Medulla oblongata emergency halt</CardTitle>
        <CardDescription>
          Emergency publish halt over AG4 spinal throttle + ethics veto (AH4).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isMedullaOblongataEmergencyHaltEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isMedullaOblongataEmergencyHaltEnabled()
            ? "Medulla emergency halt enabled"
            : "Set THEME_EXPERIMENT_MEDULLA_OBLONGATA_EMERGENCY_HALT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.halts.length} halt events · active {snap.emergencyHaltActive ? "yes" : "no"}
            {snap.latestReason ? ` · ${snap.latestReason}` : ""}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/medulla-oblongata-emergency-halt-sync · Header: x-kos-medulla-emergency-halt
        </p>
      </CardContent>
    </Card>
  );
}
