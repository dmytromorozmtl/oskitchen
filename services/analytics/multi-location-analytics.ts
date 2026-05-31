import type { FulfillmentType, LocationStatus, LocationType, OrderStatus, Prisma } from "@prisma/client";

import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { orderContributesToRevenue } from "@/lib/analytics/revenue-metrics";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { prisma } from "@/lib/prisma";
import { locationListWhereForOwner, staffShiftListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
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
  laborCost: number;
  laborPct: number | null;
  foodCostPct: number | null;
  vsAvgRevenue: ComparisonVsAverage | null;
  vsAvgOrders: ComparisonVsAverage | null;
  vsAvgLaborPct: ComparisonVsAverage | null;
  vsAvgFoodCostPct: ComparisonVsAverage | null;
};

export type ComparisonVsAverage = "above" | "below" | "at";

export type MultiLocationNetworkAverages = {
  revenue: number;
  orders: number;
  laborPct: number | null;
  foodCostPct: number | null;
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
  networkAverages: MultiLocationNetworkAverages;
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

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function compareToAverage(value: number, average: number): ComparisonVsAverage | null {
  if (average <= 0 && value <= 0) return null;
  if (Math.abs(value - average) < 0.01) return "at";
  return value > average ? "above" : "below";
}

function comparePctToAverage(value: number | null, average: number | null): ComparisonVsAverage | null {
  if (value == null || average == null) return null;
  if (Math.abs(value - average) < 0.5) return "at";
  return value > average ? "above" : "below";
}

export function applyMultiLocationComparisonMetrics(
  rows: LocationAnalyticsRow[],
): { locations: LocationAnalyticsRow[]; networkAverages: MultiLocationNetworkAverages } {
  const activeRows = rows.filter((row) => row.orders > 0 || row.revenue > 0);
  const count = activeRows.length || rows.length || 1;
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const totalOrders = rows.reduce((sum, row) => sum + row.orders, 0);
  const laborPctValues = rows.map((row) => row.laborPct).filter((v): v is number => v != null);
  const foodPctValues = rows.map((row) => row.foodCostPct).filter((v): v is number => v != null);

  const networkAverages: MultiLocationNetworkAverages = {
    revenue: round2(totalRevenue / count),
    orders: round2(totalOrders / count),
    laborPct:
      laborPctValues.length > 0
        ? round1(laborPctValues.reduce((sum, v) => sum + v, 0) / laborPctValues.length)
        : null,
    foodCostPct:
      foodPctValues.length > 0
        ? round1(foodPctValues.reduce((sum, v) => sum + v, 0) / foodPctValues.length)
        : null,
  };

  const locations = rows.map((row) => ({
    ...row,
    vsAvgRevenue: compareToAverage(row.revenue, networkAverages.revenue),
    vsAvgOrders: compareToAverage(row.orders, networkAverages.orders),
    vsAvgLaborPct: comparePctToAverage(row.laborPct, networkAverages.laborPct),
    vsAvgFoodCostPct: comparePctToAverage(row.foodCostPct, networkAverages.foodCostPct),
  }));

  return { locations, networkAverages };
}

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
  laborCostByLocation?: Map<string, number>;
  foodCostPctByLocation?: Map<string, number | null>;
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

  const baseRows: LocationAnalyticsRow[] = input.locations.map((location) => {
    const bucket = buckets.get(location.id)!;
    const laborCost = input.laborCostByLocation?.get(location.id) ?? 0;
    const foodCostPct = input.foodCostPctByLocation?.get(location.id) ?? null;
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
      laborCost: round2(laborCost),
      laborPct:
        bucket.revenue > 0 && laborCost > 0
          ? round1((laborCost / bucket.revenue) * 100)
          : null,
      foodCostPct,
      vsAvgRevenue: null,
      vsAvgOrders: null,
      vsAvgLaborPct: null,
      vsAvgFoodCostPct: null,
    };
  });

  const { locations, networkAverages } = applyMultiLocationComparisonMetrics(baseRows);

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
    networkAverages,
  };
}

