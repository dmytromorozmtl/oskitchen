import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateCenCenelecDigitalProductGovernanceRegistryGate,
  isCenCenelecDigitalProductGovernanceRegistryEnabled,
  readCenCenelecDigitalProductGovernanceRegistry,
} from "@/lib/compliance/cen-cenelec-digital-product-governance-registry";

export function CenCenelecDigitalProductGovernanceRegistryCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readCenCenelecDigitalProductGovernanceRegistry(themeExperimentJson);
  const gate = evaluateCenCenelecDigitalProductGovernanceRegistryGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">CEN / CENELEC digital product governance</CardTitle>
        <CardDescription>Governance layer over AN2 standards + EU notified body (AO2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isCenCenelecDigitalProductGovernanceRegistryEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isCenCenelecDigitalProductGovernanceRegistryEnabled()
            ? "CEN/CENELEC governance registry enabled"
            : "Set THEME_EXPERIMENT_CEN_CENELEC_DIGITAL_PRODUCT_GOVERNANCE_REGISTRY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.bodyQuorum} bodies · kafka {snap.kafkaRelayed ? "relayed" : "pending"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/cen-cenelec-digital-product-governance-registry-sync · Kafka: cen-cenelec-digital-governance-events
        </p>
      </CardContent>
    </Card>
  );
}
