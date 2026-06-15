/**
 * Absolute Final Task 43 — delivery dispatch optimization (Olo parity).
 */

import { formatAddress } from "@/lib/routes/maps-links";

export const DELIVERY_DISPATCH_OPTIMIZATION_POLICY_ID =
  "delivery-dispatch-optimization-absolute-final-v1" as const;

export const DELIVERY_DISPATCH_OPTIMIZATION_ROUTE = "/dashboard/routes/optimize" as const;

export const DELIVERY_DISPATCH_OPTIMIZATION_PANEL_PATH =
  "components/dashboard/routes/dispatch-optimization-panel.tsx" as const;

export const DELIVERY_DISPATCH_OPTIMIZATION_SERVICE_PATH =
  "services/delivery/delivery-dispatch-optimization-service.ts" as const;

export const DELIVERY_DISPATCH_OPTIMIZATION_CI_SCRIPTS = [
  "test:ci:delivery-dispatch-optimization",
] as const;

export type DispatchStopCandidate = {
  stopId: string;
  orderId: string;
  customerName: string;
  sequence: number;
  lat: number | null;
  lng: number | null;
  address: string;
  windowEnd: Date | null;
  priorityScore: number;
};

export type DispatchRouteOptimization = {
  routeId: string;
  routeTitle: string;
  stopCount: number;
  currentStopIds: string[];
  optimizedStopIds: string[];
  currentDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  method: "nearest_neighbor" | "window_priority" | "google_routes";
  googleConfigured: boolean;
};

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function parseStopCoordinates(input: {
  addressJson: unknown;
  latitude?: unknown;
  longitude?: unknown;
}): { lat: number | null; lng: number | null; address: string } {
  const latNum = input.latitude != null ? Number(input.latitude) : NaN;
  const lngNum = input.longitude != null ? Number(input.longitude) : NaN;
  if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
    return { lat: latNum, lng: lngNum, address: formatAddress(input.addressJson) ?? "" };
  }

  if (input.addressJson && typeof input.addressJson === "object") {
    const raw = input.addressJson as Record<string, unknown>;
    const lat = raw.lat ?? raw.latitude;
    const lng = raw.lng ?? raw.longitude;
    if (typeof lat === "number" && typeof lng === "number") {
      return { lat, lng, address: formatAddress(input.addressJson) ?? "" };
    }
  }

  return { lat: null, lng: null, address: formatAddress(input.addressJson) ?? "" };
}

/** Olo-style priority: tighter window + older orders rank higher. */
export function scoreDispatchPriority(input: {
  windowEnd: Date | null;
  sequence: number;
  createdAt?: Date | null;
}): number {
  let score = 100 - input.sequence;
  if (input.windowEnd) {
    const minutes = (input.windowEnd.getTime() - Date.now()) / 60_000;
    if (minutes <= 30) score += 50;
    else if (minutes <= 60) score += 30;
    else if (minutes <= 120) score += 15;
  }
  if (input.createdAt) {
    const ageHours = (Date.now() - input.createdAt.getTime()) / 3_600_000;
    score += Math.min(20, ageHours * 2);
  }
  return Math.round(score * 10) / 10;
}

export function totalRouteDistanceKm(stops: DispatchStopCandidate[]): number {
  const geo = stops.filter((s) => s.lat != null && s.lng != null) as Array<
    DispatchStopCandidate & { lat: number; lng: number }
  >;
  if (geo.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < geo.length; i++) {
    total += haversineKm(
      { lat: geo[i - 1]!.lat, lng: geo[i - 1]!.lng },
      { lat: geo[i]!.lat, lng: geo[i]!.lng },
    );
  }
  return Math.round(total * 100) / 100;
}

/** Nearest-neighbor TSP heuristic when lat/lng available; else window priority. */
export function optimizeDispatchStopOrder(
  stops: DispatchStopCandidate[],
  origin?: { lat: number; lng: number } | null,
): { ordered: DispatchStopCandidate[]; method: "nearest_neighbor" | "window_priority" } {
  if (stops.length <= 1) {
    return { ordered: stops, method: "window_priority" };
  }

  const geoStops = stops.filter((s) => s.lat != null && s.lng != null) as Array<
    DispatchStopCandidate & { lat: number; lng: number }
  >;

  if (geoStops.length < 2) {
    const ordered = stops.slice().sort((a, b) => {
      const aEnd = a.windowEnd?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bEnd = b.windowEnd?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (aEnd !== bEnd) return aEnd - bEnd;
      return b.priorityScore - a.priorityScore;
    });
    return { ordered, method: "window_priority" };
  }

  const remaining = new Map(geoStops.map((s) => [s.stopId, s]));
  const ordered: DispatchStopCandidate[] = [];
  let current = origin ?? { lat: geoStops[0]!.lat, lng: geoStops[0]!.lng };

  while (remaining.size > 0) {
    let nearestId: string | null = null;
    let nearestDist = Number.POSITIVE_INFINITY;

    for (const [id, stop] of remaining) {
      const dist = haversineKm(current, { lat: stop.lat, lng: stop.lng });
      const adjusted = dist - stop.priorityScore * 0.001;
      if (adjusted < nearestDist) {
        nearestDist = adjusted;
        nearestId = id;
      }
    }

    if (!nearestId) break;
    const next = remaining.get(nearestId)!;
    ordered.push(next);
    current = { lat: next.lat, lng: next.lng };
    remaining.delete(nearestId);
  }

  for (const stop of stops) {
    if (!ordered.some((o) => o.stopId === stop.stopId)) ordered.push(stop);
  }

  return { ordered, method: "nearest_neighbor" };
}

export function buildRouteOptimization(input: {
  routeId: string;
  routeTitle: string;
  stops: DispatchStopCandidate[];
  optimizedStopIds: string[];
  method: DispatchRouteOptimization["method"];
  googleConfigured: boolean;
}): DispatchRouteOptimization {
  const byId = new Map(input.stops.map((s) => [s.stopId, s]));
  const currentOrder = input.stops.slice().sort((a, b) => a.sequence - b.sequence);
  const optimizedOrder = input.optimizedStopIds
    .map((id) => byId.get(id))
    .filter(Boolean) as DispatchStopCandidate[];

  const currentDistanceKm = totalRouteDistanceKm(currentOrder);
  const optimizedDistanceKm = totalRouteDistanceKm(optimizedOrder);

  return {
    routeId: input.routeId,
    routeTitle: input.routeTitle,
    stopCount: input.stops.length,
    currentStopIds: currentOrder.map((s) => s.stopId),
    optimizedStopIds: input.optimizedStopIds,
    currentDistanceKm,
    optimizedDistanceKm,
    distanceSavedKm: Math.max(0, Math.round((currentDistanceKm - optimizedDistanceKm) * 100) / 100),
    method: input.method,
    googleConfigured: input.googleConfigured,
  };
}
