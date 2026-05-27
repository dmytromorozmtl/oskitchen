import { InsightList } from "@/components/dashboard/executive/insight-list";
import { Card, CardContent } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { canViewExecutive } from "@/lib/executive/executive-permissions";
import { requireExecutivePageAccess } from "@/lib/executive/executive-page-access";
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
  const access = await requireExecutivePageAccess("executive.view");
  if (!access.ok) return access.deny;
  const { scope, actor } = access;
  const dataUserId = actor.userId;
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
