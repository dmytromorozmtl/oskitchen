import { InsightList } from "@/components/dashboard/executive/insight-list";
import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { canViewExecutive } from "@/lib/executive/executive-permissions";
import {
  listOpenExecutiveInsights,
  loadExecutiveOverview,
  syncExecutiveInsights,
} from "@/services/executive/executive-dashboard-service";

export default async function ExecutiveRisksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scope = { isOwner: true, email: user.email ?? null, role: null };
  if (!canViewExecutive(scope, "executive.view")) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view executive risks.
        </CardContent>
      </Card>
    );
  }
  const filters = parseAnalyticsFilters(sp);
  const overview = await loadExecutiveOverview({ userId: dataUserId }, filters);
  await syncExecutiveInsights({ userId: dataUserId }, overview);
  const insights = await listOpenExecutiveInsights({ userId: dataUserId });
  const canManageInsights = canViewExecutive(scope, "executive.insights.manage");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Risks &amp; next actions</h1>
        <p className="text-sm text-muted-foreground">
          Auto-derived from your workspace data. {overview.rangeLabel}
        </p>
      </header>
      <InsightList insights={insights} canManage={canManageInsights} />
    </div>
  );
}
