import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMidbrainArousalPublishPacingGate,
  isMidbrainArousalPublishPacingEnabled,
  readMidbrainArousalPublishPacing,
} from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";

export function ThemeExperimentMidbrainArousalPublishPacingCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMidbrainArousalPublishPacing(themeExperimentJson);
  const gate = evaluateMidbrainArousalPublishPacingGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Midbrain arousal publish pacing</CardTitle>
        <CardDescription>Dynamic pacing over AI4 pons + AG4 spinal throttle (AJ4).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isMidbrainArousalPublishPacingEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isMidbrainArousalPublishPacingEnabled()
            ? "Midbrain arousal publish pacing enabled"
            : "Set THEME_EXPERIMENT_MIDBRAIN_AROUSAL_PUBLISH_PACING=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.arousalLevel} · dynamic {snap.dynamicPacingMs}ms
            {snap.ponsDegradeActive ? " · pons degrade" : ""}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/midbrain-arousal-publish-pacing-sync · Header: x-kos-midbrain-dynamic-pacing-ms
        </p>
      </CardContent>
    </Card>
  );
}
