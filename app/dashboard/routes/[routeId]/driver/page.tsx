import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { StopStatusForm } from "@/components/dashboard/routes/stop-action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatWindow } from "@/lib/routes/delivery-windows";
import { callPhoneHref, formatAddress, mapsSearchUrl } from "@/lib/routes/maps-links";
import { STOP_STATUS_LABEL } from "@/lib/routes/route-status";
import { getRouteForUser } from "@/services/routes/route-service";

export default async function RouteDriverViewPage({ params }: { params: Promise<{ routeId: string }> }) {
  const { routeId } = await params;
  const { userId } = await getTenantActor();
  const route = await getRouteForUser({ userId }, routeId);
  if (!route) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Driver view</p>
          <h1 className="text-xl font-semibold tracking-tight">
            {route.title || format(route.routeDate, "EEEE MMM d")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {route.driverProfile?.name ?? route.driverName ?? "Unassigned"} · {route.totalStops} stops
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/routes/${route.id}`}>Back</Link>
        </Button>
      </div>

      {route.stops.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No stops</CardTitle>
            <CardDescription>This route has no stops yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ol className="space-y-3">
          {route.stops.map((s, idx) => {
            const address = formatAddress(s.addressJson) ?? "";
            const phone = s.customerPhone ?? s.customer?.phone ?? null;
            const phoneHref = callPhoneHref(phone);
            return (
              <li key={s.id}>
                <Card className="border-border/80">
                  <CardHeader className="space-y-1 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Stop {idx + 1}: {s.customerName}
                      </CardTitle>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {STOP_STATUS_LABEL[s.status]}
                      </Badge>
                    </div>
                    {address ? <CardDescription>{address}</CardDescription> : null}
                    {formatWindow(s.deliveryWindowStart, s.deliveryWindowEnd) ? (
                      <CardDescription>
                        Window {formatWindow(s.deliveryWindowStart, s.deliveryWindowEnd)}
                      </CardDescription>
                    ) : null}
                    {s.deliveryNotes ? <CardDescription>Notes: {s.deliveryNotes}</CardDescription> : null}
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={mapsSearchUrl(address || s.customerName)} target="_blank" rel="noreferrer">
                        Maps
                      </a>
                    </Button>
                    {phoneHref ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={phoneHref}>Call</a>
                      </Button>
                    ) : null}
                    <StopStatusForm routeId={route.id} stopId={s.id} currentStatus={s.status} />
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
