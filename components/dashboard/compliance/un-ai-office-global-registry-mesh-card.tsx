import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateUnAiOfficeGlobalRegistryMeshGate,
  isUnAiOfficeGlobalRegistryMeshEnabled,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";

export function UnAiOfficeGlobalRegistryMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const snap = themeExperimentJson ? readUnAiOfficeGlobalRegistryMesh(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateUnAiOfficeGlobalRegistryMeshGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">UN AI Office global registry</CardTitle>
        <CardDescription>Global registry mesh over AI2 OECD + AG2 PMM (AJ2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isUnAiOfficeGlobalRegistryMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isUnAiOfficeGlobalRegistryMeshEnabled()
            ? "UN AI Office global registry mesh enabled"
            : "Set THEME_EXPERIMENT_UN_AI_OFFICE_GLOBAL_REGISTRY_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.events.length} events · {snap.regionQuorum} UN regions
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/un-ai-office-global-registry-mesh-sync · Webhook:
          /api/webhooks/un-ai-office-global-registry-mesh
        </p>
      </CardContent>
    </Card>
  );
}
