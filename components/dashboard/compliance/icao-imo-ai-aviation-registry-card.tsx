import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateIcaoImoAiAviationRegistryGate,
  isIcaoImoAiAviationRegistryEnabled,
  readIcaoImoAiAviationRegistry,
} from "@/lib/compliance/icao-imo-ai-aviation-registry";

export function IcaoImoAiAviationRegistryCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readIcaoImoAiAviationRegistry(themeExperimentJson);
  const gate = evaluateIcaoImoAiAviationRegistryGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ICAO / IMO AI aviation registry</CardTitle>
        <CardDescription>Transport layer over AJ2 UN Office + AG2 EU Art. 71 PMM (AK2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIcaoImoAiAviationRegistryEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIcaoImoAiAviationRegistryEnabled()
            ? "Aviation registry enabled"
            : "Set THEME_EXPERIMENT_ICAO_IMO_AI_AVIATION_REGISTRY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.authorityQuorum} authorities · lag {snap.streamLagMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/icao-imo-ai-aviation-registry-sync · Webhook: /api/webhooks/icao-imo-ai-aviation-registry
        </p>
      </CardContent>
    </Card>
  );
}
