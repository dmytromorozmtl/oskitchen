import Link from "next/link";

import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import {
  DELIVERY_CHANNEL_LABEL,
  loadDeliveryChannelAnalytics,
} from "@/services/analytics/delivery-channel-analytics";

export default async function DeliveryChannelsAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, snapshot] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadDeliveryChannelAnalytics({ userId: dataUserId }, filters),
  ]);

  const activeChannels = snapshot.channels.filter(
    (c) => c.orders > 0 || c.externalStagingCount > 0 || c.connected,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Delivery channel analytics</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Unified view across DoorDash, Uber Eats, Grubhub, and Uber Direct — revenue, import
            health, and fulfillment mix in one place.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">Sales channels</Link>
        </Button>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        basePath="/dashboard/analytics/delivery-channels"
        brands={brands}
        locations={locations}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Delivery orders" value={snapshot.totalOrders} hint={snapshot.rangeLabel} />
        <Kpi label="Delivery revenue" value={formatCurrency(snapshot.totalRevenue)} />
        <Kpi label="Delivery fees" value={formatCurrency(snapshot.totalDeliveryFees)} />
        <Kpi
          label="Import success"
          value={ratePercentLabel(snapshot.overallImportSuccessRate)}
          hint={`${snapshot.totalFailedImports} failed in window`}
        />
      </div>

      {snapshot.topChannel ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Top delivery channel</CardDescription>
            <CardTitle className="text-xl">
              {snapshot.topChannel.label} · {formatCurrency(snapshot.topChannel.revenue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {snapshot.topChannel.orders} orders · AOV{" "}
            {snapshot.topChannel.avgOrderValue == null
              ? "—"
              : formatCurrency(snapshot.topChannel.avgOrderValue)}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue by delivery channel</CardTitle>
          <CardDescription>Imported kitchen orders attributed to marketplace providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsBars
            rows={activeChannels
              .filter((c) => c.revenue > 0 || c.orders > 0)
              .map((c) => ({ label: c.label, value: c.revenue }))}
            formatValue={formatCurrency}
          />
          {activeChannels.every((c) => c.revenue === 0 && c.orders === 0) ? (
            <p className="text-sm text-muted-foreground">No delivery channel revenue in this window.</p>
          ) : null}
        </CardContent>
      </Card>

      {snapshot.dailyTrend.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Daily delivery orders</CardTitle>
            <CardDescription>All marketplace imports combined.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsDailyArea
              rows={snapshot.dailyTrend.map((d) => ({ date: d.date, value: d.orders }))}
              formatValue={(n) => `${n} orders`}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Channel detail</CardTitle>
          <CardDescription>Per-provider orders, fees, fulfillment, and ingest health.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Channel</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Orders</th>
                <th className="py-2 pr-3 font-medium">Revenue</th>
                <th className="py-2 pr-3 font-medium">Delivery fees</th>
                <th className="py-2 pr-3 font-medium">Pickup / Delivery</th>
                <th className="py-2 pr-3 font-medium">Staging</th>
                <th className="py-2 font-medium">Import rate</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.channels.map((row) => (
                <tr key={row.provider} className="border-b border-border/40">
                  <td className="py-2 pr-3 font-medium">{DELIVERY_CHANNEL_LABEL[row.provider]}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={row.connected ? "default" : "outline"} className="rounded-full text-[10px]">
                      {row.connected ? "Connected" : "Not connected"}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{row.orders}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatCurrency(row.revenue)}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatCurrency(row.deliveryFees)}</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {row.pickupOrders} / {row.deliveryOrders}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{row.externalStagingCount}</td>
                  <td className="py-2 tabular-nums">{ratePercentLabel(row.importSuccessRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
