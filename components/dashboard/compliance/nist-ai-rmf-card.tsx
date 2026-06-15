import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateNistAiRmfPublishGate,
  isNistAiRmfEnabled,
  readNistAiRmfPack,
} from "@/lib/compliance/nist-ai-rmf";

export function NistAiRmfCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const pack = themeExperimentJson ? readNistAiRmfPack(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateNistAiRmfPublishGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">NIST AI RMF 1.0</CardTitle>
        <CardDescription>
          Govern / Map / Measure / Manage — extends EO 14110 + UK AI Safety packs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isNistAiRmfEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isNistAiRmfEnabled() ? "NIST AI RMF enabled" : "Set THEME_EXPERIMENT_NIST_AI_RMF=1"}
        </p>
        {pack ? (
          <>
            <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
            <p className="text-muted-foreground">{gate.detail}</p>
            <p className="font-mono text-xs">{pack.riskRegister.length} risks in register</p>
          </>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/nist-ai-rmf-seed</p>
      </CardContent>
    </Card>
  );
}
