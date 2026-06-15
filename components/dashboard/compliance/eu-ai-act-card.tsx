import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateEuAiActPublishGate,
  isEuAiActPackEnabled,
  readEuAiActPack,
} from "@/lib/compliance/eu-ai-act";

export function EuAiActCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const pack = themeExperimentJson ? readEuAiActPack(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateEuAiActPublishGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">EU AI Act transparency</CardTitle>
        <CardDescription>
          Assignment model card · human oversight log · risk tier for regulated EU storefronts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isEuAiActPackEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isEuAiActPackEnabled() ? "EU AI Act pack enabled" : "Set THEME_EXPERIMENT_EU_AI_ACT=1"}
        </p>
        {pack ? (
          <>
            <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
            <p className="text-muted-foreground">{gate.detail}</p>
            <p className="font-mono text-xs">
              {pack.modelCard.systemName} · risk={pack.modelCard.riskTier} · oversight=
              {pack.oversightLog.length}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Run eu-ai-act-seed cron or enable on a storefront.</p>
        )}
        <p className="font-mono text-[10px]">Cron: /api/cron/eu-ai-act-seed</p>
      </CardContent>
    </Card>
  );
}
