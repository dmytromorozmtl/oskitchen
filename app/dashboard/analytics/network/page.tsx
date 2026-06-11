import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { NetworkEffectsPanel } from "@/components/analytics/network-effects-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadNetworkEffectsDashboard } from "@/services/ai/network-effects-service";

export const metadata = {
  title: "Network Effects — Analytics",
  description: "OS Kitchen gets smarter with every contributing restaurant.",
};

export const dynamic = "force-dynamic";

export default async function NetworkEffectsPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Network Effects requires a workspace</CardTitle>
          <CardDescription>Complete setup to join the anonymized restaurant intelligence mesh.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadAiFeaturePage(() => loadNetworkEffectsDashboard(workspaceId));
  if (!payload.ok) {
    return <AiFeatureApiError featureName="Restaurant Network Effects" error={payload.error} />;
  }

  return <NetworkEffectsPanel dashboard={payload.data} />;
}
