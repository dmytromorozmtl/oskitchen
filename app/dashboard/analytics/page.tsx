import { BarChart3 } from "lucide-react";

import {
  exportAnalyticsCsvAction,
  generateAnalyticsSnapshotFormAction,
} from "@/actions/analytics";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { PlanGate } from "@/components/plans/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ANALYTICS_CHANNEL_LABEL,
} from "@/lib/analytics/channel-attribution";
import { parseAnalyticsFilters, serialiseFilters } from "@/lib/analytics/filters";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { analyticsTerminologyForMode } from "@/lib/analytics/terminology";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { externalOrderListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  loadExecutiveOverview,
} from "@/services/analytics/analytics-service";

function Kpi({ label, value, hint, badge }: { label: string; value: string | number; hint?: string; badge?: string | null }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {hint ? <span>{hint}</span> : null}
          {badge ? <Badge variant="outline" className="rounded-full text-[10px]">{badge}</Badge> : null}
        </div>
      </CardHeader>
    </Card>
  );
}

export default async function AnalyticsOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);

  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const terminology = analyticsTerminologyForMode(profile?.kitchenSettings?.businessType ?? null);

  const [orderWhere, externalWhere] = await Promise.all([
    orderListWhereForOwner(dataUserId),
    externalOrderListWhereForOwner(dataUserId),
  ]);
  const [{ brands, locations }, [orderCount, externalCount]] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    Promise.all([
      prisma.order.count({ where: orderWhere }),
      prisma.externalOrder.count({ where: externalWhere }),
    ]),
  ]);

  if (orderCount + externalCount === 0) {
    return (
      <PlanGate userId={dataUserId} feature="analytics" title={terminology.pageTitle}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{terminology.pageSubtitle}</p>
          </div>
          <EmptyState
            icon={BarChart3}
            title="Start collecting operational data"
            description="Orders, storefront activity, meal plans, catering events, and production workflows automatically feed analytics as your workspace becomes active."
            primaryLabel="Create order"
            primaryHref="/dashboard/orders"
            secondaryLabel="Connect sales channel"
            secondaryHref="/dashboard/sales-channels"
            demoHref="/demo"
          />
        </div>
      </PlanGate>
    );
  }

  const overview = await loadExecutiveOverview({ userId: dataUserId }, filters);
  const filtersQuery = serialiseFilters(filters).toString();

  return (
    <PlanGate userId={dataUserId} feature="analytics" title={terminology.pageTitle}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
            <p className="mt-1 max-w-3xl text-muted-foreground">{terminology.pageSubtitle}</p>
            <p className="text-xs text-muted-foreground">{overview.filtersRangeLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={generateAnalyticsSnapshotFormAction}>
              <Button type="submit" size="sm" variant="secondary" className="rounded-full">Snapshot now</Button>
            </form>
            <form action={async (formData) => {
              "use server";
              await exportAnalyticsCsvAction(formData);
            }}>
              <input type="hidden" name="kind" value="revenue" />
              <input type="hidden" name="filtersQuery" value={filtersQuery} />
              <Button type="submit" size="sm" variant="outline" className="rounded-full">Export revenue CSV</Button>
            </form>
          </div>
        </div>

        <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics" brands={brands} locations={locations} />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <Kpi label="Gross revenue" value={formatCurrency(overview.grossRevenue)} hint={`Net ${formatCurrency(overview.netRevenue)}`} />
          <Kpi label="Orders" value={overview.orderCount} hint={`${overview.cancelledOrderCount} cancelled`} />
          <Kpi label="AOV" value={overview.aov != null ? formatCurrency(overview.aov) : "—"} />
          <Kpi label="Repeat rate" value={overview.repeatRateLabel} />
          <Kpi label="Active customers" value={overview.activeCustomerCount} hint={`${overview.newCustomerCount} new`} />
          <Kpi label="Catering revenue" value={formatCurrency(overview.cateringRevenue)} />
          <Kpi label="Meal plan revenue" value={formatCurrency(overview.mealPlanRevenue)} />
          <Kpi label="Late orders" value={overview.lateOrderCount} hint="Past pickup, not yet ready" />
          <Kpi label="Production completion" value={ratePercentLabel(overview.productionCompletionRate)} />
          <Kpi label="Packing completion" value={ratePercentLabel(overview.packingCompletionRate)} />
          <Kpi label="Delivery completion" value={ratePercentLabel(overview.deliveryCompletionRate)} />
          <Kpi label="Top channel" value={overview.topChannel?.label ?? "—"} hint={overview.topChannel ? formatCurrency(overview.topChannel.revenue) : undefined} />
          <Kpi label="Top brand" value={overview.topBrand?.name ?? "—"} hint={overview.topBrand ? formatCurrency(overview.topBrand.revenue) : undefined} />
          <Kpi label="Top location" value={overview.topLocation?.name ?? "—"} hint={overview.topLocation ? formatCurrency(overview.topLocation.revenue) : undefined} />
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Revenue trend</CardTitle>
              <CardDescription>Daily gross revenue inside the selected window.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsDailyArea data={overview.dailyRevenue} formatValue={(n) => formatCurrency(n)} />
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Channel mix</CardTitle>
              <CardDescription>Revenue per attribution channel.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsBars
                rows={overview.channelMix
                  .filter((c) => c.revenue > 0 || c.orders > 0)
                  .map((c) => ({ label: ANALYTICS_CHANNEL_LABEL[c.channel], value: c.revenue }))}
                formatValue={(n) => formatCurrency(n)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Fulfillment mix</CardTitle>
              <CardDescription>Revenue by fulfillment type.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsBars
                rows={[
                  { label: "Pickup", value: overview.fulfillmentMix.pickup },
                  { label: "Delivery", value: overview.fulfillmentMix.delivery },
                ]}
                formatValue={(n) => formatCurrency(n)}
              />
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top products</CardTitle>
              <CardDescription>By quantity ordered in the window.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsBars
                rows={overview.topProducts.map((p) => ({ label: p.title, value: p.quantity }))}
                formatValue={(n) => `${n} units`}
              />
            </CardContent>
          </Card>
        </div>

        {overview.warnings.map((w, i) => (
          <p key={i} className="text-xs text-muted-foreground">{w}</p>
        ))}
      </div>
    </PlanGate>
  );
}
