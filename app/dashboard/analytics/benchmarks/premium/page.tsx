import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { BenchmarkPremiumPanel } from "@/components/analytics/benchmark-premium-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadBenchmarkPremiumDashboard } from "@/services/ai/benchmark-2.0-service";

export const metadata = {
  title: "Benchmark Premium — Analytics",
  description: "Industry benchmark reports and paid peer subscriptions.",
};

export const dynamic = "force-dynamic";

export default async function BenchmarkPremiumPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Benchmark Premium requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to unlock industry reports.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadAiFeaturePage(() => loadBenchmarkPremiumDashboard(workspaceId));
  if (!payload.ok) {
    return <AiFeatureApiError featureName="Benchmark Premium" error={payload.error} />;
  }

  return <BenchmarkPremiumPanel dashboard={payload.data} />;
}
