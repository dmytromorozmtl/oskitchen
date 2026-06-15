import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateThalamusSensoryGatingPublishGate,
  isThalamusSensoryGatingPublishEnabled,
  readThalamusSensoryGatingPublish,
} from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";

export function ThemeExperimentThalamusSensoryGatingPublishCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readThalamusSensoryGatingPublish(themeExperimentJson);
  const gate = evaluateThalamusSensoryGatingPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Thalamus sensory gating publish</CardTitle>
        <CardDescription>Sensory filter before AJ4 midbrain arousal pacing (AK4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isThalamusSensoryGatingPublishEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isThalamusSensoryGatingPublishEnabled()
            ? "Thalamus sensory gating enabled"
            : "Set THEME_EXPERIMENT_THALAMUS_SENSORY_GATING_PUBLISH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            gate {snap.sensoryGateOpen ? "open" : "closed"} · clarity {snap.signalClarity.toFixed(2)}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/thalamus-sensory-gating-publish-sync</p>
      </CardContent>
    </Card>
  );
}
