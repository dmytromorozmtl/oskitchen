import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateNistAiRmfLiveControlFeedGate,
  isNistAiRmfLiveControlFeedEnabled,
  readNistAiRmfLiveControlFeed,
} from "@/lib/compliance/nist-ai-rmf-live-control-feed";

export function NistAiRmfLiveControlFeedCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const snap = themeExperimentJson ? readNistAiRmfLiveControlFeed(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateNistAiRmfLiveControlFeedGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">NIST AI RMF live control feed</CardTitle>
        <CardDescription>US NIST AI RMF streaming controls over V4 pack + AE2 DSIT (AF2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isNistAiRmfLiveControlFeedEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isNistAiRmfLiveControlFeedEnabled()
            ? "NIST RMF live control feed enabled"
            : "Set THEME_EXPERIMENT_NIST_AI_RMF_LIVE_CONTROL_FEED=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.events.length} events · lag {snap.streamLagMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/nist-ai-rmf-live-control-feed-sync · Webhook: /api/webhooks/nist-ai-rmf-live-control-feed
        </p>
      </CardContent>
    </Card>
  );
}
