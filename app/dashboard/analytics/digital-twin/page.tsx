import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { DigitalTwinDashboard } from "@/components/dashboard/digital-twin-dashboard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadDigitalTwinDashboard } from "@/services/ai/digital-twin";

export const dynamic = "force-dynamic";

export default async function DigitalTwinAnalyticsPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Digital Twin requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to run kitchen simulations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadAiFeaturePage(() => loadDigitalTwinDashboard(workspaceId));
  if (!payload.ok) {
    return <AiFeatureApiError featureName="Digital Twin" error={payload.error} />;
  }

  return <DigitalTwinDashboard {...payload.data} />;
}
