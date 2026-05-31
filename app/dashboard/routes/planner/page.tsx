import Link from "next/link";

import {
  createDeliveryRouteFromOrdersFormAction,
  createManualRouteFormAction,
} from "@/actions/delivery-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { prisma } from "@/lib/prisma";
import { ROUTE_MODE_LABEL, ROUTE_MODE_VALUES, routeTerminologyForMode } from "@/lib/routes/route-types";

export default async function RoutePlannerPage() {
  const { userId, workspaceId } = await getTenantActor();
  const [kitchen, brands, locations, zones, drivers] = await Promise.all([
    findOwnerKitchenSettings(userId, { businessType: true }),
    workspaceId
      ? prisma.brand.findMany({
          where: { workspaceId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    prisma.location.findMany({
      where: { userId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.deliveryZone.findMany({
      where: { userId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.driverProfile.findMany({
      where: { userId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const businessType = kitchen?.businessType ?? null;
  const terminology = routeTerminologyForMode(businessType);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Route planner</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Build a route from open delivery orders by pickup date, or create a manual route shell and add stops later. Manual
          stop order — OS Kitchen does not call optimization APIs.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Build from delivery orders</CardTitle>
          <CardDescription>
            Pulls every open DELIVERY order with that pickup date. Sequence is creation order; reorder on the detail page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={createDeliveryRouteFromOrdersFormAction}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="routeDate">Pickup date</Label>
              <Input id="routeDate" name="routeDate" type="date" required />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="driverName">Driver name (optional)</Label>
              <Input id="driverName" name="driverName" placeholder="Alex" />
            </div>
            <Button type="submit">Build route</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm" id="manual">
        <CardHeader>
          <CardTitle className="text-lg">Create manual route</CardTitle>
          <CardDescription>
            Empty route shell with mode, brand, location, and zone metadata. Add stops manually from the detail page or via
            Order Hub assignment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createManualRouteFormAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manualRouteDate">Route date</Label>
              <Input id="manualRouteDate" name="routeDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input id="title" name="title" placeholder={`${terminology.title} — Friday`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <select
                id="mode"
                name="mode"
                defaultValue={terminology.defaultMode}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ROUTE_MODE_VALUES.map((m) => (
                  <option key={m} value={m}>
                    {ROUTE_MODE_LABEL[m]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneId">Zone</Label>
              <select
                id="zoneId"
                name="zoneId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandId">Brand</Label>
              <select
                id="brandId"
                name="brandId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualDriverName">Driver name (optional)</Label>
              <Input id="manualDriverName" name="driverName" placeholder="Alex" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleName">Vehicle (optional)</Label>
              <Input id="vehicleName" name="vehicleName" placeholder="Van #2" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} placeholder="Loadout requirements, special equipment, gate codes…" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create manual route</Button>
            </div>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Drivers and addresses can be edited later.{" "}
            <Link href="/dashboard/routes/drivers" className="underline underline-offset-4">
              Manage drivers
            </Link>{" "}
            ·{" "}
            <Link href="/dashboard/routes/zones" className="underline underline-offset-4">
              Manage zones
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      {drivers.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardHeader>
            <CardTitle className="text-base">No drivers configured yet</CardTitle>
            <CardDescription>
              You can leave driver name blank for now. Add a driver profile to track contact info, vehicle, and route history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/dashboard/routes/drivers">Add a driver</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
