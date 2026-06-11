import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { listLocationsForUser } from "@/services/locations/location-service";

export default async function LocationReportsIndexPage() {
  const { userId } = await getTenantActor();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: since },
  });
  const ordersGroup = await prisma.order.groupBy({
    by: ["locationId"],
    where: orderWhere,
    _count: { _all: true },
  });
  const [locations, routesGroup, tasksGroup] = await Promise.all([
    listLocationsForUser({ userId }),
    prisma.deliveryRoute.groupBy({
      by: ["locationId"],
      where: { userId, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.kitchenTask.groupBy({
      by: ["locationId"],
      where: { userId, createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const ordersMap = new Map(ordersGroup.map((g) => [g.locationId, g._count._all]));
  const routesMap = new Map(routesGroup.map((g) => [g.locationId, g._count._all]));
  const tasksMap = new Map(tasksGroup.map((g) => [g.locationId, g._count._all]));

  const unassignedOrders = ordersMap.get(null) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Location reports</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Cross-location comparison for the last 30 days. Drill into any location for its own detail report.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last 30 days</CardTitle>
          <CardDescription>Orders, routes, and tasks by location. Unassigned rows are listed at the bottom.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border/70">
                  <th className="py-2 pr-2">Location</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2 text-right">Orders</th>
                  <th className="py-2 pr-2 text-right">Routes</th>
                  <th className="py-2 pr-2 text-right">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-border/40">
                    <td className="py-2 pr-2">
                      <Link href={`/dashboard/locations/${loc.id}/reports`} className="font-medium hover:underline">
                        {loc.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-2 text-muted-foreground">{loc.type}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{loc.status}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{ordersMap.get(loc.id) ?? 0}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{routesMap.get(loc.id) ?? 0}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{tasksMap.get(loc.id) ?? 0}</td>
                  </tr>
                ))}
                <tr className="bg-muted/30">
                  <td className="py-2 pr-2 italic text-muted-foreground">Unassigned</td>
                  <td className="py-2 pr-2">—</td>
                  <td className="py-2 pr-2">—</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{unassignedOrders}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{routesMap.get(null) ?? 0}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{tasksMap.get(null) ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
