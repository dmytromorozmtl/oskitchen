import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateWtoUpuCrossBorderAiTradeRegistryGate,
  isWtoUpuCrossBorderAiTradeRegistryEnabled,
  readWtoUpuCrossBorderAiTradeRegistry,
} from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";

export function WtoUpuCrossBorderAiTradeRegistryCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readWtoUpuCrossBorderAiTradeRegistry(themeExperimentJson);
  const gate = evaluateWtoUpuCrossBorderAiTradeRegistryGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">WTO / UPU cross-border AI trade registry</CardTitle>
        <CardDescription>Trade layer over AK2 ICAO/IMO + AJ2 UN Office (AL2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isWtoUpuCrossBorderAiTradeRegistryEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isWtoUpuCrossBorderAiTradeRegistryEnabled()
            ? "WTO/UPU trade registry enabled"
            : "Set THEME_EXPERIMENT_WTO_UPU_CROSS_BORDER_AI_TRADE_REGISTRY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.bodyQuorum} bodies · lag {snap.streamLagMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/wto-upu-cross-border-ai-trade-registry-sync · Webhook: /api/webhooks/wto-upu-cross-border-ai-trade-registry
        </p>
      </CardContent>
    </Card>
  );
}
