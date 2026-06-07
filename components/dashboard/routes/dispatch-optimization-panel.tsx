import Link from "next/link";
import { Route, Zap } from "lucide-react";

import { applyDispatchOptimizationFormAction } from "@/actions/delivery-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DeliveryDispatchOptimizationModel } from "@/services/delivery/delivery-dispatch-optimization-service";

function methodLabel(method: string): string {
  switch (method) {
    case "google_routes":
      return "Google Routes API";
    case "nearest_neighbor":
      return "Nearest-neighbor heuristic";
    default:
      return "Delivery window priority";
  }
}

export function DispatchOptimizationPanel({ model }: { model: DeliveryDispatchOptimizationModel }) {
  const { routes, pendingDispatchCount, googleRoutesConfigured } = model;

  return (
    <div className="space-y-6" data-testid="dispatch-optimization-panel">
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          {routes.length} route(s) optimizable
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {pendingDispatchCount} pending dispatch(es)
        </Badge>
        <Badge variant={googleRoutesConfigured ? "default" : "outline"} className="rounded-full">
          {googleRoutesConfigured ? "Google Routes ready" : "Heuristic mode (no API key)"}
        </Badge>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">No routes to optimize</CardTitle>
            <CardDescription>
              Build a delivery route with at least two stops from the planner, then return here to
              reorder stops by distance and delivery window priority.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/routes/planner">Open route planner</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        routes.map((route) => {
          const changed = route.currentStopIds.join(",") !== route.optimizedStopIds.join(",");
          return (
            <Card key={route.routeId} data-testid="dispatch-optimization-route">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{route.routeTitle}</CardTitle>
                    <CardDescription>
                      {route.stopCount} stops · {methodLabel(route.method)}
                      {route.distanceSavedKm > 0
                        ? ` · ~${route.distanceSavedKm.toFixed(1)} km saved vs current order`
                        : changed
                          ? " · improved stop sequence"
                          : " · already optimal for available data"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link href={`/dashboard/routes/${route.routeId}`}>View route</Link>
                    </Button>
                    {changed ? (
                      <form action={applyDispatchOptimizationFormAction}>
                        <input type="hidden" name="routeId" value={route.routeId} />
                        {route.optimizedStopIds.map((id) => (
                          <input key={id} type="hidden" name="stopIds" value={id} />
                        ))}
                        <Button type="submit" size="sm" className="rounded-full">
                          <Zap className="mr-1 h-3.5 w-3.5" aria-hidden />
                          Apply optimized order
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Current order
                  </p>
                  <ol className="space-y-1 text-sm">
                    {route.currentStopIds.map((id, index) => (
                      <li key={id} className="flex items-center gap-2">
                        <Route className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                        <span>
                          {index + 1}. Stop {id.slice(0, 8)}…
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Est. distance: {route.currentDistanceKm.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Optimized order
                  </p>
                  <ol className="space-y-1 text-sm">
                    {route.optimizedStopIds.map((id, index) => (
                      <li
                        key={id}
                        className={`flex items-center gap-2 ${route.currentStopIds[index] !== id ? "font-medium text-primary" : ""}`}
                      >
                        <Zap className="h-3.5 w-3.5" aria-hidden />
                        <span>
                          {index + 1}. Stop {id.slice(0, 8)}…
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Est. distance: {route.optimizedDistanceKm.toFixed(1)} km
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <p className="text-xs text-muted-foreground">
        Olo-parity dispatch optimization ranks stops by delivery window urgency and minimizes drive
        distance when coordinates exist. Google Routes API used when GOOGLE_ROUTES_API_KEY is set —
        otherwise nearest-neighbor heuristic applies.
      </p>
    </div>
  );
}
