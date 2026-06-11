import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { LazyBenchmarkDashboard } from "@/components/charts/lazy-chart-panels";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadBenchmarkDashboard } from "@/services/ai/benchmark-dashboard";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ cohort?: string }>;
};

export default async function BenchmarkAnalyticsPage({ searchParams }: Props) {
  const { workspaceId } = await getTenantActor();
  const { cohort } = await searchParams;

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Benchmark Network requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to compare against industry peers.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadAiFeaturePage(() => loadBenchmarkDashboard(workspaceId, cohort));
  if (!payload.ok) {
    return <AiFeatureApiError featureName="Benchmark Network" error={payload.error} />;
  }

  return <LazyBenchmarkDashboard {...payload.data} />;
}
