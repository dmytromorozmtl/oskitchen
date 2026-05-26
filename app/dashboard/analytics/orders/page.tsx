import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadOrderAnalytics } from "@/services/analytics/analytics-service";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function OrdersAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, data] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadOrderAnalytics({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Order analytics</h1>
        <p className="text-muted-foreground">Order volume, cancellations, fulfillment mix, recurring share.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/orders" brands={brands} locations={locations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total orders" value={data.totalOrders} />
        <Kpi label="Cancelled" value={data.cancelledOrders} hint={ratePercentLabel(data.cancellationRate)} />
        <Kpi label="Pickup" value={data.fulfillmentMix.pickup} />
        <Kpi label="Delivery" value={data.fulfillmentMix.delivery} />
        <Kpi label="Internal" value={data.internalCount} />
        <Kpi label="External" value={data.externalCount} />
        <Kpi label="Recurring (meal plan)" value={data.recurringOrders} />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Order volume per day</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsDailyArea data={data.daily} formatValue={(n) => `${n} orders`} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Hourly heatmap</CardTitle>
            <CardDescription>Order create-time by hour of day.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={data.hourlyHeatmap.map((h) => ({ label: `${h.hour}:00`, value: h.count }))}
              formatValue={(n) => `${n} orders`}
            />
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Day-of-week pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={data.weekdayHeatmap.map((d) => ({ label: WEEK_DAYS[d.day], value: d.count }))}
              formatValue={(n) => `${n} orders`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
