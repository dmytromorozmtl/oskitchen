import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { ManifestPrintedButton } from "@/components/dashboard/routes/manifest-printed-button";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatWindow } from "@/lib/routes/delivery-windows";
import { formatAddress, mapsSearchUrl } from "@/lib/routes/maps-links";
import { ROUTE_MODE_LABEL } from "@/lib/routes/route-types";
import { ROUTE_STATUS_LABEL, STOP_STATUS_LABEL } from "@/lib/routes/route-status";
import { getRouteForUser } from "@/services/routes/route-service";

export default async function RouteManifestPage({ params }: { params: Promise<{ routeId: string }> }) {
  const { routeId } = await params;
  const { userId } = await getTenantActor();
  const route = await getRouteForUser({ userId }, routeId);
  if (!route) notFound();

  return (
    <div className="space-y-6 print:m-0 print:max-w-full print:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Driver manifest</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {route.title || format(route.routeDate, "EEEE MMM d")}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/routes/${route.id}`}>← Back</Link>
          </Button>
          <ManifestPrintedButton routeId={route.id}>Record & print</ManifestPrintedButton>
        </div>
      </div>

      <section className="rounded-md border border-border/80 bg-background p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-border/60 pb-3">
          <h2 className="text-lg font-semibold">
            {route.title || format(route.routeDate, "EEEE MMM d")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {ROUTE_MODE_LABEL[route.mode]} · {ROUTE_STATUS_LABEL[route.status]} · {route.totalStops} stops
          </p>
          <p className="text-sm text-muted-foreground">
            Driver: {route.driverProfile?.name ?? route.driverName ?? "—"}
            {route.vehicleName ? ` · ${route.vehicleName}` : ""}
            {formatWindow(route.deliveryWindowStart, route.deliveryWindowEnd)
              ? ` · Window ${formatWindow(route.deliveryWindowStart, route.deliveryWindowEnd)}`
              : ""}
          </p>
          {route.notes ? <p className="mt-2 text-sm">{route.notes}</p> : null}
        </header>

        <ol className="mt-4 divide-y divide-border/60">
          {route.stops.map((s, idx) => {
            const address = formatAddress(s.addressJson) ?? "";
            return (
              <li key={s.id} className="grid gap-1 py-3 sm:grid-cols-12">
                <span className="font-mono text-sm sm:col-span-1">#{idx + 1}</span>
                <div className="sm:col-span-7">
                  <p className="font-medium">{s.customerName}</p>
                  {address ? <p className="text-sm text-muted-foreground">{address}</p> : null}
                  {s.deliveryNotes ? <p className="text-sm">Notes: {s.deliveryNotes}</p> : null}
                  {formatWindow(s.deliveryWindowStart, s.deliveryWindowEnd) ? (
                    <p className="text-xs text-muted-foreground">
                      Window {formatWindow(s.deliveryWindowStart, s.deliveryWindowEnd)}
                    </p>
                  ) : null}
                </div>
                <div className="text-sm sm:col-span-2">
                  {s.customerPhone ?? s.customer?.phone ?? ""}
                </div>
                <div className="sm:col-span-2 print:hidden">
                  <a
                    href={mapsSearchUrl(address || s.customerName)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline underline-offset-4"
                  >
                    Maps
                  </a>{" "}
                  · {STOP_STATUS_LABEL[s.status]}
                </div>
              </li>
            );
          })}
        </ol>

        <footer className="mt-6 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          OS Kitchen · Manual stop order. Optimized routing is a future placeholder.
        </footer>
      </section>
    </div>
  );
}
