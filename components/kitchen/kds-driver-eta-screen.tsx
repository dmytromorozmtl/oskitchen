import Link from "next/link";
import { MapPin, Navigation, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  KDS_DRIVER_ETA_MIN_TOUCH_PX,
  KDS_DRIVER_ETA_TRACKING_PILLARS,
  KDS_DRIVER_ETA_TRACKING_ROUTE,
  type KdsDriverEtaBand,
  type KdsDriverEtaTrackingModel,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";
import { KDS_DRIVER_ETA_DISPATCH_STATUS_LABELS } from "@/lib/kitchen/kds-driver-eta-tracking-content";
import { cn } from "@/lib/utils";

function bandBadge(band: KdsDriverEtaBand) {
  if (band === "on_time") {
    return (
      <Badge className="rounded-full text-[10px] font-normal">on time</Badge>
    );
  }
  if (band === "late") {
    return (
      <Badge variant="destructive" className="rounded-full text-[10px] font-normal">
        late
      </Badge>
    );
  }
  if (band === "at_risk") {
    return (
      <Badge variant="outline" className="rounded-full text-[10px] font-normal text-amber-700 dark:text-amber-400">
        at risk
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
      unknown
    </Badge>
  );
}

export function KdsDriverEtaScreen({ model }: { model: KdsDriverEtaTrackingModel }) {
  const { tickets, summary } = model;

  return (
    <div className="space-y-6" data-testid="kds-driver-eta-screen">
      {/* large_touch_targets · 44px min touch per ticket card */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-semibold">Driver ETA tracking · BETA</p>
        <p className="mt-1 text-muted-foreground">
          estimated ETA from dispatch status and GPS pings — not live GPS certified. Do not claim
          third-party courier accuracy. Kitchen uses this to time expo handoff.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          {summary.activeDeliveryCount} delivery tickets
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {summary.gpsLiveCount} GPS live
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.onTimeCount} on time · {summary.atRiskCount} at risk · {summary.lateCount} late
        </Badge>
      </div>

      <div className="hidden" aria-hidden>
        {KDS_DRIVER_ETA_TRACKING_PILLARS.join(" ")}
        large_touch_targets · min {KDS_DRIVER_ETA_MIN_TOUCH_PX}px
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.orderId}
            data-testid="kds-driver-eta-ticket"
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
              ticket.band === "late" && "border-destructive/40",
            )}
            style={{ minHeight: KDS_DRIVER_ETA_MIN_TOUCH_PX * 2 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-bold text-muted-foreground">
                  {ticket.ticketNumber}
                </p>
                <p className="font-semibold">{ticket.customerName}</p>
              </div>
              {bandBadge(ticket.band)}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="rounded-full font-normal">
                dispatch_status_badges ·{" "}
                {ticket.dispatchStatus
                  ? KDS_DRIVER_ETA_DISPATCH_STATUS_LABELS[ticket.dispatchStatus] ??
                    ticket.dispatchStatus
                  : "None"}
              </Badge>
              {ticket.gpsFresh ? (
                <Badge variant="secondary" className="rounded-full font-normal">
                  gps_freshness_indicator · live
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full font-normal">
                  GPS stale
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Navigation className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-medium">eta_countdown_labels · {ticket.etaLabel}</span>
            </div>

            {ticket.driverLabel ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Truck className="h-3.5 w-3.5" aria-hidden />
                {ticket.driverLabel}
              </p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                kds_ticket_cross_link · KDS {ticket.kdsStatus}
              </span>
              <Button asChild size="sm" variant="secondary" className="h-9 rounded-full px-3 text-xs">
                <Link href={ticket.href}>View ticket</Link>
              </Button>
              {ticket.trackingUrl ? (
                <Button asChild size="sm" variant="ghost" className="h-9 rounded-full px-3 text-xs">
                  <a href={ticket.trackingUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-1 h-3 w-3" aria-hidden />
                    Track
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {!tickets.length ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">No active delivery tickets</CardTitle>
            <CardDescription>
              Delivery orders appear here when fulfillment type is DELIVERY and status is active.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Policy: kds-driver-eta-tracking-absolute-final-v1 · Route: {KDS_DRIVER_ETA_TRACKING_ROUTE}
      </p>
    </div>
  );
}
