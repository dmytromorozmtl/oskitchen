import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { assignDriverFormAction } from "@/actions/delivery-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReorderStopForm, StopStatusForm } from "@/components/dashboard/routes/stop-action-form";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { formatWindow } from "@/lib/routes/delivery-windows";
import {
  callPhoneHref,
  formatAddress,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  mapsSearchUrl,
} from "@/lib/routes/maps-links";
import { ROUTE_MODE_LABEL } from "@/lib/routes/route-types";
import { ROUTE_STATUS_LABEL, STOP_STATUS_LABEL } from "@/lib/routes/route-status";
import { getRouteForUser } from "@/services/routes/route-service";

export default async function RouteDetailPage({ params }: { params: Promise<{ routeId: string }> }) {
  const { routeId } = await params;
  const { userId } = await getTenantActor();
  const route = await getRouteForUser({ userId }, routeId);
  if (!route) notFound();

  const env = getServerEnv();
  const apiKey = env.GOOGLE_MAPS_API_KEY ?? undefined;
  const drivers = await prisma.driverProfile.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const stopQueries = route.stops.map((s) => {
    const addressText = formatAddress(s.addressJson);
    return addressText || s.customerName;
  });
  const combinedDirectionsUrl = mapsDirectionsUrl(stopQueries);
  const firstQuery = stopQueries[0];
  const embedUrl = firstQuery ? mapsEmbedUrl(firstQuery, apiKey) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Route</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {route.title || format(route.routeDate, "EEEE MMM d")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ROUTE_MODE_LABEL[route.mode]} · {ROUTE_STATUS_LABEL[route.status]} ·{" "}
            {route.totalStops} stops · {route.zone?.name ? `Zone ${route.zone.name} · ` : ""}
            {route.brand?.name ? `Brand ${route.brand.name} · ` : ""}
            {route.location?.name ? `Loc ${route.location.name}` : ""}
          </p>
          {formatWindow(route.deliveryWindowStart, route.deliveryWindowEnd) ? (
            <p className="text-sm text-muted-foreground">
              Window {formatWindow(route.deliveryWindowStart, route.deliveryWindowEnd)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={combinedDirectionsUrl} target="_blank" rel="noreferrer">
              Open in Google Maps
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/routes/${route.id}/manifest`}>Driver manifest</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/routes/${route.id}/driver`}>Driver view</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Stops</CardTitle>
            <CardDescription>
              Manual stop order — OS Kitchen does not call optimization APIs. Use the arrow buttons to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {route.stops.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No stops yet. Build a route from delivery orders to populate stops, or add via Order Hub.
              </p>
            ) : (
              <ol className="space-y-3">
                {route.stops.map((s, idx) => {
                  const addressText = formatAddress(s.addressJson) ?? "";
                  const query = addressText || s.customerName;
                  const phone = s.customerPhone ?? s.customer?.phone ?? null;
                  const phoneHref = callPhoneHref(phone);
                  return (
                    <li
                      key={s.id}
                      className="flex flex-col gap-3 rounded-xl border border-border/70 px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            Stop {idx + 1}: {s.customerName}
                          </p>
                          {addressText ? (
                            <p className="text-xs text-muted-foreground">{addressText}</p>
                          ) : (
                            <p className="text-xs text-amber-600">No structured address — Maps link uses customer name only.</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Order{" "}
                            <Link
                              href={`/dashboard/orders`}
                              className="underline underline-offset-4"
                            >
                              {s.orderId.slice(0, 8)}…
                            </Link>
                            {" · "}
                            {STOP_STATUS_LABEL[s.status]}
                            {s.failedReason ? ` · ${s.failedReason}` : ""}
                            {s.packingStatus ? ` · packing ${s.packingStatus}` : ""}
                          </p>
                          {formatWindow(s.deliveryWindowStart, s.deliveryWindowEnd) ? (
                            <p className="text-xs text-muted-foreground">
                              Window {formatWindow(s.deliveryWindowStart, s.deliveryWindowEnd)}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <ReorderStopForm
                            routeId={route.id}
                            stopId={s.id}
                            currentIndex={idx}
                            total={route.stops.length}
                          />
                          <Button asChild size="sm" variant="outline">
                            <a href={mapsSearchUrl(query)} target="_blank" rel="noreferrer">
                              Maps
                            </a>
                          </Button>
                          {phoneHref ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={phoneHref}>Call</a>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <StopStatusForm routeId={route.id} stopId={s.id} currentStatus={s.status} />
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Driver</CardTitle>
              <CardDescription>
                {route.driverProfile?.name ?? route.driverName ?? "Unassigned"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={assignDriverFormAction} className="space-y-3">
                <input type="hidden" name="routeId" value={route.id} />
                <div className="space-y-1">
                  <Label htmlFor="driverProfileId" className="text-xs">
                    Driver profile
                  </Label>
                  <select
                    id="driverProfileId"
                    name="driverProfileId"
                    defaultValue={route.driverProfileId ?? ""}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="">— None —</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="driverName" className="text-xs">
                    Driver name override
                  </Label>
                  <Input
                    id="driverName"
                    name="driverName"
                    defaultValue={route.driverName ?? ""}
                    placeholder="Free-text name"
                  />
                </div>
                <Button type="submit" size="sm">
                  Save driver
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status</CardTitle>
              <CardDescription>Updated automatically from stop progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <Badge variant="outline" className="rounded-full">
                  {ROUTE_STATUS_LABEL[route.status]}
                </Badge>
              </p>
              <p className="text-muted-foreground">
                {route.completedStops}/{route.totalStops} delivered · {route.failedStops} failed
              </p>
              {route.notes ? <p className="text-muted-foreground">{route.notes}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Map preview</CardTitle>
              <CardDescription>
                {embedUrl
                  ? "Embedded preview (first stop)."
                  : apiKey
                    ? "Add an address to a stop to preview a map."
                    : "Set GOOGLE_MAPS_API_KEY to enable embedded maps; external links still work."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {embedUrl ? (
                <iframe
                  title="Route map preview"
                  className="aspect-video w-full rounded-md border border-border/70"
                  src={embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <Button asChild size="sm" variant="outline">
                  <a href={combinedDirectionsUrl} target="_blank" rel="noreferrer">
                    Open in Google Maps
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity</CardTitle>
              <CardDescription>Last 50 events.</CardDescription>
            </CardHeader>
            <CardContent>
              {route.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {route.events.map((e) => (
                    <li key={e.id}>
                      <span className="font-mono">{e.createdAt.toISOString().slice(0, 16)}</span>{" "}
                      <span className="font-medium text-foreground">{e.eventType}</span>
                      {e.performedBy ? ` · ${e.performedBy}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
