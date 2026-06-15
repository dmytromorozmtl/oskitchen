import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateCerebellarMotorOrganoidGate,
  isCerebellarMotorOrganoidEnabled,
  readCerebellarMotorOrganoid,
} from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";

export function ThemeExperimentCerebellarMotorOrganoidCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const cb = readCerebellarMotorOrganoid(themeExperimentJson);
  const gate = evaluateCerebellarMotorOrganoidGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Cerebellar motor organoid</CardTitle>
        <CardDescription>Reflex publish guard over ethics board (AE4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isCerebellarMotorOrganoidEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isCerebellarMotorOrganoidEnabled()
            ? "Cerebellar motor organoid enabled"
            : "Set THEME_EXPERIMENT_CEREBELLAR_MOTOR_ORGANOID=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {cb ? (
          <p className="font-mono text-xs">
            reflex {cb.latestReflex ?? "—"} · block {cb.reflexPublishBlocked ? "yes" : "no"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/cerebellar-motor-organoid-sync</p>
      </CardContent>
    </Card>
  );
}
