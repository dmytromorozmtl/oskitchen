import Link from "next/link";
import { MapPin, Route, Timer, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ROUTE_OPTIMIZATION_P2_114_CAPABILITIES,
  ROUTE_OPTIMIZATION_P2_114_EYEBROW,
  ROUTE_OPTIMIZATION_P2_114_HEADLINE,
  ROUTE_OPTIMIZATION_P2_114_OPERATOR_LINKS,
  ROUTE_OPTIMIZATION_P2_114_SUBLINE,
} from "@/lib/delivery/route-optimization-p2-114-content";
import { ROUTE_OPTIMIZATION_P2_114_TEST_IDS } from "@/lib/delivery/route-optimization-p2-114-policy";
import type { RouteOptimizationSnapshot } from "@/services/delivery/route-optimization-p2-114-service";

const CAPABILITY_ICONS = [MapPin, Truck, Timer] as const;

function methodLabel(method: string): string {
  switch (method) {
    case "google_routes":
      return "Google Routes API";
    case "nearest_neighbor":
      return "Nearest-neighbor heuristic";
    default:
      return "Window priority";
  }
}

/** Blueprint P2-114 — route optimization panel. */
export function RouteOptimizationPanel({ snapshot }: { snapshot: RouteOptimizationSnapshot }) {
  const route = snapshot.primaryRoute;

  return (
    <div className="space-y-8" data-testid={ROUTE_OPTIMIZATION_P2_114_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {ROUTE_OPTIMIZATION_P2_114_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {ROUTE_OPTIMIZATION_P2_114_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {ROUTE_OPTIMIZATION_P2_114_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live dispatch data"} · {snapshot.routeCount}{" "}
          route(s) · {snapshot.pendingDispatchCount} pending dispatch · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Current distance</CardDescription>
            <CardTitle className="text-2xl">{route.currentDistanceKm.toFixed(2)} km</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Optimized distance</CardDescription>
            <CardTitle className="text-2xl">{route.optimizedDistanceKm.toFixed(2)} km</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Distance saved</CardDescription>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
              {route.distanceSavedKm.toFixed(2)} km
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Est. time saved</CardDescription>
            <CardTitle className="text-2xl">{route.estimatedMinutesSaved.toFixed(1)} min</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Route className="h-4 w-4 text-primary" aria-hidden />
            <CardTitle className="text-base">{route.routeTitle}</CardTitle>
            <Badge variant="outline" className="rounded-full">
              {methodLabel(route.method)}
            </Badge>
            <Badge variant={snapshot.googleRoutesConfigured ? "default" : "secondary"} className="rounded-full">
              {snapshot.googleRoutesConfigured ? "Google Routes ready" : "Heuristic mode"}
            </Badge>
          </div>
          <CardDescription>
            Driver: {route.driverLabel} · {route.stopCount} stops · route {route.routeId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1 text-sm text-muted-foreground">
            {route.optimizedStopIds.map((stopId, index) => (
              <li key={stopId}>
                {index + 1}. {stopId}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {ROUTE_OPTIMIZATION_P2_114_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? MapPin;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={ROUTE_OPTIMIZATION_P2_114_TEST_IDS[index + 1]}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                </div>
                <CardDescription>{capability.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={capability.route}>Open {capability.label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {ROUTE_OPTIMIZATION_P2_114_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
