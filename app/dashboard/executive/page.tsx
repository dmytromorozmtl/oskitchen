import Link from "next/link";

import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { ExecutiveFilterBar } from "@/components/dashboard/executive/executive-filter-bar";
import { ExecutiveKpiCard } from "@/components/dashboard/executive/kpi-card";
import { CostingVarianceCard } from "@/components/executive/costing-variance-card";
import { HealthScoreCard } from "@/components/dashboard/executive/health-score-card";
import { InsightList } from "@/components/dashboard/executive/insight-list";
import { RefreshSnapshotButton } from "@/components/dashboard/executive/refresh-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { parseAnalyticsFilters, serialiseFilters } from "@/lib/analytics/filters";
import { canViewExecutive } from "@/lib/executive/executive-permissions";
import { executiveTerminologyForMode } from "@/lib/executive/executive-terminology";
import { prisma } from "@/lib/prisma";
import {
  listOpenExecutiveInsights,
  loadExecutiveOverview,
} from "@/services/executive/executive-dashboard-service";

export default async function ExecutiveDashboardPage({
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
          You do not have permission to view the executive dashboard.
        </CardContent>
      </Card>
    );
  }

  const filters = parseAnalyticsFilters(sp);
  const basePath = "/dashboard/executive";
  const filtersQuery = serialiseFilters(filters).toString();

  const [profile, overview, openInsights, brands, locations] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { kitchenSettings: { select: { businessType: true } } },
    }),
    loadExecutiveOverview({ userId: dataUserId }, filters),
    listOpenExecutiveInsights({ userId: dataUserId }),
    prisma.brand.findMany({
      where: { workspace: { ownerUserId: user.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      where: { userId: dataUserId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const terminology = executiveTerminologyForMode(profile?.kitchenSettings?.businessType ?? null);

  const showFinancial = canViewExecutive(scope, "executive.read.financial");
  const showBrandLocation = canViewExecutive(scope, "executive.read.brand_location");
  const canManageInsights = canViewExecutive(scope, "executive.insights.manage");

  const kpis = overview.kpis.filter((k) => {
    if (!showFinancial && ["revenue", "average_order_value", "margin_estimate", "meal_plan_recurring", "catering_pipeline", "top_channel", "purchasing_needs", "repeat_customers"].includes(k.key)) {
      return false;
    }
    if (!showBrandLocation && ["top_brand", "top_location"].includes(k.key)) {
      return false;
    }
    return true;
  });

  const hasAnyData =
    overview.orderCount > 0 ||
    overview.productionTotal > 0 ||
    overview.packingTotal > 0 ||
    overview.deliveryStops > 0 ||
    overview.brandCount > 0 ||
    overview.locationCount > 0;

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{terminology.pageSubtitle}</p>
        </header>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-3 py-10 text-center">
            <p className="text-lg font-semibold">Executive dashboard needs operational data</p>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
              Create orders, connect sales channels, add production workflows, or import demo data to start
              seeing business health metrics.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/dashboard/orders"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Create order
              </Link>
              <Link
                href="/dashboard/integrations"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium"
              >
                Connect sales channel
              </Link>
              <Link
                href="/dashboard/import-export"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium"
              >
                Import demo data
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{terminology.pageSubtitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{overview.rangeLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Link
            href="/dashboard/executive/report"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Export executive report
          </Link>
          <Link
            href="/dashboard/analytics"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Open analytics
          </Link>
          <RefreshSnapshotButton filtersQuery={filtersQuery} />
        </div>
      </header>

      <ExecutiveFilterBar
        filters={filters}
        basePath={basePath}
        brands={brands}
        locations={locations}
      />

      {showFinancial ? <CostingVarianceCard summary={overview.costingVarianceAlerts} /> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <HealthScoreCard health={overview.health} />
        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Owner focus</CardTitle>
            <CardDescription>{overview.rangeLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {terminology.focusBullets.map((b) => (
                <li key={b} className="rounded-md bg-muted/50 px-3 py-2 text-foreground">
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.slice(0, 8).map((k) => (
          <ExecutiveKpiCard key={k.key} kpi={k} />
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.slice(8).map((k) => (
          <ExecutiveKpiCard key={k.key} kpi={k} />
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {showFinancial && (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue trend</CardTitle>
              <CardDescription>Net revenue per day in the window.</CardDescription>
            </CardHeader>
            <CardContent>
              {overview.dailyRevenue.length === 0 ? (
                <p className="text-sm text-muted-foreground">No revenue yet for this window.</p>
              ) : (
                <AnalyticsDailyArea
                  data={overview.dailyRevenue}
                  formatValue={(n) => `$${n.toFixed(0)}`}
                />
              )}
            </CardContent>
          </Card>
        )}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top products</CardTitle>
            <CardDescription>Units sold in the window.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={overview.topProducts.map((p) => ({ label: p.title, value: p.quantity }))}
              emptyText="No order items in the window."
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Risks &amp; next actions</h2>
        <InsightList
          insights={openInsights}
          canManage={canManageInsights}
        />
      </section>

      {overview.warnings.length > 0 && (
        <Card className="border-amber-300/60 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40">
          <CardContent className="py-4 text-sm">
            <ul className="list-disc space-y-1 pl-5 text-amber-900 dark:text-amber-100">
              {overview.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
