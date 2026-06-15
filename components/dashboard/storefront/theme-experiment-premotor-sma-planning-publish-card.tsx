import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePremotorSmaPlanningPublishGate,
  isPremotorSmaPlanningPublishEnabled,
  readPremotorSmaPlanningPublish,
} from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";

export function ThemeExperimentPremotorSmaPlanningPublishCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readPremotorSmaPlanningPublish(themeExperimentJson);
  const gate = evaluatePremotorSmaPlanningPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Premotor / SMA planning publish</CardTitle>
        <CardDescription>Planning layer after AN4 motor cortex + ethics board (AO4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isPremotorSmaPlanningPublishEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isPremotorSmaPlanningPublishEnabled()
            ? "Premotor SMA planning enabled"
            : "Set THEME_EXPERIMENT_PREMOTOR_SMA_PLANNING_PUBLISH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            mode {snap.planningMode} · coherence {snap.sequenceCoherence.toFixed(2)}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/premotor-sma-planning-publish-sync</p>
      </CardContent>
    </Card>
  );
}
