import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateEuAiActArt71PmmLiveGate,
  isEuAiActArt71PmmLiveEnabled,
  readEuAiActArt71PmmLive,
} from "@/lib/compliance/eu-ai-act-art71-pmm-live";

export function EuAiActArt71PmmLiveCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const snap = themeExperimentJson ? readEuAiActArt71PmmLive(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateEuAiActArt71PmmLiveGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">EU AI Act Art. 71 PMM live</CardTitle>
        <CardDescription>
          Post-market monitoring incidents — blocks publish on serious open cases (AG2).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isEuAiActArt71PmmLiveEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isEuAiActArt71PmmLiveEnabled()
            ? "Art. 71 PMM live enabled"
            : "Set THEME_EXPERIMENT_EU_AI_ACT_ART71_PMM_LIVE=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.events.length} events · {snap.openSeriousIncidents} serious open
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/eu-ai-act-art71-pmm-live-sync · Webhook: /api/webhooks/eu-ai-act-art71-pmm-live
        </p>
      </CardContent>
    </Card>
  );
}
