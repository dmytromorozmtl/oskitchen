import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getLocationForUser } from "@/services/locations/location-service";

export default async function LocationOverviewPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await getLocationForUser({ userId }, locationId);
  if (!loc) notFound();

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    locationId: loc.id,
    createdAt: { gte: dayStart, lte: dayEnd },
  });
  const ordersToday = await prisma.order.count({ where: orderWhere });
  const [productionToday, packingToday, routesToday, openTasks, inventoryAlerts] = await Promise.all([
    prisma.productionBatch.count({
      where: { userId, locationId: loc.id, createdAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.packingBatch.count({
      where: { userId, locationId: loc.id, createdAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.deliveryRoute.count({
      where: { userId, locationId: loc.id, createdAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.kitchenTask.count({
      where: { userId, locationId: loc.id, status: { notIn: ["DONE", "CANCELLED"] } },
    }),
    prisma.inventoryStock.count({
      where: { userId, locationId: loc.id, quantityOnHand: { lte: 0 } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Orders today" value={ordersToday} />
        <Kpi label="Production batches" value={productionToday} />
        <Kpi label="Packing batches" value={packingToday} />
        <Kpi label="Delivery routes" value={routesToday} />
        <Kpi label="Open tasks" value={openTasks} />
        <Kpi label="Inventory shortages" value={inventoryAlerts} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next best action</CardTitle>
          <CardDescription>What&apos;s missing before this location is fully wired.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!loc.addressJson ? (
            <ActionRow href={`/dashboard/locations/${loc.id}/profile`}>Add a street address.</ActionRow>
          ) : null}
          {!loc.businessHoursJson ? (
            <ActionRow href={`/dashboard/locations/${loc.id}/hours`}>Set business hours.</ActionRow>
          ) : null}
          {!loc.fulfillmentSettingsJson ? (
            <ActionRow href={`/dashboard/locations/${loc.id}/fulfillment`}>Configure pickup &amp; delivery.</ActionRow>
          ) : null}
          {loc.status === "SETUP" ? (
            <ActionRow href={`/dashboard/locations/${loc.id}/profile`}>Promote the location to <strong>Active</strong> when ready.</ActionRow>
          ) : null}
          {loc.addressJson && loc.businessHoursJson && loc.fulfillmentSettingsJson && loc.status !== "SETUP" ? (
            <p className="text-muted-foreground">Looks healthy — nothing required.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ActionRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2">
      <span>{children}</span>
      <Button asChild size="sm" variant="outline">
        <Link href={href}>Open</Link>
      </Button>
    </div>
  );
}
