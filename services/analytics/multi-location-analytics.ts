import type { FulfillmentType, LocationStatus, LocationType, OrderStatus, Prisma } from "@prisma/client";

import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { orderContributesToRevenue } from "@/lib/analytics/revenue-metrics";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { prisma } from "@/lib/prisma";
import { locationListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";

export type LocationAnalyticsRow = {
  locationId: string;
  locationName: string;
  status: LocationStatus;
  type: LocationType;
  orders: number;
  revenue: number;
  avgOrderValue: number | null;
  pickupOrders: number;
  deliveryOrders: number;
  routes: number;
  tasks: number;
  revenueShare: number | null;
};

export type MultiLocationAnalyticsSnapshot = {
  rangeLabel: string;
  totalLocations: number;
  activeLocations: number;
  totalOrders: number;
  totalRevenue: number;
  unassignedOrders: number;
  unassignedRevenue: number;
  locations: LocationAnalyticsRow[];
  topLocation: LocationAnalyticsRow | null;
  dailyTrend: Array<{ date: string; orders: number; revenue: number }>;
};

type LocationMeta = {
  id: string;
  name: string;
  status: LocationStatus;
  type: LocationType;
};

type OrderRow = {
  locationId: string | null;
  status: OrderStatus;
  total: Prisma.Decimal | null;
  fulfillmentType: FulfillmentType | null;
  createdAt: Date;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatRangeLabel(from: Date, to: Date): string {
  return `${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}`;
}

export function buildMultiLocationAnalyticsSnapshot(input: {
  locations: LocationMeta[];
  orders: OrderRow[];
  routesByLocation: Map<string | null, number>;
  tasksByLocation: Map<string | null, number>;
  from: Date;
  to: Date;
}): MultiLocationAnalyticsSnapshot {
  const buckets = new Map<
    string,
    {
      orders: number;
      revenue: number;
      pickupOrders: number;
      deliveryOrders: number;
    }
  >();

  for (const location of input.locations) {
    buckets.set(location.id, {
      orders: 0,
      revenue: 0,
      pickupOrders: 0,
      deliveryOrders: 0,
    });
  }

  const unassigned = { orders: 0, revenue: 0, pickupOrders: 0, deliveryOrders: 0 };
  const dailyMap = new Map<string, { orders: number; revenue: number }>();

  for (const order of input.orders) {
    if (!orderContributesToRevenue(order.status)) continue;
    const total = decimalToNumber(order.total);
    const day = order.createdAt.toISOString().slice(0, 10);
    const daily = dailyMap.get(day) ?? { orders: 0, revenue: 0 };
    daily.orders += 1;
    daily.revenue = round2(daily.revenue + total);
    dailyMap.set(day, daily);

    if (!order.locationId) {
      unassigned.orders += 1;
      unassigned.revenue = round2(unassigned.revenue + total);
      if (order.fulfillmentType === "PICKUP") unassigned.pickupOrders += 1;
      if (order.fulfillmentType === "DELIVERY") unassigned.deliveryOrders += 1;
      continue;
    }

    const bucket = buckets.get(order.locationId);
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.revenue = round2(bucket.revenue + total);
    if (order.fulfillmentType === "PICKUP") bucket.pickupOrders += 1;
    if (order.fulfillmentType === "DELIVERY") bucket.deliveryOrders += 1;
  }

  const totalRevenue = round2(
    [...buckets.values()].reduce((sum, bucket) => sum + bucket.revenue, 0) + unassigned.revenue,
  );
  const totalOrders =
    [...buckets.values()].reduce((sum, bucket) => sum + bucket.orders, 0) + unassigned.orders;

  const locations: LocationAnalyticsRow[] = input.locations.map((location) => {
    const bucket = buckets.get(location.id)!;
    return {
      locationId: location.id,
      locationName: location.name,
      status: location.status,
      type: location.type,
      orders: bucket.orders,
      revenue: bucket.revenue,
      avgOrderValue: bucket.orders > 0 ? round2(bucket.revenue / bucket.orders) : null,
      pickupOrders: bucket.pickupOrders,
      deliveryOrders: bucket.deliveryOrders,
      routes: input.routesByLocation.get(location.id) ?? 0,
      tasks: input.tasksByLocation.get(location.id) ?? 0,
      revenueShare:
        totalRevenue > 0 ? round2((bucket.revenue / totalRevenue) * 100) : null,
    };
  });

  const topLocation =
    locations.length === 0
      ? null
      : [...locations].sort((a, b) => b.revenue - a.revenue || b.orders - a.orders)[0] ?? null;

  const dailyTrend = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  return {
    rangeLabel: formatRangeLabel(input.from, input.to),
    totalLocations: input.locations.length,
    activeLocations: input.locations.filter((location) => location.status === "ACTIVE").length,
    totalOrders,
    totalRevenue,
    unassignedOrders: unassigned.orders,
    unassignedRevenue: unassigned.revenue,
    locations,
    topLocation,
    dailyTrend,
  };
}

export async function loadMultiLocationAnalytics(
  scope: { userId: string },
  filters: AnalyticsFilters,
): Promise<MultiLocationAnalyticsSnapshot> {
  const [locationWhere, orderWhere] = await Promise.all([
    locationListWhereForOwner(scope.userId),
    orderListWhereForOwnerAnd(scope.userId, {
      createdAt: { gte: filters.from, lte: filters.to },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    }),
  ]);

  const [locations, orders, routesGroup, tasksGroup] = await Promise.all([
    prisma.location.findMany({
      where: locationWhere,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, status: true, type: true },
    }),
    prisma.order.findMany({
      where: orderWhere,
      select: {
        locationId: true,
        status: true,
        total: true,
        fulfillmentType: true,
        createdAt: true,
      },
    }),
    prisma.deliveryRoute.groupBy({
      by: ["locationId"],
      where: {
        userId: scope.userId,
        routeDate: { gte: filters.from, lte: filters.to },
        ...(filters.locationId ? { locationId: filters.locationId } : {}),
      },
      _count: { _all: true },
    }),
    prisma.kitchenTask.groupBy({
      by: ["locationId"],
      where: {
        userId: scope.userId,
        createdAt: { gte: filters.from, lte: filters.to },
        ...(filters.locationId ? { locationId: filters.locationId } : {}),
      },
      _count: { _all: true },
    }),
  ]);

  const routesByLocation = new Map(routesGroup.map((row) => [row.locationId, row._count._all]));
  const tasksByLocation = new Map(tasksGroup.map((row) => [row.locationId, row._count._all]));

  return buildMultiLocationAnalyticsSnapshot({
    locations,
    orders,
    routesByLocation,
    tasksByLocation,
    from: filters.from,
    to: filters.to,
  });
}
