import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateBasalGangliaActionSelectionPublishGate,
  isBasalGangliaActionSelectionPublishEnabled,
  readBasalGangliaActionSelectionPublish,
} from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";

export function ThemeExperimentBasalGangliaActionSelectionPublishCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readBasalGangliaActionSelectionPublish(themeExperimentJson);
  const gate = evaluateBasalGangliaActionSelectionPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Basal ganglia action selection publish</CardTitle>
        <CardDescription>Motor selection after AK4 thalamus sensory gate (AL4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isBasalGangliaActionSelectionPublishEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isBasalGangliaActionSelectionPublishEnabled()
            ? "Basal ganglia action selection enabled"
            : "Set THEME_EXPERIMENT_BASAL_GANGLIA_ACTION_SELECTION_PUBLISH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            action {snap.selectedAction} · confidence {snap.actionConfidence.toFixed(2)}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/basal-ganglia-action-selection-publish-sync</p>
      </CardContent>
    </Card>
  );
}
