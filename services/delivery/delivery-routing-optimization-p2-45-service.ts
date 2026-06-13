import { format } from "date-fns";

import {
  parseStopCoordinates,
  type DispatchStopCandidate,
} from "@/lib/delivery/delivery-dispatch-optimization-policy";
import {
  computeRouteCompletionPct,
  estimateDeliveryMinutesRemaining,
  estimateRemainingDistanceKm,
  pendingStopCount,
} from "@/lib/delivery/delivery-routing-optimization-p2-45-measurement";
import { DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID } from "@/lib/delivery/delivery-routing-optimization-p2-45-policy";
import { prisma } from "@/lib/prisma";
import { endOfUtcDay, startOfUtcDay } from "@/lib/routes/route-planning";

export type DriverTrackingRouteRow = {
  routeId: string;
  routeTitle: string;
  driverName: string;
  status: string;
  totalStops: number;
  completedStops: number;
  failedStops: number;
  pendingStops: number;
  completionPct: number;
  currentStopLabel: string | null;
  etaMinutes: number;
  driverViewHref: string;
};

export type DriverTrackingWidgetModel = {
  policyId: typeof DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID;
  activeRouteCount: number;
  routes: DriverTrackingRouteRow[];
  optimizeHref: string;
};

function toCandidate(stop: {
  id: string;
  orderId: string;
  sequence: number;
  customerName: string;
  addressJson: unknown;
  latitude: unknown;
  longitude: unknown;
  deliveryWindowEnd: Date | null;
  status: string;
}): DispatchStopCandidate {
  const { lat, lng, address } = parseStopCoordinates({
    addressJson: stop.addressJson,
    latitude: stop.latitude,
    longitude: stop.longitude,
  });

  return {
    stopId: stop.id,
    orderId: stop.orderId,
    customerName: stop.customerName,
    sequence: stop.sequence,
    lat,
    lng,
    address,
    windowEnd: stop.deliveryWindowEnd,
    priorityScore: stop.sequence,
  };
}

export async function loadDriverTrackingWidgetModel(
  userId: string,
  now = new Date(),
): Promise<DriverTrackingWidgetModel> {
  const dayStart = startOfUtcDay(now);
  const dayEnd = endOfUtcDay(now);

  const routes = await prisma.deliveryRoute.findMany({
    where: {
      userId,
      routeDate: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      totalStops: { gt: 0 },
    },
    orderBy: [{ routeDate: "asc" }, { createdAt: "asc" }],
    take: 12,
    include: {
      driverProfile: { select: { name: true } },
      stops: { orderBy: { sequence: "asc" } },
    },
  });

  const rows: DriverTrackingRouteRow[] = routes.map((route) => {
    const completedIds = new Set(
      route.stops.filter((s) => s.status === "DELIVERED").map((s) => s.id),
    );
    const completed = completedIds.size;
    const failed = route.stops.filter((s) => s.status === "FAILED").length;
    const pending = pendingStopCount(route.stops.length, completed, failed);
    const candidates = route.stops.map((s) => toCandidate(s));
    const remainingKm =
      route.estimatedDistance != null && pending === 0
        ? 0
        : estimateRemainingDistanceKm(candidates, completedIds);
    const etaMinutes = estimateDeliveryMinutesRemaining({
      distanceKm: remainingKm,
      pendingStops: pending,
    });

    const currentStop =
      route.stops.find(
        (s) =>
          s.status !== "DELIVERED" &&
          s.status !== "FAILED" &&
          s.status !== "SKIPPED" &&
          s.status !== "RETURNED",
      ) ?? null;

    return {
      routeId: route.id,
      routeTitle: route.title?.trim() || format(route.routeDate, "EEE MMM d"),
      driverName: route.driverProfile?.name ?? route.driverName ?? "Unassigned",
      status: route.status,
      totalStops: route.stops.length,
      completedStops: completed,
      failedStops: failed,
      pendingStops: pending,
      completionPct: computeRouteCompletionPct(completed, route.stops.length),
      currentStopLabel: currentStop ? `Stop ${currentStop.sequence + 1}: ${currentStop.customerName}` : null,
      etaMinutes,
      driverViewHref: `/dashboard/routes/${route.id}/driver`,
    };
  });

  return {
    policyId: DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID,
    activeRouteCount: rows.length,
    routes: rows,
    optimizeHref: "/dashboard/routes/optimize",
  };
}
