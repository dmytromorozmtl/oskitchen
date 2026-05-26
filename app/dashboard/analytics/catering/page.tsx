import { AnalyticsBars } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadCateringAnalytics } from "@/services/analytics/analytics-service";

export default async function CateringAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, data] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadCateringAnalytics({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Catering & events</h1>
        <p className="text-muted-foreground">Quote pipeline value, accepted revenue, conversion rate, event mix.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/catering" brands={brands} locations={locations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Quotes in window" value={data.totalQuotes} />
        <Kpi label="Pipeline value" value={formatCurrency(data.pipelineValue)} />
        <Kpi label="Accepted revenue" value={formatCurrency(data.acceptedRevenue)} />
        <Kpi label="Conversion rate" value={ratePercentLabel(data.conversionRate)} />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue by event type</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsBars
            rows={data.byEventType
              .filter((r) => r.revenue > 0 || r.count > 0)
              .map((r) => ({ label: r.eventType, value: r.revenue }))}
            formatValue={formatCurrency}
          />
        </CardContent>
      </Card>
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
