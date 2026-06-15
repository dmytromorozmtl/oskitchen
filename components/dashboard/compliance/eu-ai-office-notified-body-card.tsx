import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateEuAiOfficeNotifiedBodyGate,
  isEuAiOfficeNotifiedBodyEnabled,
  readEuAiOfficeNotifiedBodyPack,
} from "@/lib/compliance/eu-ai-office-notified-body";

export function EuAiOfficeNotifiedBodyCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const pack = themeExperimentJson ? readEuAiOfficeNotifiedBodyPack(themeExperimentJson) : null;
  const gate = evaluateEuAiOfficeNotifiedBodyGate(themeExperimentJson ?? null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">EU AI Office notified body</CardTitle>
        <CardDescription>
          Article 43 conformity assessment API sync — cert body cross-ref (Y4 + S4).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isEuAiOfficeNotifiedBodyEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isEuAiOfficeNotifiedBodyEnabled()
            ? "EU AI Office notified body enabled"
            : "Set THEME_EXPERIMENT_EU_AI_OFFICE_NOTIFIED_BODY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {pack ? (
          <p className="font-mono text-xs">
            {pack.assessments.length} assessments · status {pack.latestStatus ?? "—"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/eu-ai-office-conformity-sync · webhook eu-ai-office-conformity-sync
        </p>
      </CardContent>
    </Card>
  );
}
