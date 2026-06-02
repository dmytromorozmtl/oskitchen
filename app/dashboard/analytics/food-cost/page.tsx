import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { FoodCostDashboard } from "@/components/dashboard/food-cost-dashboard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadFoodCostDashboard } from "@/services/ai/food-cost-dashboard";

export const dynamic = "force-dynamic";

export default async function FoodCostAnalyticsPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Food Cost AI requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to view food cost analytics.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadAiFeaturePage(() => loadFoodCostDashboard(workspaceId));
  if (!payload.ok) {
    return <AiFeatureApiError featureName="Food Cost AI" error={payload.error} />;
  }

  return <FoodCostDashboard {...payload.data} />;
}
