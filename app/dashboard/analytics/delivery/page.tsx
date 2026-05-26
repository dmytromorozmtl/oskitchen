import { AnalyticsBars } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadPackingDeliveryAnalytics } from "@/services/analytics/analytics-service";

export default async function PackingDeliveryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, data] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadPackingDeliveryAnalytics({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Packing & delivery</h1>
        <p className="text-muted-foreground">Packing completion, on-time delivery, failed stops.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/delivery" brands={brands} locations={locations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Items packed" value={`${data.packing.packed} / ${data.packing.total}`} hint={ratePercentLabel(data.packing.completionRate)} />
        <Kpi label="On-time delivery" value={ratePercentLabel(data.onTimeRate)} />
        <Kpi label="Failed stops" value={data.failedStops} />
        <Kpi label="Routes in window" value={data.routesInWindow} />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Stops by status</CardTitle>
          <CardDescription>Aggregated delivery_stops rows linked to routes in the window.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsBars
            rows={data.deliveryStops.map((s) => ({ label: s.status, value: s.count }))}
            formatValue={(n) => `${n} stops`}
          />
        </CardContent>
      </Card>
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
