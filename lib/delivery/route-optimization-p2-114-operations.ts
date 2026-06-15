/**
 * Pure helpers for route optimization engine (Blueprint P2-114).
 */

import {
  buildRouteOptimization,
  optimizeDispatchStopOrder,
  type DispatchStopCandidate,
} from "@/lib/delivery/delivery-dispatch-optimization-policy";
import { ROUTE_OPTIMIZATION_P2_114_POLICY_ID } from "@/lib/delivery/route-optimization-p2-114-policy";

export type RouteOptimizationStop = {
  stopId: string;
  orderId: string;
  customerName: string;
  lat: number;
  lng: number;
  sequence: number;
};

export type RouteOptimizationReport = {
  policyId: typeof ROUTE_OPTIMIZATION_P2_114_POLICY_ID;
  routeId: string;
  routeTitle: string;
  stopCount: number;
  method: "nearest_neighbor" | "window_priority" | "google_routes";
  googleConfigured: boolean;
  currentDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  estimatedMinutesSaved: number;
  optimizedStopIds: string[];
  driverLabel: string;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Typical urban delivery speed for directional ETA — not certified. */
export function estimateMinutesFromDistanceKm(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  const avgKmh = 28;
  return round2((distanceKm / avgKmh) * 60);
}

export function toDispatchCandidates(stops: RouteOptimizationStop[]): DispatchStopCandidate[] {
  return stops.map((stop) => ({
    stopId: stop.stopId,
    orderId: stop.orderId,
    customerName: stop.customerName,
    sequence: stop.sequence,
    lat: stop.lat,
    lng: stop.lng,
    address: stop.customerName,
    windowEnd: null,
    priorityScore: 100 - stop.sequence,
  }));
}

export function optimizeRouteStops(
  stops: RouteOptimizationStop[],
  origin?: { lat: number; lng: number },
): { ordered: RouteOptimizationStop[]; method: "nearest_neighbor" | "window_priority" } {
  const candidates = toDispatchCandidates(stops);
  const result = optimizeDispatchStopOrder(candidates, origin ?? null);
  const byId = new Map(stops.map((s) => [s.stopId, s]));
  const ordered = result.ordered
    .map((c) => byId.get(c.stopId))
    .filter(Boolean) as RouteOptimizationStop[];
  return { ordered, method: result.method };
}

export function buildRouteOptimizationReport(input: {
  routeId: string;
  routeTitle: string;
  stops: RouteOptimizationStop[];
  googleConfigured?: boolean;
  driverLabel?: string;
  origin?: { lat: number; lng: number };
}): RouteOptimizationReport {
  const { ordered, method } = optimizeRouteStops(input.stops, input.origin);
  const optimizedStopIds = ordered.map((s) => s.stopId);

  const optimization = buildRouteOptimization({
    routeId: input.routeId,
    routeTitle: input.routeTitle,
    stops: toDispatchCandidates(input.stops),
    optimizedStopIds,
    method,
    googleConfigured: input.googleConfigured ?? false,
  });

  const currentMinutes = estimateMinutesFromDistanceKm(optimization.currentDistanceKm);
  const optimizedMinutes = estimateMinutesFromDistanceKm(optimization.optimizedDistanceKm);
  const estimatedMinutesSaved = round2(Math.max(0, currentMinutes - optimizedMinutes));

  return {
    policyId: ROUTE_OPTIMIZATION_P2_114_POLICY_ID,
    routeId: input.routeId,
    routeTitle: input.routeTitle,
    stopCount: input.stops.length,
    method,
    googleConfigured: input.googleConfigured ?? false,
    currentDistanceKm: optimization.currentDistanceKm,
    optimizedDistanceKm: optimization.optimizedDistanceKm,
    distanceSavedKm: optimization.distanceSavedKm,
    estimatedMinutesSaved,
    optimizedStopIds,
    driverLabel: input.driverLabel ?? "Unassigned driver",
  };
}

export const ROUTE_OPTIMIZATION_DEMO_STOPS: RouteOptimizationStop[] = [
  { stopId: "stop-1", orderId: "ord-101", customerName: "Kitchen hub", lat: 40.758, lng: -73.9855, sequence: 1 },
  { stopId: "stop-2", orderId: "ord-102", customerName: "Midtown drop", lat: 40.7549, lng: -73.984, sequence: 2 },
  { stopId: "stop-3", orderId: "ord-103", customerName: "Upper east", lat: 40.7736, lng: -73.9566, sequence: 3 },
  { stopId: "stop-4", orderId: "ord-104", customerName: "Chelsea", lat: 40.7465, lng: -74.0014, sequence: 4 },
  { stopId: "stop-5", orderId: "ord-105", customerName: "West village", lat: 40.7336, lng: -74.0027, sequence: 5 },
];

export function buildRouteOptimizationDemoReport(): RouteOptimizationReport {
  return buildRouteOptimizationReport({
    routeId: "demo-route-001",
    routeTitle: "Lunch rush — demo route",
    stops: ROUTE_OPTIMIZATION_DEMO_STOPS,
    googleConfigured: false,
    driverLabel: "Driver Alex (demo)",
    origin: { lat: 40.758, lng: -73.9855 },
  });
}

export function hasRouteSavings(report: RouteOptimizationReport): boolean {
  return report.distanceSavedKm > 0 || report.estimatedMinutesSaved > 0;
}
