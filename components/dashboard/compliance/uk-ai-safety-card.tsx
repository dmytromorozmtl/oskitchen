import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateUkAiSafetyPublishGate,
  isUkAiSafetyEnabled,
  readUkAiSafetyPack,
} from "@/lib/compliance/uk-ai-safety";

export function UkAiSafetyCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const pack = themeExperimentJson ? readUkAiSafetyPack(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateUkAiSafetyPublishGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">UK AI Safety transparency</CardTitle>
        <CardDescription>
          Capability evals · red-team log · frontier-model disclosure (extends EU AI Act).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isUkAiSafetyEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isUkAiSafetyEnabled() ? "UK AI Safety enabled" : "Set THEME_EXPERIMENT_UK_AI_SAFETY=1"}
        </p>
        {pack ? (
          <>
            <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
            <p className="text-muted-foreground">{gate.detail}</p>
            <p className="font-mono text-xs">
              {pack.capabilityEvals.length} evals · {pack.redTeamLog.length} red-team ·{" "}
              {pack.frontierDisclosure?.modelFamily} ({pack.frontierDisclosure?.capabilityTier})
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Requires EU AI Act pack + uk-ai-safety-seed cron.</p>
        )}
        <p className="font-mono text-[10px]">Cron: /api/cron/uk-ai-safety-seed</p>
      </CardContent>
    </Card>
  );
}
