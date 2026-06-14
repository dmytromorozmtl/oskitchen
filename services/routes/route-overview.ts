import { DeliveryRouteStatus, DeliveryStopStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { endOfUtcDay, startOfUtcDay } from "@/lib/routes/route-planning";

export type RouteOverviewKpis = {
  deliveryOrdersToday: number;
  routesPlanned: number;
  stopsReady: number;
  stopsNotPacked: number;
  outForDelivery: number;
  completedStops: number;
  failedStops: number;
  routesNeedingAttention: number;
};

export async function loadRouteOverviewKpis(userId: string, now = new Date()): Promise<RouteOverviewKpis> {
  const dayStart = startOfUtcDay(now);
  const dayEnd = endOfUtcDay(now);
  const [
    deliveryOrdersToday,
    routesPlanned,
    stopsReady,
    stopsNotPacked,
    outForDelivery,
    completedStops,
    failedStops,
    routesNeedingAttention,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        userId,
        fulfillmentType: "DELIVERY",
        pickupDate: { gte: dayStart, lte: dayEnd },
        status: { notIn: ["CANCELLED", "COMPLETED"] },
      },
    }),
    prisma.deliveryRoute.count({
      where: {
        userId,
        routeDate: { gte: dayStart, lte: dayEnd },
        status: { in: [DeliveryRouteStatus.PLANNED, DeliveryRouteStatus.DRAFT, DeliveryRouteStatus.PACKING, DeliveryRouteStatus.READY] },
      },
    }),
    prisma.deliveryStop.count({
      where: {
        route: { userId, routeDate: { gte: dayStart, lte: dayEnd } },
        status: { in: [DeliveryStopStatus.READY, DeliveryStopStatus.PACKED] },
      },
    }),
    prisma.deliveryStop.count({
      where: {
        route: { userId, routeDate: { gte: dayStart, lte: dayEnd } },
        status: DeliveryStopStatus.PENDING,
      },
    }),
    prisma.deliveryStop.count({
      where: {
        route: { userId, routeDate: { gte: dayStart, lte: dayEnd } },
        status: { in: [DeliveryStopStatus.LOADED, DeliveryStopStatus.OUT_FOR_DELIVERY] },
      },
    }),
    prisma.deliveryStop.count({
      where: {
        route: { userId, routeDate: { gte: dayStart, lte: dayEnd } },
        status: DeliveryStopStatus.DELIVERED,
      },
    }),
    prisma.deliveryStop.count({
      where: {
        route: { userId, routeDate: { gte: dayStart, lte: dayEnd } },
        status: DeliveryStopStatus.FAILED,
      },
    }),
    prisma.deliveryRoute.count({
      where: {
        userId,
        status: { in: [DeliveryRouteStatus.PARTIALLY_COMPLETED, DeliveryRouteStatus.FAILED] },
      },
    }),
  ]);

  return {
    deliveryOrdersToday,
    routesPlanned,
    stopsReady,
    stopsNotPacked,
    outForDelivery,
    completedStops,
    failedStops,
    routesNeedingAttention,
  };
}
