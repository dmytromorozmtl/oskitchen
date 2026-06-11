import Link from "next/link";
import { format } from "date-fns";

import { createDeliveryRouteFromOrdersFormAction } from "@/actions/delivery-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { routeTerminologyForMode } from "@/lib/routes/route-types";
import { ROUTE_STATUS_LABEL } from "@/lib/routes/route-status";
import { loadRouteOverviewKpis } from "@/services/routes/route-overview";
import { listRoutesForUser } from "@/services/routes/route-service";

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

export default async function RoutesOverviewPage() {
  const { userId } = await getTenantActor();
  const kitchen = await findOwnerKitchenSettings(userId, { businessType: true });
  const businessType = kitchen?.businessType ?? null;
  const terminology = routeTerminologyForMode(businessType);

  const [kpis, routes] = await Promise.all([
    loadRouteOverviewKpis(userId),
    listRoutesForUser({ userId }, { take: 12 }),
  ]);

  return (
    <PlanGate userId={userId} feature="delivery_routes" title={terminology.title}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.title}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{terminology.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/routes/planner">Build route</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/routes/planner#manual">Create manual route</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/routes/optimize">Optimize dispatch</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Delivery orders today" value={kpis.deliveryOrdersToday} />
          <Kpi label="Routes planned today" value={kpis.routesPlanned} />
          <Kpi label="Stops ready" value={kpis.stopsReady} />
          <Kpi label="Stops not packed" value={kpis.stopsNotPacked} />
          <Kpi label="Out for delivery" value={kpis.outForDelivery} />
          <Kpi label="Delivered today" value={kpis.completedStops} />
          <Kpi label="Failed today" value={kpis.failedStops} />
          <Kpi
            label="Routes needing attention"
            value={kpis.routesNeedingAttention}
            hint="Partially completed or failed"
          />
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick build by pickup date</CardTitle>
            <CardDescription>
              Pulls open delivery orders sharing the same pickup date. Reorder manually or use{" "}
              <Link href="/dashboard/routes/optimize" className="text-primary underline-offset-2 hover:underline">
                dispatch optimization
              </Link>
              .
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
              <Button type="submit" className="rounded-full sm:w-auto">
                Build route
              </Button>
            </form>
          </CardContent>
        </Card>

        {routes.length === 0 ? (
          <Card className="border-dashed border-border/80">
            <CardHeader>
              <CardTitle className="text-lg">No routes planned yet</CardTitle>
              <CardDescription>
                Build routes from delivery orders, packing-ready orders, catering events, or manual stops.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/dashboard/routes/planner">Build route</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/routes/planner#manual">Create manual route</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {routes.map((r) => (
              <Card key={r.id} className="border-border/80 shadow-sm">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {r.title || format(r.routeDate, "EEEE MMM d")}
                    </CardTitle>
                    <CardDescription>
                      {r.driverProfile?.name || r.driverName ? `${r.driverProfile?.name ?? r.driverName} · ` : null}
                      {r.totalStops} stops · {ROUTE_STATUS_LABEL[r.status]}
                      {r.zone ? ` · ${r.zone.name}` : ""}
                      {r.brand ? ` · ${r.brand.name}` : ""}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full capitalize">
                      {ROUTE_STATUS_LABEL[r.status].toLowerCase()}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/routes/${r.id}`}>Open</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>{r.completedStops}/{r.totalStops} delivered</span>
                  {r.failedStops > 0 ? <span className="text-destructive">{r.failedStops} failed</span> : null}
                  <Link href={`/dashboard/routes/${r.id}/manifest`} className="text-primary underline underline-offset-4">
                    Manifest
                  </Link>
                  <Link href={`/dashboard/routes/${r.id}/driver`} className="text-primary underline underline-offset-4">
                    Driver view
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PlanGate>
  );
}
