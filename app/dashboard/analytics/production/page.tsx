import { AnalyticsBars } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadProductionAnalytics } from "@/services/analytics/analytics-service";

export default async function ProductionAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, data] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadProductionAnalytics({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Production analytics</h1>
        <p className="text-muted-foreground">Kitchen throughput, completion, station load, delayed batches.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/production" brands={brands} locations={locations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Items planned" value={data.totalItems} />
        <Kpi label="Items completed" value={data.completedItems} hint={ratePercentLabel(data.completionRate)} />
        <Kpi label="Delayed batches" value={data.delayed} hint="Past date and not COMPLETED" />
        <Kpi label="Active stations" value={data.byStation.length} />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Load by station</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsBars
            rows={data.byStation.map((s) => ({ label: s.station, value: s.total }))}
            formatValue={(n) => `${n} items`}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent production batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No production batches in window.</p>
          ) : null}
          {data.recent.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.date.toISOString().slice(0, 10)}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="rounded-full">{b.status}</Badge>
                <span className="tabular-nums text-muted-foreground">{b.completed} / {b.total}</span>
              </div>
            </div>
          ))}
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
