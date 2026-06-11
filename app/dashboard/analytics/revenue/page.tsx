import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ANALYTICS_CHANNEL_LABEL } from "@/lib/analytics/channel-attribution";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, overview] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadExecutiveOverview({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Revenue analytics</h1>
        <p className="text-muted-foreground">Gross, net, fees, and channel/fulfillment breakdowns.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/revenue" brands={brands} locations={locations} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Gross revenue" value={formatCurrency(overview.grossRevenue)} />
        <Kpi label="Net revenue" value={formatCurrency(overview.netRevenue)} />
        <Kpi label="Cancelled (revenue lost)" value={formatCurrency(overview.cancelledRevenue)} />
        <Kpi label="AOV" value={overview.aov != null ? formatCurrency(overview.aov) : "—"} />
        <Kpi label="Catering revenue" value={formatCurrency(overview.cateringRevenue)} />
        <Kpi label="Meal plan revenue" value={formatCurrency(overview.mealPlanRevenue)} />
        <Kpi label="Pickup revenue" value={formatCurrency(overview.fulfillmentMix.pickup)} />
        <Kpi label="Delivery revenue" value={formatCurrency(overview.fulfillmentMix.delivery)} />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Daily revenue</CardTitle>
          <CardDescription>Gross revenue per day in window.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsDailyArea data={overview.dailyRevenue} formatValue={formatCurrency} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue by channel</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={overview.channelMix
                .filter((c) => c.revenue > 0)
                .map((c) => ({ label: ANALYTICS_CHANNEL_LABEL[c.channel], value: c.revenue }))}
              formatValue={(n) => formatCurrency(n)}
            />
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top products</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsBars rows={overview.topProducts.map((p) => ({ label: p.title, value: p.quantity }))} formatValue={(n) => `${n} units`} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
