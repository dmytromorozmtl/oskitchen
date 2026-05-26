import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateUsFtcAiTransparencyLiveGate,
  isUsFtcAiTransparencyLiveEnabled,
  readUsFtcAiTransparencyLive,
} from "@/lib/compliance/us-ftc-ai-transparency-live-feed";

export function UsFtcAiTransparencyLiveCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const snap = themeExperimentJson ? readUsFtcAiTransparencyLive(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateUsFtcAiTransparencyLiveGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">US FTC AI transparency live</CardTitle>
        <CardDescription>
          Live FTC disclosure stream aligned with AF2 NIST RMF + AG2 EU Art. 71 PMM (AH2).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isUsFtcAiTransparencyLiveEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isUsFtcAiTransparencyLiveEnabled()
            ? "US FTC AI transparency live enabled"
            : "Set THEME_EXPERIMENT_US_FTC_AI_TRANSPARENCY_LIVE=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.events.length} events · {snap.highHarmOpen} high-harm open · Kafka{" "}
            {snap.kafkaRelayed ? "relayed" : "pending"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/us-ftc-ai-transparency-live-sync · Webhook:
          /api/webhooks/us-ftc-ai-transparency-live
        </p>
      </CardContent>
    </Card>
  );
}
