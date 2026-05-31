import Link from "next/link";

import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { PlanGate } from "@/components/plans/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCATION_STATUS_BADGE, LOCATION_STATUS_LABEL, LOCATION_TYPE_LABEL } from "@/lib/locations/location-types";
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
              Aggregate revenue, order volume, routes, and tasks across every location in one command center.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/locations/reports">Detailed reports</Link>
          </Button>
        </div>

        <AnalyticsFilterBar
          filters={filters}
          basePath="/dashboard/locations/dashboard"
          brands={brands}
          locations={locations}
        />

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
            <CardTitle className="text-base">Cross-location comparison</CardTitle>
            <CardDescription>Orders, revenue, fulfillment mix, routes, and tasks.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Location</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Orders</th>
                  <th className="py-2 pr-3 font-medium">Revenue</th>
                  <th className="py-2 pr-3 font-medium">AOV</th>
                  <th className="py-2 pr-3 font-medium">Pickup / Delivery</th>
                  <th className="py-2 pr-3 font-medium">Routes</th>
                  <th className="py-2 font-medium">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.locations.map((row) => (
                  <tr key={row.locationId} className="border-b border-border/40">
                    <td className="py-2 pr-3">
                      <Link href={`/dashboard/locations/${row.locationId}/reports`} className="font-medium hover:underline">
                        {row.locationName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{LOCATION_TYPE_LABEL[row.type]}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant={LOCATION_STATUS_BADGE[row.status]} className="rounded-full text-[10px]">
                        {LOCATION_STATUS_LABEL[row.status]}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{row.orders}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(row.revenue)}</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {row.avgOrderValue == null ? "—" : formatCurrency(row.avgOrderValue)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {row.pickupOrders} / {row.deliveryOrders}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{row.routes}</td>
                    <td className="py-2 tabular-nums">{row.tasks}</td>
                  </tr>
                ))}
                {(snapshot.unassignedOrders > 0 || snapshot.unassignedRevenue > 0) && (
                  <tr className="bg-muted/30">
                    <td className="py-2 pr-3 italic text-muted-foreground">Unassigned</td>
                    <td className="py-2 pr-3">—</td>
                    <td className="py-2 pr-3 tabular-nums">{snapshot.unassignedOrders}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(snapshot.unassignedRevenue)}</td>
                    <td className="py-2 pr-3">—</td>
                    <td className="py-2 pr-3">—</td>
                    <td className="py-2 pr-3 tabular-nums">{snapshot.locations.length ? "—" : 0}</td>
                    <td className="py-2">—</td>
                  </tr>
                )}
              </tbody>
            </table>
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
