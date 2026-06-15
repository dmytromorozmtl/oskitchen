import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateEuAiActLiveRegistryGate,
  isEuAiActLiveRegistryEnabled,
  readEuAiActLiveRegistry,
} from "@/lib/compliance/eu-ai-act-live-registry";

export function EuAiActLiveRegistryCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const snap = themeExperimentJson ? readEuAiActLiveRegistry(themeExperimentJson) : null;
  const gate = evaluateEuAiActLiveRegistryGate(themeExperimentJson ?? null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">EU AI Act live registry</CardTitle>
        <CardDescription>Webhook/SSE stream → continuous conformity refresh (AD2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isEuAiActLiveRegistryEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isEuAiActLiveRegistryEnabled()
            ? "EU live registry streaming enabled"
            : "Set THEME_EXPERIMENT_EU_AI_ACT_LIVE_REGISTRY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.events.length} events · kafka {snap.kafkaRelayed ? "ok" : "—"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Webhook: /api/webhooks/eu-ai-act-live-registry · Topic: eu-ai-conformity-events
        </p>
      </CardContent>
    </Card>
  );
}
