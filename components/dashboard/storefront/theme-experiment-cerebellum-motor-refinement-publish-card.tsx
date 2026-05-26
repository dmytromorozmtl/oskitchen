import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateCerebellumMotorRefinementPublishGate,
  isCerebellumMotorRefinementPublishEnabled,
  readCerebellumMotorRefinementPublish,
} from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";

export function ThemeExperimentCerebellumMotorRefinementPublishCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readCerebellumMotorRefinementPublish(themeExperimentJson);
  const gate = evaluateCerebellumMotorRefinementPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Cerebellum motor refinement publish</CardTitle>
        <CardDescription>Fine motor tuning after AL4 basal ganglia (AM4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isCerebellumMotorRefinementPublishEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isCerebellumMotorRefinementPublishEnabled()
            ? "Cerebellum motor refinement enabled"
            : "Set THEME_EXPERIMENT_CEREBELLUM_MOTOR_REFINEMENT_PUBLISH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.refinementPhase} · scalar {snap.refinementScalar.toFixed(2)}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/cerebellum-motor-refinement-publish-sync</p>
      </CardContent>
    </Card>
  );
}
