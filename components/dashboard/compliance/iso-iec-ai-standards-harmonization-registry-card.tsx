import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateIsoIecAiStandardsHarmonizationRegistryGate,
  isIsoIecAiStandardsHarmonizationRegistryEnabled,
  readIsoIecAiStandardsHarmonizationRegistry,
} from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";

export function IsoIecAiStandardsHarmonizationRegistryCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readIsoIecAiStandardsHarmonizationRegistry(themeExperimentJson);
  const gate = evaluateIsoIecAiStandardsHarmonizationRegistryGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ISO / IEC AI standards harmonization</CardTitle>
        <CardDescription>Standards layer over AM2 commerce + AJ2 UN (AN2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIsoIecAiStandardsHarmonizationRegistryEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIsoIecAiStandardsHarmonizationRegistryEnabled()
            ? "ISO/IEC standards registry enabled"
            : "Set THEME_EXPERIMENT_ISO_IEC_AI_STANDARDS_HARMONIZATION_REGISTRY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.bodyQuorum} bodies · kafka {snap.kafkaRelayed ? "relayed" : "pending"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/iso-iec-ai-standards-harmonization-registry-sync · Kafka: iso-iec-ai-standards-harmonization-events
        </p>
      </CardContent>
    </Card>
  );
}
