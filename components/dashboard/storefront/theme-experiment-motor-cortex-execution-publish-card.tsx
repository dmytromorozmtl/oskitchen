import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMotorCortexExecutionPublishGate,
  isMotorCortexExecutionPublishEnabled,
  readMotorCortexExecutionPublish,
} from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";

export function ThemeExperimentMotorCortexExecutionPublishCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMotorCortexExecutionPublish(themeExperimentJson);
  const gate = evaluateMotorCortexExecutionPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Motor cortex execution publish</CardTitle>
        <CardDescription>Execution layer after AM4 cerebellum + AJ4 midbrain (AN4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMotorCortexExecutionPublishEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMotorCortexExecutionPublishEnabled()
            ? "Motor cortex execution enabled"
            : "Set THEME_EXPERIMENT_MOTOR_CORTEX_EXECUTION_PUBLISH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            mode {snap.executionMode} · precision {snap.executionPrecision.toFixed(2)}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/motor-cortex-execution-publish-sync</p>
      </CardContent>
    </Card>
  );
}
