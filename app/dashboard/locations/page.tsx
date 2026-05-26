import Link from "next/link";

import { createLocationFormAction } from "@/actions/locations";
import { PlanGate } from "@/components/plans/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  LOCATION_STATUS_BADGE,
  LOCATION_STATUS_LABEL,
  LOCATION_TYPE_LABEL,
} from "@/lib/locations/location-types";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  countUnassignedRecords,
  listLocationsForUser,
  loadLocationOverviewKpis,
} from "@/services/locations/location-service";

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

function shortAddress(json: unknown): string {
  if (!json || typeof json !== "object") return "—";
  const r = json as Record<string, unknown>;
  const parts = [r.city, r.region, r.country].filter((x): x is string => typeof x === "string" && x.length > 0);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export default async function LocationsPage() {
  const { userId } = await getTenantActor();

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: startOfToday(), lte: endOfToday() },
  });
  const ordersTodayByLocation = await prisma.order.groupBy({
    by: ["locationId"],
    where: orderWhere,
    _count: { _all: true },
  });
  const [locations, kpis, unassigned] = await Promise.all([
    listLocationsForUser({ userId }),
    loadLocationOverviewKpis(userId),
    countUnassignedRecords(userId),
  ]);

  const ordersByLoc = new Map(ordersTodayByLocation.map((r) => [r.locationId, r._count._all]));
  const unassignedTotal = Object.values(unassigned).reduce((a, b) => a + b, 0);

  return (
    <PlanGate userId={userId} feature="multi_location" title="Locations">
    <div className="space-y-8">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Locations</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage kitchens, storefront pickup points, delivery hubs, inventory locations, staff assignments,
            and multi-location reporting.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/locations/new">New location</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/locations/templates">Templates</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active locations" value={kpis.active} />
        <Kpi label="In setup" value={kpis.setup} />
        <Kpi label="With orders today" value={kpis.withOrdersToday} />
        <Kpi label="Missing hours" value={kpis.missingHours} hint="Storefront / routes need these" />
        <Kpi label="Missing address" value={kpis.missingAddress} />
        <Kpi label="With delivery zones" value={kpis.withDeliveryZones} />
        <Kpi label="Unassigned records" value={unassignedTotal} hint="Across menus / orders / inventory / …" />
        <Kpi label="Total locations" value={kpis.total} />
      </div>

      {locations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {locations.map((loc) => (
            <Card key={loc.id} className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base">
                    <Link href={`/dashboard/locations/${loc.id}`} className="hover:underline">
                      {loc.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {LOCATION_TYPE_LABEL[loc.type]} · {loc.timezone}
                    {loc.managerName ? ` · ${loc.managerName}` : ""}
                  </CardDescription>
                </div>
                <Badge variant={LOCATION_STATUS_BADGE[loc.status]} className="rounded-full">
                  {LOCATION_STATUS_LABEL[loc.status]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">{shortAddress(loc.addressJson)}</p>
                <p className="text-xs text-muted-foreground">
                  Orders today: <strong className="tabular-nums">{ordersByLoc.get(loc.id) ?? 0}</strong>
                  {loc.businessHoursJson ? " · hours set" : " · no hours yet"}
                  {loc.fulfillmentSettingsJson ? " · fulfillment configured" : ""}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/locations/${loc.id}`}>Open</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/locations/${loc.id}/hours`}>Hours</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/locations/${loc.id}/fulfillment`}>Fulfillment</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/locations/${loc.id}/reports`}>Reports</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick add</CardTitle>
          <CardDescription>The original 2-field form — kept working unchanged.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createLocationFormAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="SoMa kitchen" required />
            </div>
            <div className="w-full space-y-2 sm:w-48">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" placeholder="America/Los_Angeles" />
            </div>
            <Button type="submit" className="rounded-full sm:w-auto">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unassigned records</CardTitle>
          <CardDescription>
            Rows still operating without a <code>locationId</code> — they continue to work, but assigning them
            unlocks per-location reports, routes, and inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1 text-sm md:grid-cols-3">
            <li>Menus: <strong>{unassigned.menus}</strong></li>
            <li>Orders: <strong>{unassigned.orders}</strong></li>
            <li>Brands: <strong>{unassigned.brands}</strong></li>
            <li>Production batches: <strong>{unassigned.productionBatches}</strong></li>
            <li>Packing batches: <strong>{unassigned.packingBatches}</strong></li>
            <li>Delivery routes: <strong>{unassigned.routes}</strong></li>
            <li>Inventory stock: <strong>{unassigned.inventoryStocks}</strong></li>
            <li>Purchase orders: <strong>{unassigned.purchaseOrders}</strong></li>
            <li>Tasks: <strong>{unassigned.kitchenTasks}</strong></li>
          </ul>
          <Button asChild size="sm" className="mt-3">
            <Link href="/dashboard/locations/assignment">Open assignment tools</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
    </PlanGate>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="space-y-3 py-8 text-center">
        <h2 className="text-lg font-semibold">No locations yet</h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Single-location businesses can continue without setup. Add a location when you want location-specific
          hours, pickup, delivery, production, inventory, or reporting.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard/locations/new">Add location</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Continue without locations</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/locations/templates">Use template</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
