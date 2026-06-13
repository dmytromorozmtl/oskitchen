import Link from "next/link";
import { Clock, MapPin, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DriverTrackingWidgetModel } from "@/services/delivery/delivery-routing-optimization-p2-45-service";

export function DriverTrackingWidget({ model }: { model: DriverTrackingWidgetModel }) {
  return (
    <Card className="border-border/80 shadow-sm" data-testid="driver-tracking-widget">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-lg">Driver tracking</CardTitle>
          <CardDescription>
            Live progress on today&apos;s routes — Olo parity minimize delivery time with optimized
            stop order.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={model.optimizeHref}>Optimize routes</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {model.routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active routes today — build a route in the planner, then optimize dispatch order.
          </p>
        ) : (
          model.routes.map((route) => (
            <div
              key={route.routeId}
              className="rounded-lg border border-border/70 p-3"
              data-testid="driver-tracking-route-row"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{route.routeTitle}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" aria-hidden />
                    {route.driverName}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full text-xs">
                  {route.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {route.completedStops}/{route.totalStops} delivered
                    {route.failedStops > 0 ? ` · ${route.failedStops} failed` : ""}
                  </span>
                  <span>{route.completionPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${route.completionPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {route.currentStopLabel ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {route.currentStopLabel}
                  </span>
                ) : null}
                {route.pendingStops > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden />~{route.etaMinutes} min remaining
                  </span>
                ) : (
                  <span>Route complete</span>
                )}
              </div>

              <div className="mt-3">
                <Button asChild size="sm" variant="secondary" className="rounded-full">
                  <Link href={route.driverViewHref}>Open driver view</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
