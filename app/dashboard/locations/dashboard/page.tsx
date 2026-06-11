import Link from "next/link";

import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MultiLocationComparisonTable } from "@/components/dashboard/multi-location-comparison-table";
import { MultiLocationCustomDateForm } from "@/components/dashboard/multi-location-custom-date-form";
import { MultiLocationPdfExportButton } from "@/components/dashboard/multi-location-pdf-export-button";
import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadMultiLocationAnalytics } from "@/services/analytics/multi-location-analytics";

export default async function MultiLocationDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, snapshot] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadMultiLocationAnalytics({ userId: dataUserId }, filters),
  ]);

  return (
    <PlanGate userId={userId} feature="multi_location" title="Multi-location dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Multi-location dashboard</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Compare revenue, orders, labor, and food cost across every location — custom date ranges,
              PDF export, and weekly email digest included.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MultiLocationPdfExportButton snapshot={snapshot} />
            <Button asChild variant="outline" size="sm" className="rounded-full" data-testid="enterprise-multi-location-link">
              <Link href="/dashboard/enterprise/multi-location">Enterprise view</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/locations/reports">Detailed reports</Link>
            </Button>
          </div>
        </div>

        <AnalyticsFilterBar
          filters={filters}
          basePath="/dashboard/locations/dashboard"
          brands={brands}
          locations={locations}
        />

        <MultiLocationCustomDateForm filters={filters} basePath="/dashboard/locations/dashboard" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Active locations" value={snapshot.activeLocations} hint={`${snapshot.totalLocations} total`} />
          <Kpi label="Orders" value={snapshot.totalOrders} hint={snapshot.rangeLabel} />
          <Kpi label="Revenue" value={formatCurrency(snapshot.totalRevenue)} />
          <Kpi
            label="Unassigned orders"
            value={snapshot.unassignedOrders}
            hint={formatCurrency(snapshot.unassignedRevenue)}
          />
        </div>

        {snapshot.topLocation ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Top location by revenue</CardDescription>
              <CardTitle className="text-xl">
                {snapshot.topLocation.locationName} · {formatCurrency(snapshot.topLocation.revenue)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {snapshot.topLocation.orders} orders · {snapshot.topLocation.revenueShare ?? 0}% of network revenue
            </CardContent>
          </Card>
        ) : null}

        {snapshot.dailyTrend.length > 0 ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Network daily revenue</CardTitle>
              <CardDescription>All contributing locations combined.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsDailyArea
                data={snapshot.dailyTrend.map((row) => ({ date: row.date, value: row.revenue }))}
                formatValue={(n) => formatCurrency(n)}
              />
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue by location</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={snapshot.locations
                .filter((row) => row.revenue > 0 || row.orders > 0)
                .map((row) => ({ label: row.locationName, value: row.revenue }))}
              formatValue={formatCurrency}
            />
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Location vs location comparison</CardTitle>
            <CardDescription>
              Orders, revenue, labor %, food cost % — highlighted vs network average.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultiLocationComparisonTable snapshot={snapshot} />
          </CardContent>
        </Card>
      </div>
    </PlanGate>
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