async function loadFoodCostPctByLocation(
  orderWhere: Prisma.OrderWhereInput,
): Promise<Map<string, number | null>> {
  const items = await prisma.orderItem.findMany({
    where: {
      order: orderWhere,
      productId: { not: null },
      lineTotal: { not: null },
    },
    select: {
      productId: true,
      lineTotal: true,
      order: { select: { locationId: true } },
    },
    take: 5000,
  });

  const productIds = [...new Set(items.map((item) => item.productId).filter(Boolean))] as string[];
  if (productIds.length === 0) return new Map();

  const snapshots = await prisma.costSnapshot.findMany({
    where: { productId: { in: productIds } },
    orderBy: { createdAt: "desc" },
    select: {
      productId: true,
      totalCost: true,
      salePrice: true,
    },
  });

  const foodPctByProduct = new Map<string, number>();
  for (const snap of snapshots) {
    if (foodPctByProduct.has(snap.productId)) continue;
    const sale = decimalToNumber(snap.salePrice);
    const cost = decimalToNumber(snap.totalCost);
    if (sale <= 0) continue;
    foodPctByProduct.set(snap.productId, round1((cost / sale) * 100));
  }

  const totalsByLocation = new Map<string, { revenue: number; foodCost: number }>();
  for (const item of items) {
    const locationId = item.order.locationId;
    if (!locationId || !item.productId) continue;
    const lineTotal = decimalToNumber(item.lineTotal);
    const pct = foodPctByProduct.get(item.productId);
    if (pct == null) continue;
    const bucket = totalsByLocation.get(locationId) ?? { revenue: 0, foodCost: 0 };
    bucket.revenue = round2(bucket.revenue + lineTotal);
    bucket.foodCost = round2(bucket.foodCost + lineTotal * (pct / 100));
    totalsByLocation.set(locationId, bucket);
  }

  const result = new Map<string, number | null>();
  for (const [locationId, bucket] of totalsByLocation) {
    result.set(
      locationId,
      bucket.revenue > 0 ? round1((bucket.foodCost / bucket.revenue) * 100) : null,
    );
  }
  return result;
}

export async function loadMultiLocationAnalytics(
  scope: { userId: string },
  filters: AnalyticsFilters,
): Promise<MultiLocationAnalyticsSnapshot> {
  const [locationWhere, orderWhere, shiftWhere] = await Promise.all([
    locationListWhereForOwner(scope.userId),
    orderListWhereForOwnerAnd(scope.userId, {
      createdAt: { gte: filters.from, lte: filters.to },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    }),
    staffShiftListWhereForOwner(scope.userId),
  ]);

  const [locations, orders, routesGroup, tasksGroup, laborGroup, foodCostPctByLocation] =
    await Promise.all([
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
    prisma.staffShift.groupBy({
      by: ["locationId"],
      where: {
        AND: [
          shiftWhere,
          { shiftDate: { gte: filters.from, lte: filters.to } },
          ...(filters.locationId ? [{ locationId: filters.locationId }] : []),
        ],
      },
      _sum: { laborCost: true },
    }),
    loadFoodCostPctByLocation(orderWhere),
  ]);

  const routesByLocation = new Map(routesGroup.map((row) => [row.locationId, row._count._all]));
  const tasksByLocation = new Map(tasksGroup.map((row) => [row.locationId, row._count._all]));
  const laborCostByLocation = new Map(
    laborGroup
      .filter((row) => row.locationId)
      .map((row) => [row.locationId!, decimalToNumber(row._sum.laborCost)]),
  );

  return buildMultiLocationAnalyticsSnapshot({
    locations,
    orders,
    routesByLocation,
    tasksByLocation,
    laborCostByLocation,
    foodCostPctByLocation,
    from: filters.from,
    to: filters.to,
  });
}
