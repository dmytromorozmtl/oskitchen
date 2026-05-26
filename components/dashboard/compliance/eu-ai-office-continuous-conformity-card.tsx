import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateEuAiOfficeContinuousConformityGate,
  isEuAiOfficeContinuousConformityEnabled,
  readEuAiOfficeContinuousConformity,
} from "@/lib/compliance/eu-ai-office-continuous-conformity";

export function EuAiOfficeContinuousConformityCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const pack = themeExperimentJson ? readEuAiOfficeContinuousConformity(themeExperimentJson) : null;
  const gate = evaluateEuAiOfficeContinuousConformityGate(themeExperimentJson ?? null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">EU AI Office continuous conformity</CardTitle>
        <CardDescription>
          Real-time Article 43 delta sync — webhook pushes conformity deltas (Z4 + S4).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isEuAiOfficeContinuousConformityEnabled()
              ? "text-emerald-700"
              : "text-muted-foreground"
          }
        >
          {isEuAiOfficeContinuousConformityEnabled()
            ? "EU continuous conformity enabled"
            : "Set THEME_EXPERIMENT_EU_AI_OFFICE_CONTINUOUS_CONFORMITY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {pack ? (
          <p className="font-mono text-xs">
            {pack.deltas.length} deltas · lag {pack.syncLagMs}ms · ready{" "}
            {pack.continuousConformityReady ? "yes" : "no"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/eu-ai-office-continuous-conformity-sync (every 6h)
        </p>
      </CardContent>
    </Card>
  );
}
