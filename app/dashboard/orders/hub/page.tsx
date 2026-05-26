import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getAggregatedOrders } from "@/services/orders/aggregation-service";

export default async function OrdersAggregationHubPage() {
  const { dataUserId } = await getTenantActor();
  const { orders, byChannel, totalOrders, totalRevenue } = await getAggregatedOrders(dataUserId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Order aggregation hub</h1>
        <Link href="/dashboard/order-hub" className="text-sm text-primary underline">
          Full order hub →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Last 24h orders</CardTitle>
            <p className="text-2xl font-semibold">{totalOrders}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Last 24h revenue</CardTitle>
            <p className="text-2xl font-semibold">${totalRevenue.toFixed(0)}</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By channel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {Object.entries(byChannel).map(([ch, stats]) => (
            <div key={ch} className="rounded-xl border px-3 py-2">
              <p className="font-medium">{ch}</p>
              <p className="text-muted-foreground">
                {stats.count} orders · ${stats.total.toFixed(0)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unified stream (priority by age)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm max-h-96 overflow-y-auto">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="flex justify-between border-b py-2 hover:bg-muted/50 rounded-lg px-2"
            >
              <span>
                {o.customerName} · {o.creationSource ?? "MANUAL"}
              </span>
              <span className="text-muted-foreground">
                {o.status} · ${o.total.toFixed(2)}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
