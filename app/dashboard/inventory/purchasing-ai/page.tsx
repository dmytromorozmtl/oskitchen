import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { PurchasingAiDashboard } from "@/components/dashboard/purchasing-ai-dashboard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadPurchasingAiDashboard } from "@/services/ai/ai-purchasing-dashboard";

export const dynamic = "force-dynamic";

export default async function PurchasingAiPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">AI Purchasing requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to view purchase recommendations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadAiFeaturePage(() => loadPurchasingAiDashboard(workspaceId));
  if (!payload.ok) {
    return <AiFeatureApiError featureName="AI Purchasing" error={payload.error} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PurchasingAiDashboard {...payload.data} />
    </div>
  );
}
