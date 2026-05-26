import { notFound } from "next/navigation";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default async function LocationReportsDetailPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    locationId: loc.id,
    createdAt: { gte: since },
  });
  const [orders, ordersSum] = await Promise.all([
    prisma.order.count({ where: orderWhere }),
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { total: true },
    }),
  ]);
  const [productionCount, routeCount, taskCount, taskDone, shortages] = await Promise.all([
    prisma.productionBatch.count({ where: { userId, locationId: loc.id, createdAt: { gte: since } } }),
    prisma.deliveryRoute.count({ where: { userId, locationId: loc.id, createdAt: { gte: since } } }),
    prisma.kitchenTask.count({ where: { userId, locationId: loc.id, createdAt: { gte: since } } }),
    prisma.kitchenTask.count({
      where: { userId, locationId: loc.id, status: "DONE", completedAt: { gte: since } },
    }),
    prisma.inventoryStock.count({ where: { userId, locationId: loc.id, quantityOnHand: { lte: 0 } } }),
  ]);

  const revenue = Number(ordersSum._sum.total ?? 0).toFixed(2);
  const completionRate = taskCount > 0 ? `${Math.round((taskDone / taskCount) * 100)}%` : "—";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Orders (30d)" value={orders} />
        <Kpi label="Revenue (30d)" value={revenue} />
        <Kpi label="Production batches (30d)" value={productionCount} />
        <Kpi label="Delivery routes (30d)" value={routeCount} />
        <Kpi label="Tasks created (30d)" value={taskCount} />
        <Kpi label="Tasks completed (30d)" value={taskDone} />
        <Kpi label="Task completion rate" value={completionRate} />
        <Kpi label="Inventory shortages" value={shortages} />
      </div>
    </div>
  );
}
