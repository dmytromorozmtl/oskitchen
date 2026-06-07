import { format } from "date-fns";

import {
  buildRouteOptimization,
  DELIVERY_DISPATCH_OPTIMIZATION_POLICY_ID,
  optimizeDispatchStopOrder,
  parseStopCoordinates,
  scoreDispatchPriority,
  type DispatchRouteOptimization,
  type DispatchStopCandidate,
} from "@/lib/delivery/delivery-dispatch-optimization-policy";
import { startOfUtcDay } from "@/lib/routes/route-planning";
import { prisma } from "@/lib/prisma";
import {
  isGoogleRoutesConfigured,
  optimizeDeliveryRoute,
  type RouteStopInput,
} from "@/services/delivery/route-optimization-service";

export type DeliveryDispatchOptimizationModel = {
  policyId: typeof DELIVERY_DISPATCH_OPTIMIZATION_POLICY_ID;
  googleRoutesConfigured: boolean;
  pendingDispatchCount: number;
  routes: DispatchRouteOptimization[];
};

function toCandidate(
  stop: {
    id: string;
    orderId: string;
    sequence: number;
    customerName: string;
    addressJson: unknown;
    latitude: unknown;
    longitude: unknown;
    deliveryWindowEnd: Date | null;
    order?: { createdAt: Date } | null;
  },
): DispatchStopCandidate {
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
    priorityScore: scoreDispatchPriority({
      windowEnd: stop.deliveryWindowEnd,
      sequence: stop.sequence,
      createdAt: stop.order?.createdAt ?? null,
    }),
  };
}

async function optimizeRouteStops(
  routeId: string,
  routeTitle: string,
  candidates: DispatchStopCandidate[],
): Promise<DispatchRouteOptimization | null> {
  if (candidates.length < 2) return null;

  const googleConfigured = isGoogleRoutesConfigured();
  let optimizedStopIds: string[];
  let method: DispatchRouteOptimization["method"] = "nearest_neighbor";

  if (googleConfigured) {
    const routeInputs: RouteStopInput[] = candidates.map((s) => ({
      orderId: s.orderId,
      address: s.address || s.customerName,
      lat: s.lat ?? undefined,
      lng: s.lng ?? undefined,
    }));

    const googleResult = await optimizeDeliveryRoute(routeInputs);
    if (!("error" in googleResult)) {
      optimizedStopIds = googleResult.stops.map((s) => {
        const match = candidates.find((c) => c.orderId === s.orderId);
        return match?.stopId ?? candidates[0]!.stopId;
      });
      method = "google_routes";
    } else {
      const fallback = optimizeDispatchStopOrder(candidates);
      optimizedStopIds = fallback.ordered.map((s) => s.stopId);
      method = fallback.method;
    }
  } else {
    const fallback = optimizeDispatchStopOrder(candidates);
    optimizedStopIds = fallback.ordered.map((s) => s.stopId);
    method = fallback.method;
  }

  const currentIds = candidates.slice().sort((a, b) => a.sequence - b.sequence).map((s) => s.stopId);
  if (currentIds.join(",") === optimizedStopIds.join(",")) {
    return buildRouteOptimization({
      routeId,
      routeTitle,
      stops: candidates,
      optimizedStopIds,
      method,
      googleConfigured,
    });
  }

  return buildRouteOptimization({
    routeId,
    routeTitle,
    stops: candidates,
    optimizedStopIds,
    method,
    googleConfigured,
  });
}

export async function loadDeliveryDispatchOptimizationModel(
  userId: string,
  routeId?: string | null,
): Promise<DeliveryDispatchOptimizationModel> {
  const today = startOfUtcDay(new Date());

  const [pendingDispatchCount, routes] = await Promise.all([
    prisma.deliveryDispatch.count({
      where: {
        userId,
        status: { in: ["QUOTE", "SCHEDULED", "PICKUP"] },
      },
    }),
    prisma.deliveryRoute.findMany({
      where: {
        userId,
        ...(routeId ? { id: routeId } : { routeDate: { gte: today } }),
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: [{ routeDate: "asc" }, { createdAt: "asc" }],
      take: routeId ? 1 : 20,
      include: {
        stops: {
          orderBy: { sequence: "asc" },
          include: { order: { select: { createdAt: true } } },
        },
      },
    }),
  ]);

  const optimizations: DispatchRouteOptimization[] = [];

  for (const route of routes) {
    if (route.stops.length < 2) continue;
    const candidates = route.stops.map((stop) => toCandidate(stop));
    const title = route.title?.trim() || format(route.routeDate, "EEE MMM d");
    const result = await optimizeRouteStops(route.id, title, candidates);
    if (result) optimizations.push(result);
  }

  return {
    policyId: DELIVERY_DISPATCH_OPTIMIZATION_POLICY_ID,
    googleRoutesConfigured: isGoogleRoutesConfigured(),
    pendingDispatchCount,
    routes: optimizations,
  };
}
