import { Prisma } from "@prisma/client";

import {
  ANALYTICS_CHANNEL_LABEL,
  ANALYTICS_CHANNEL_VALUES,
  channelForOrder,
  type AnalyticsChannel,
} from "@/lib/analytics/channel-attribution";
import { computeRepeatRate, newCustomerCount } from "@/lib/analytics/customer-metrics";
import {
  isLateOrder,
  ratePercentLabel,
  safeRate,
} from "@/lib/analytics/operational-metrics";
import {
  orderContributesToRevenue,
  sumCancelled,
  sumRevenue,
  whereOrdersInWindowForOwner,
} from "@/lib/analytics/revenue-metrics";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { prisma } from "@/lib/prisma";
import { SERVICE_AGGREGATION_TAKE } from "@/lib/scope/tenant-scope";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { externalOrderListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";
import {
  ingredientDemandLineListWhereForOwner,
  ingredientListWhereForOwner,
  mealPlanListWhereForOwner,
  recipeListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import type { AnalyticsFilters } from "@/lib/analytics/filters";

export type Scope = { userId: string };

export type ExecutiveOverview = {
  filtersRangeLabel: string;
  grossRevenue: number;
  netRevenue: number;
  cancelledRevenue: number;
  orderCount: number;
  cancelledOrderCount: number;
  lateOrderCount: number;
  aov: number | null;
  repeatRate: number | null;
  repeatRateLabel: string;
  newCustomerCount: number;
  activeCustomerCount: number;
  cateringRevenue: number;
  mealPlanRevenue: number;
  productionCompletionRate: number | null;
  packingCompletionRate: number | null;
  deliveryCompletionRate: number | null;
  topChannel: { channel: AnalyticsChannel; label: string; revenue: number } | null;
  topBrand: { brandId: string; name: string; revenue: number } | null;
  topLocation: { locationId: string; name: string; revenue: number } | null;
  fulfillmentMix: { pickup: number; delivery: number };
  channelMix: { channel: AnalyticsChannel; label: string; revenue: number; orders: number }[];
  topProducts: { productId: string; title: string; quantity: number }[];
  dailyRevenue: { date: string; value: number }[];
  warnings: string[];
};

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatRangeLabel(f: AnalyticsFilters): string {
  const from = formatDate(f.from);
  const to = formatDate(f.to);
  return `${from} → ${to}`;
}

export async function loadExecutiveOverview(scope: Scope, filters: AnalyticsFilters): Promise<ExecutiveOverview> {
  const baseWhere = await whereOrdersInWindowForOwner({
    userId: scope.userId,
    from: filters.from,
    to: filters.to,
    brandId: filters.brandId,
    locationId: filters.locationId,
    extra: {
      ...(filters.fulfillmentType ? { fulfillmentType: filters.fulfillmentType } : {}),
      ...(filters.mealPlanOnly ? { mealPlanCycle: { isNot: null } } : {}),
      ...(filters.cateringOnly ? { cateringQuote: { isNot: null } } : {}),
    },
  });

  const orders = await prisma.order.findMany({
    where: baseWhere,
    take: SERVICE_AGGREGATION_TAKE,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      brandId: true,
      locationId: true,
      fulfillmentType: true,
      customerEmail: true,
      pickupDate: true,
      storefrontOrder: { select: { id: true } },
      importedFromExternal: { select: { provider: true } },
      mealPlanCycle: { select: { id: true } },
      cateringQuote: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const cateringRevenueAgg = await prisma.cateringQuote.aggregate({
    where: {
      userId: scope.userId,
      updatedAt: { gte: filters.from, lte: filters.to },
      status: { in: ["ACCEPTED", "CONVERTED_TO_ORDER"] },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    _sum: { total: true },
  });

  const productionAgg = await prisma.productionBatch.aggregate({
    where: {
      userId: scope.userId,
      productionDate: { gte: filters.from, lte: filters.to },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    _sum: { totalItems: true, completedItems: true },
  });

  const packingAgg = await prisma.packingBatch.aggregate({
    where: {
      userId: scope.userId,
      packingDate: { gte: filters.from, lte: filters.to },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    _sum: { totalItems: true, packedItems: true },
  });

  const deliveryRouteWhere: Prisma.DeliveryRouteWhereInput = {
    userId: scope.userId,
    routeDate: { gte: filters.from, lte: filters.to },
    ...(filters.brandId ? { brandId: filters.brandId } : {}),
    ...(filters.locationId ? { locationId: filters.locationId } : {}),
  };
  const deliveryRouteIds = (
    await prisma.deliveryRoute.findMany({
      where: deliveryRouteWhere,
      take: SERVICE_AGGREGATION_TAKE,
      select: { id: true },
    })
  ).map((r) => r.id);
  const deliveryStops = deliveryRouteIds.length
    ? await prisma.deliveryStop.groupBy({
        by: ["status"],
        where: { routeId: { in: deliveryRouteIds } },
        _count: { _all: true },
      })
    : [];
  const deliveredStops = deliveryStops.find((s) => s.status === "DELIVERED")?._count._all ?? 0;
  const totalStops = deliveryStops.reduce((a, b) => a + b._count._all, 0);

  // Order channel mix.
  const channelTotals = new Map<AnalyticsChannel, { revenue: number; orders: number }>();
  for (const v of ANALYTICS_CHANNEL_VALUES) channelTotals.set(v, { revenue: 0, orders: 0 });
  let pickup = 0;
  let delivery = 0;
  const touches: { email: string; orderId: string }[] = [];
  for (const o of orders) {
    if (!orderContributesToRevenue(o.status)) continue;
    const channel = channelForOrder({
      storefrontOrderId: o.storefrontOrder?.id ?? null,
      importedFromProvider: o.importedFromExternal?.provider ?? null,
    });
    const bucket = channelTotals.get(channel) ?? { revenue: 0, orders: 0 };
    bucket.revenue += decimalToNumber(o.total);
    bucket.orders += 1;
    channelTotals.set(channel, bucket);
    if (o.fulfillmentType === "PICKUP") pickup += decimalToNumber(o.total);
    if (o.fulfillmentType === "DELIVERY") delivery += decimalToNumber(o.total);
    if (o.customerEmail) touches.push({ email: o.customerEmail, orderId: o.id });
  }
  if (filters.channel) {
    // Apply channel filter as a final pass — keep only one channel in the output.
    for (const v of ANALYTICS_CHANNEL_VALUES) {
      if (v !== filters.channel) channelTotals.set(v, { revenue: 0, orders: 0 });
    }
  }

  // Top brand / location.
  const brandRevenue = new Map<string, number>();
  const locationRevenue = new Map<string, number>();
  for (const o of orders) {
    if (!orderContributesToRevenue(o.status)) continue;
    if (o.brandId) brandRevenue.set(o.brandId, (brandRevenue.get(o.brandId) ?? 0) + decimalToNumber(o.total));
    if (o.locationId) locationRevenue.set(o.locationId, (locationRevenue.get(o.locationId) ?? 0) + decimalToNumber(o.total));
  }
  const topBrandEntry = topEntry(brandRevenue);
  const topLocationEntry = topEntry(locationRevenue);
  const [topBrandName, topLocationName] = await Promise.all([
    topBrandEntry
      ? prisma.brand.findUnique({ where: { id: topBrandEntry.id }, select: { name: true } }).then((b) => b?.name ?? null)
      : Promise.resolve(null),
    topLocationEntry
      ? prisma.location.findUnique({ where: { id: topLocationEntry.id }, select: { name: true } }).then((l) => l?.name ?? null)
      : Promise.resolve(null),
  ]);

  const grossRevenue = sumRevenue(orders);
  const cancelledRevenue = sumCancelled(orders);
  const orderCount = orders.filter((o) => orderContributesToRevenue(o.status)).length;
  const cancelledOrderCount = orders.filter((o) => o.status === "CANCELLED").length;
  const now = new Date();
  const lateOrderCount = orders.filter((o) => isLateOrder({ pickupDate: o.pickupDate, status: o.status, now })).length;
  const aov = orderCount > 0 ? Math.round((grossRevenue / orderCount) * 100) / 100 : null;

  const { repeatRate } = computeRepeatRate(touches);

  const activeEmails = new Set(touches.map((t) => t.email.toLowerCase().trim()).filter(Boolean));

  // Catering revenue from accepted quotes; meal plan revenue from joined orders.
  const cateringRevenue = decimalToNumber(cateringRevenueAgg._sum.total);
  const mealPlanRevenue = orders
    .filter((o) => o.mealPlanCycle && orderContributesToRevenue(o.status))
    .reduce((acc, o) => acc + decimalToNumber(o.total), 0);

  // First-order-by-email map for "new customers".
  let firstOrderAtByEmail = new Map<string, Date>();
  if (activeEmails.size > 0) {
    const customerScope = await kitchenCustomerListWhereForOwner(scope.userId);
    const firstOrders = await prisma.kitchenCustomer.findMany({
      where: { AND: [customerScope, { email: { in: [...activeEmails] } }] },
      select: { email: true, firstOrderAt: true },
    });
    firstOrderAtByEmail = new Map(
      firstOrders.filter((c) => c.firstOrderAt && c.email).map((c) => [c.email!.toLowerCase(), c.firstOrderAt!]),
    );
  }
  const newCustomers = newCustomerCount({
    firstOrderAtByEmail,
    windowStart: filters.from,
    windowEnd: filters.to,
  });

  // Top products
  const topProductRows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: baseWhere },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const topProductIds = topProductRows
    .map((r) => r.productId)
    .filter((id): id is string => typeof id === "string");
  const productTitles = topProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, title: true },
      })
    : [];
  const topProducts = topProductRows
    .filter((r): r is typeof r & { productId: string } => typeof r.productId === "string")
    .map((r) => ({
      productId: r.productId,
      title: productTitles.find((p) => p.id === r.productId)?.title ?? "(unknown)",
      quantity: r._sum.quantity ?? 0,
    }));

  // Daily revenue series
  const dailyMap = new Map<string, number>();
  for (const o of orders) {
    if (!orderContributesToRevenue(o.status)) continue;
    const key = formatDate(o.createdAt);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + decimalToNumber(o.total));
  }
  const dailyRevenue = bucketDailySeries(filters.from, filters.to, dailyMap);

  const warnings: string[] = [];
  if (orders.length === 0) warnings.push("No orders in the selected window — metrics will display zeros and empty charts.");

  const channelMix = ANALYTICS_CHANNEL_VALUES.map((channel) => {
    const v = channelTotals.get(channel) ?? { revenue: 0, orders: 0 };
    return {
      channel,
      label: ANALYTICS_CHANNEL_LABEL[channel],
      revenue: Math.round(v.revenue * 100) / 100,
      orders: v.orders,
    };
  });
  const topChannelEntry = channelMix.reduce<{ channel: AnalyticsChannel; label: string; revenue: number } | null>(
    (best, row) => (row.revenue > 0 && (!best || row.revenue > best.revenue) ? { channel: row.channel, label: row.label, revenue: row.revenue } : best),
    null,
  );

  const productionRate = safeRate({
    numerator: productionAgg._sum.completedItems ?? 0,
    denominator: productionAgg._sum.totalItems ?? 0,
  });
  const packingRate = safeRate({
    numerator: packingAgg._sum.packedItems ?? 0,
    denominator: packingAgg._sum.totalItems ?? 0,
  });
  const deliveryRate = safeRate({ numerator: deliveredStops, denominator: totalStops });

  return {
    filtersRangeLabel: formatRangeLabel(filters),
    grossRevenue,
    netRevenue: Math.round((grossRevenue - cancelledRevenue) * 100) / 100,
    cancelledRevenue,
    orderCount,
    cancelledOrderCount,
    lateOrderCount,
    aov,
    repeatRate,
    repeatRateLabel: ratePercentLabel(repeatRate),
    newCustomerCount: newCustomers,
    activeCustomerCount: activeEmails.size,
    cateringRevenue,
    mealPlanRevenue: Math.round(mealPlanRevenue * 100) / 100,
    productionCompletionRate: productionRate,
    packingCompletionRate: packingRate,
    deliveryCompletionRate: deliveryRate,
    topChannel: topChannelEntry,
    topBrand: topBrandEntry ? { brandId: topBrandEntry.id, name: topBrandName ?? "(brand)", revenue: topBrandEntry.value } : null,
    topLocation: topLocationEntry ? { locationId: topLocationEntry.id, name: topLocationName ?? "(location)", revenue: topLocationEntry.value } : null,
    fulfillmentMix: { pickup: Math.round(pickup * 100) / 100, delivery: Math.round(delivery * 100) / 100 },
    channelMix,
    topProducts,
    dailyRevenue,
    warnings,
  };
}

function topEntry(map: Map<string, number>): { id: string; value: number } | null {
  let best: { id: string; value: number } | null = null;
  map.forEach((value, id) => {
    if (!best || value > best.value) best = { id, value };
  });
  return best;
}

function bucketDailySeries(from: Date, to: Date, sourceByDay: Map<string, number>): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const key = formatDate(cursor);
    out.push({ date: key, value: Math.round((sourceByDay.get(key) ?? 0) * 100) / 100 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/* ============================ orders tab ============================ */

export type OrderAnalytics = {
  totalOrders: number;
  cancelledOrders: number;
  cancellationRate: number | null;
  fulfillmentMix: { pickup: number; delivery: number };
  internalCount: number;
  externalCount: number;
  recurringOrders: number;
  hourlyHeatmap: { hour: number; count: number }[];
  weekdayHeatmap: { day: number; count: number }[];
  daily: { date: string; value: number }[];
};

export async function loadOrderAnalytics(scope: Scope, filters: AnalyticsFilters): Promise<OrderAnalytics> {
  const where = await whereOrdersInWindowForOwner({
    userId: scope.userId,
    from: filters.from,
    to: filters.to,
    brandId: filters.brandId,
    locationId: filters.locationId,
    extra: {
      ...(filters.fulfillmentType ? { fulfillmentType: filters.fulfillmentType } : {}),
      ...(filters.mealPlanOnly ? { mealPlanCycle: { isNot: null } } : {}),
    },
  });

  const [orders, externalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      take: SERVICE_AGGREGATION_TAKE,
      select: {
        id: true,
        status: true,
        createdAt: true,
        fulfillmentType: true,
        importedFromExternal: { select: { id: true } },
        mealPlanCycle: { select: { id: true } },
      },
    }),
    prisma.externalOrder.count({
      where: {
        AND: [
          await externalOrderListWhereForOwner(scope.userId),
          { createdAt: { gte: filters.from, lte: filters.to } },
        ],
      },
    }),
  ]);

  const totalOrders = orders.length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const cancellationRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 10000) / 10000 : null;

  let pickup = 0;
  let delivery = 0;
  let internalCount = 0;
  let recurringOrders = 0;
  const hourly = new Map<number, number>();
  const weekday = new Map<number, number>();
  for (const o of orders) {
    if (o.fulfillmentType === "PICKUP") pickup += 1;
    if (o.fulfillmentType === "DELIVERY") delivery += 1;
    if (!o.importedFromExternal) internalCount += 1;
    if (o.mealPlanCycle) recurringOrders += 1;
    const hr = o.createdAt.getHours();
    hourly.set(hr, (hourly.get(hr) ?? 0) + 1);
    const wd = o.createdAt.getDay();
    weekday.set(wd, (weekday.get(wd) ?? 0) + 1);
  }

  const dailyMap = new Map<string, number>();
  for (const o of orders) {
    const key = formatDate(o.createdAt);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  const hourlyHeatmap: { hour: number; count: number }[] = [];
  for (let h = 0; h < 24; h++) hourlyHeatmap.push({ hour: h, count: hourly.get(h) ?? 0 });
  const weekdayHeatmap: { day: number; count: number }[] = [];
  for (let d = 0; d < 7; d++) weekdayHeatmap.push({ day: d, count: weekday.get(d) ?? 0 });

  return {
    totalOrders,
    cancelledOrders,
    cancellationRate,
    fulfillmentMix: { pickup, delivery },
    internalCount,
    externalCount,
    recurringOrders,
    hourlyHeatmap,
    weekdayHeatmap,
    daily: bucketDailySeries(filters.from, filters.to, dailyMap),
  };
}

/* ============================ channels tab ============================ */

export async function loadChannelAnalytics(scope: Scope, filters: AnalyticsFilters): Promise<ExecutiveOverview["channelMix"]> {
  const exec = await loadExecutiveOverview(scope, filters);
  return exec.channelMix;
}

/* ============================ production / packing / delivery ============================ */

export type ProductionAnalytics = {
  totalItems: number;
  completedItems: number;
  completionRate: number | null;
  delayed: number;
  byStation: { station: string; total: number; completed: number }[];
  recent: { id: string; title: string; date: Date; total: number; completed: number; status: string }[];
};

export async function loadProductionAnalytics(scope: Scope, filters: AnalyticsFilters): Promise<ProductionAnalytics> {
  const where: Prisma.ProductionBatchWhereInput = {
    userId: scope.userId,
    productionDate: { gte: filters.from, lte: filters.to },
    ...(filters.brandId ? { brandId: filters.brandId } : {}),
    ...(filters.locationId ? { locationId: filters.locationId } : {}),
  };
  const [agg, batches] = await Promise.all([
    prisma.productionBatch.aggregate({ where, _sum: { totalItems: true, completedItems: true } }),
    prisma.productionBatch.findMany({
      where,
      select: {
        id: true,
        title: true,
        productionDate: true,
        totalItems: true,
        completedItems: true,
        status: true,
        assignedStation: true,
      },
      orderBy: { productionDate: "desc" },
      take: 50,
    }),
  ]);
  const now = new Date();
  const delayed = batches.filter((b) => b.productionDate < now && b.status !== "COMPLETED" && b.status !== "ARCHIVED").length;
  const stationTotals = new Map<string, { total: number; completed: number }>();
  for (const b of batches) {
    const key = b.assignedStation ?? "(unassigned)";
    const bucket = stationTotals.get(key) ?? { total: 0, completed: 0 };
    bucket.total += b.totalItems;
    bucket.completed += b.completedItems;
    stationTotals.set(key, bucket);
  }

  return {
    totalItems: agg._sum.totalItems ?? 0,
    completedItems: agg._sum.completedItems ?? 0,
    completionRate: safeRate({ numerator: agg._sum.completedItems ?? 0, denominator: agg._sum.totalItems ?? 0 }),
    delayed,
    byStation: [...stationTotals.entries()].map(([station, v]) => ({ station, total: v.total, completed: v.completed })),
    recent: batches.slice(0, 25).map((b) => ({
      id: b.id,
      title: b.title,
      date: b.productionDate,
      total: b.totalItems,
      completed: b.completedItems,
      status: b.status,
    })),
  };
}

export type PackingDeliveryAnalytics = {
  packing: { total: number; packed: number; completionRate: number | null };
  deliveryStops: { status: string; count: number }[];
  onTimeRate: number | null;
  failedStops: number;
  routesInWindow: number;
};

export async function loadPackingDeliveryAnalytics(scope: Scope, filters: AnalyticsFilters): Promise<PackingDeliveryAnalytics> {
  const packingAgg = await prisma.packingBatch.aggregate({
    where: {
      userId: scope.userId,
      packingDate: { gte: filters.from, lte: filters.to },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    _sum: { totalItems: true, packedItems: true },
  });
  const routes = await prisma.deliveryRoute.findMany({
    where: {
      userId: scope.userId,
      routeDate: { gte: filters.from, lte: filters.to },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    },
    take: SERVICE_AGGREGATION_TAKE,
    select: { id: true },
  });
  const stops = routes.length
    ? await prisma.deliveryStop.groupBy({
        by: ["status"],
        where: { routeId: { in: routes.map((r) => r.id) } },
        _count: { _all: true },
      })
    : [];
  const delivered = stops.find((s) => s.status === "DELIVERED")?._count._all ?? 0;
  const failed = stops.find((s) => s.status === "FAILED")?._count._all ?? 0;
  const totalStops = stops.reduce((a, b) => a + b._count._all, 0);

  return {
    packing: {
      total: packingAgg._sum.totalItems ?? 0,
      packed: packingAgg._sum.packedItems ?? 0,
      completionRate: safeRate({ numerator: packingAgg._sum.packedItems ?? 0, denominator: packingAgg._sum.totalItems ?? 0 }),
    },
    deliveryStops: stops.map((s) => ({ status: s.status, count: s._count._all })),
    onTimeRate: safeRate({ numerator: delivered, denominator: totalStops }),
    failedStops: failed,
    routesInWindow: routes.length,
  };
}

/* ============================ catering / meal plans ============================ */

export type CateringAnalytics = {
  totalQuotes: number;
  acceptedRevenue: number;
  pipelineValue: number;
  conversionRate: number | null;
  byEventType: { eventType: string; revenue: number; count: number }[];
};

export async function loadCateringAnalytics(scope: Scope, filters: AnalyticsFilters): Promise<CateringAnalytics> {
  const where: Prisma.CateringQuoteWhereInput = {
    userId: scope.userId,
    updatedAt: { gte: filters.from, lte: filters.to },
    ...(filters.brandId ? { brandId: filters.brandId } : {}),
    ...(filters.locationId ? { locationId: filters.locationId } : {}),
  };
  const [totalQuotes, accepted, byEventType] = await Promise.all([
    prisma.cateringQuote.count({ where }),
    prisma.cateringQuote.aggregate({
      where: { ...where, status: { in: ["ACCEPTED", "CONVERTED_TO_ORDER"] } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.cateringQuote.groupBy({
      by: ["eventType"],
      where,
      _sum: { total: true },
      _count: { _all: true },
    }),
  ]);
  const pipelineAgg = await prisma.cateringQuote.aggregate({
    where: {
      ...where,
      status: {
        notIn: [
          "CONVERTED_TO_ORDER",
          "REJECTED",
          "DECLINED",
          "CANCELLED",
          "ARCHIVED",
          "EXPIRED",
        ],
      },
    },
    _sum: { total: true },
  });
  const conversionRate = totalQuotes > 0 ? Math.round((accepted._count._all / totalQuotes) * 10000) / 10000 : null;
  return {
    totalQuotes,
    acceptedRevenue: decimalToNumber(accepted._sum.total),
    pipelineValue: decimalToNumber(pipelineAgg._sum.total),
    conversionRate,
    byEventType: byEventType.map((r) => ({
      eventType: r.eventType,
      revenue: decimalToNumber(r._sum.total),
      count: r._count._all,
    })),
  };
}

export type MealPlanAnalytics = {
  totalPlans: number;
  activePlans: number;
  pausedPlans: number;
  cancelledPlans: number;
  recurringRevenue: number;
  cyclesInWindow: number;
};

export async function loadMealPlanAnalytics(scope: Scope, filters: AnalyticsFilters): Promise<MealPlanAnalytics> {
  const mealPlanScope = await mealPlanListWhereForOwner(scope.userId);
  const [totalPlans, statusRows, cycleOrders] = await Promise.all([
    prisma.mealPlan.count({ where: mealPlanScope }),
    prisma.mealPlan.groupBy({
      by: ["status"],
      where: mealPlanScope,
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: await orderListWhereForOwnerAnd(scope.userId, {
        createdAt: { gte: filters.from, lte: filters.to },
        mealPlanCycle: { isNot: null },
      }),
      take: SERVICE_AGGREGATION_TAKE,
      select: { total: true, status: true },
    }),
  ]);
  const cyclesInWindow = await prisma.mealPlanCycle.count({
    where: {
      AND: [
        { cycleStartDate: { gte: filters.from, lte: filters.to } },
        { mealPlan: mealPlanScope },
      ],
    },
  });

  const active = statusRows.find((r) => r.status === "ACTIVE")?._count._all ?? 0;
  const paused = statusRows.find((r) => r.status === "PAUSED")?._count._all ?? 0;
  const cancelled = statusRows.find((r) => r.status === "CANCELLED")?._count._all ?? 0;

  const recurringRevenue = cycleOrders
    .filter((o) => orderContributesToRevenue(o.status))
    .reduce((acc, o) => acc + decimalToNumber(o.total), 0);

  return {
    totalPlans,
    activePlans: active,
    pausedPlans: paused,
    cancelledPlans: cancelled,
    recurringRevenue: Math.round(recurringRevenue * 100) / 100,
    cyclesInWindow,
  };
}

/* ============================ customers ============================ */

export type CustomerAnalytics = {
  uniqueCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  repeatRate: number | null;
  vipRevenue: number;
  topSpenders: { email: string; revenue: number; orders: number }[];
};

export async function loadCustomerAnalytics(scope: Scope, filters: AnalyticsFilters): Promise<CustomerAnalytics> {
  const customerScope = await kitchenCustomerListWhereForOwner(scope.userId);
  const baseWhere = await whereOrdersInWindowForOwner({
    userId: scope.userId,
    from: filters.from,
    to: filters.to,
    brandId: filters.brandId,
    locationId: filters.locationId,
  });
  const orders = await prisma.order.findMany({
    where: baseWhere,
    take: SERVICE_AGGREGATION_TAKE,
    select: { customerEmail: true, total: true, status: true },
  });
  const touches = orders
    .filter((o) => orderContributesToRevenue(o.status) && !!o.customerEmail)
    .map((o) => ({ email: o.customerEmail.toLowerCase().trim(), total: decimalToNumber(o.total) }));

  const byEmail = new Map<string, { revenue: number; orders: number }>();
  for (const t of touches) {
    const bucket = byEmail.get(t.email) ?? { revenue: 0, orders: 0 };
    bucket.revenue += t.total;
    bucket.orders += 1;
    byEmail.set(t.email, bucket);
  }
  const uniqueCustomers = byEmail.size;
  let repeatCustomers = 0;
  byEmail.forEach((row) => {
    if (row.orders >= 2) repeatCustomers += 1;
  });
  const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 10000) / 10000 : null;

  const vipAgg = await prisma.kitchenCustomer.aggregate({
    where: { AND: [customerScope, { type: "VIP_CLIENT" }] },
    _sum: { lifetimeValueCents: true },
  });
  const vipRevenue = ((vipAgg._sum.lifetimeValueCents ?? 0) as number) / 100;

  const topSpenders = [...byEmail.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([email, row]) => ({ email, revenue: Math.round(row.revenue * 100) / 100, orders: row.orders }));

  // New customers — first order falls in window
  const newCustomers = await prisma.kitchenCustomer.count({
    where: { AND: [customerScope, { firstOrderAt: { gte: filters.from, lte: filters.to } }] },
  });

  return { uniqueCustomers, newCustomers, repeatCustomers, repeatRate, vipRevenue, topSpenders };
}

/* ============================ inventory ============================ */

export type InventoryAnalytics = {
  ingredientsTracked: number;
  recipesTracked: number;
  ingredientUsageRows: number;
  shortagesPlaceholder: number;
};

export async function loadInventoryAnalytics(scope: Scope): Promise<InventoryAnalytics> {
  const [ingredientScope, recipeScope, demandLineScope] = await Promise.all([
    ingredientListWhereForOwner(scope.userId),
    recipeListWhereForOwner(scope.userId),
    ingredientDemandLineListWhereForOwner(scope.userId),
  ]);
  const [ingredients, recipes, usage] = await Promise.all([
    prisma.ingredient.count({ where: ingredientScope }),
    prisma.recipe.count({ where: recipeScope }),
    prisma.ingredientDemandLine.count({ where: demandLineScope }),
  ]);
  return {
    ingredientsTracked: ingredients,
    recipesTracked: recipes,
    ingredientUsageRows: usage,
    shortagesPlaceholder: 0,
  };
}
