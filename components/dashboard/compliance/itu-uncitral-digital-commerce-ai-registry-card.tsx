import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateItuUncitralDigitalCommerceAiRegistryGate,
  isItuUncitralDigitalCommerceAiRegistryEnabled,
  readItuUncitralDigitalCommerceAiRegistry,
} from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";

export function ItuUncitralDigitalCommerceAiRegistryCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readItuUncitralDigitalCommerceAiRegistry(themeExperimentJson);
  const gate = evaluateItuUncitralDigitalCommerceAiRegistryGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ITU-T / UNCITRAL digital commerce AI registry</CardTitle>
        <CardDescription>Commerce layer over AL2 WTO/UPU + AJ2 UN (AM2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isItuUncitralDigitalCommerceAiRegistryEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isItuUncitralDigitalCommerceAiRegistryEnabled()
            ? "Digital commerce registry enabled"
            : "Set THEME_EXPERIMENT_ITU_UNCITRAL_DIGITAL_COMMERCE_AI_REGISTRY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.bodyQuorum} bodies · lag {snap.streamLagMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/itu-uncitral-digital-commerce-ai-registry-sync · Webhook: /api/webhooks/itu-uncitral-digital-commerce-ai-registry
        </p>
      </CardContent>
    </Card>
  );
}
