import { PurchasingAiDashboard } from "@/components/dashboard/purchasing-ai-dashboard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const payload = await loadPurchasingAiDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl">
      <PurchasingAiDashboard {...payload} />
    </div>
  );
}
