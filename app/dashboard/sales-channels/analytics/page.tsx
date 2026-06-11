import Link from "next/link";
import { startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadSalesChannelMetrics } from "@/lib/channels/sales-channel-metrics";
import {
  channelSyncJobListWhereForOwner,
  externalOrderListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function SalesChannelsAnalyticsPage() {
  const { userId } = await getTenantActor();
  const dayStart = startOfDay(new Date());
  const [externalWhere, syncWhere] = await Promise.all([
    externalOrderListWhereForOwner(userId),
    channelSyncJobListWhereForOwner(userId),
  ]);
  const [metrics, byProvider, syncByStatus] = await Promise.all([
    loadSalesChannelMetrics(userId),
    prisma.externalOrder.groupBy({
      by: ["provider"],
      where: { AND: [externalWhere, { createdAt: { gte: dayStart } }] },
      _count: { id: true },
    }),
    prisma.channelSyncJob.groupBy({
      by: ["status"],
      where: syncWhere,
      _count: { id: true },
    }),
  ]);

  const totalSyncJobs = syncByStatus.reduce((acc, r) => acc + r._count.id, 0);
  const successSync = syncByStatus.find((s) => s.status === "SUCCESS")?._count.id ?? 0;
  const syncSuccessRate =
    totalSyncJobs === 0 ? null : Math.round((successSync / totalSyncJobs) * 1000) / 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Channel analytics</h2>
          <p className="text-sm text-muted-foreground">
            Order hub totals, heuristic slices for today, external staging counts, and recorded sync
            job outcomes.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/sales-channels">Overview</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Orders today</CardTitle>
            <CardDescription>All internal orders created today.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{metrics.ordersToday}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Storefront checkouts today</CardTitle>
            <CardDescription>Submitted storefront carts (includes unpaid / pay-later).</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {metrics.storefrontOrdersToday}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg order value (today)</CardTitle>
            <CardDescription>Orders today ÷ revenue today (Order hub).</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {metrics.ordersToday === 0
              ? "—"
              : formatCurrency(
                  metrics.ordersTodayByChannel.reduce((a, c) => a + c.revenue, 0) /
                    metrics.ordersToday,
                )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sync success rate</CardTitle>
            <CardDescription>Recorded channel sync jobs (all time).</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {syncSuccessRate == null ? "—" : `${syncSuccessRate}%`}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Orders & revenue today by source</CardTitle>
          <CardDescription>Same heuristic slices as the overview command center.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto text-sm">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Orders</th>
                <th className="py-2 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {metrics.ordersTodayByChannel.map((row) => (
                <tr key={row.key} className="border-b border-border/40">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 tabular-nums">{row.orders}</td>
                  <td className="py-2 tabular-nums">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">External ingest by provider (today)</CardTitle>
          <CardDescription>Counts rows in external order staging for troubleshooting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {byProvider.length === 0 ? (
            <p className="text-muted-foreground">No external order rows stamped today.</p>
          ) : (
            byProvider.map((row) => (
              <div key={row.provider} className="flex justify-between border-b border-border/40 py-1">
                <span>{row.provider}</span>
                <span className="tabular-nums">{row._count.id}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sync jobs by status</CardTitle>
          <CardDescription>Channel sync job ledger (includes WooCommerce runs).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {syncByStatus.length === 0 ? (
            <p className="text-muted-foreground">No sync jobs recorded yet.</p>
          ) : (
            syncByStatus.map((row) => (
              <div key={row.status} className="flex justify-between border-b border-border/40 py-1">
                <span>{row.status}</span>
                <span className="tabular-nums">{row._count.id}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
