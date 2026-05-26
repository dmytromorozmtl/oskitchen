import { Prisma } from "@prisma/client";
import type { IntegrationProvider } from "@prisma/client";

import {
  ANALYTICS_CHANNEL_LABEL,
  channelForOrder,
  type AnalyticsChannel,
} from "@/lib/analytics/channel-attribution";
import { computeRepeatRate } from "@/lib/analytics/customer-metrics";
import {
  orderContributesToRevenue,
  whereOrdersInWindowForOwner,
} from "@/lib/analytics/revenue-metrics";
import {
  defaultFilters,
  endOfDay,
  parseAnalyticsFilters,
  shiftToPreviousPeriod,
  startOfDay,
  type AnalyticsFilters,
} from "@/lib/analytics/filters";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import {
  cateringQuoteListWhereForOwner,
  costingRunListWhereForOwner,
  deliveryRouteListWhereForOwner,
  executiveInsightListWhereForOwner,
  executiveSnapshotListWhereForOwner,
  ingredientDemandLineListWhereForOwner,
  integrationConnectionListWhereForOwner,
  kitchenTaskListWhereForOwner,
  locationListWhereForOwner,
  mealPlanListWhereForOwner,
  packingBatchListWhereForOwner,
  productionBatchListWhereForOwner,
  purchaseOrderListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { SERVICE_AGGREGATION_TAKE } from "@/lib/scope/tenant-scope";

import {
  evaluateBusinessHealth,
  type HealthScore,
} from "@/lib/executive/executive-health";
import {
  deriveInsights,
  type ExecutiveInsightSeed,
} from "@/lib/executive/executive-insights";
import { summarizeCostingVarianceAlerts } from "@/services/costing/costing-alert-service";

type ChannelInputs = {
  importedFromExternal: { provider: IntegrationProvider } | null;
  storefrontOrder: { id: string } | null;
};
function channelOf(o: ChannelInputs): AnalyticsChannel {
  return channelForOrder({
    importedFromProvider: o.importedFromExternal?.provider ?? null,
    storefrontOrderId: o.storefrontOrder?.id ?? null,
  });
}

export type ExecutiveScope = { userId: string };

export type ExecutiveFilters = AnalyticsFilters;
export { parseAnalyticsFilters as parseExecutiveFilters };

export type ExecutiveKpi = {
  key: string;
  label: string;
  value: string;
  rawValue: number | null;
  comparison: { previousValue: number | null; deltaPct: number | null } | null;
  sub: string | null;
  drilldownRoute: string;
  format: "currency" | "number" | "percent" | "text";
};

export type ExecutiveOverview = {
  rangeLabel: string;
  filters: ExecutiveFilters;
  netRevenue: number;
  previousNetRevenue: number;
  revenueTrend: number | null;
  orderCount: number;
  previousOrderCount: number;
  orderTrend: number | null;
  cancelledOrderCount: number;
  aov: number | null;
  previousAov: number | null;
  repeatRate: number | null;
  previousRepeatRate: number | null;
  newCustomerCount: number;
  topChannel: { channel: string; revenue: number } | null;
  channelMix: { channel: string; revenue: number; orders: number }[];
  topProducts: { title: string; quantity: number }[];
  topBrand: { id: string; name: string; revenue: number } | null;
  topLocation: { id: string; name: string; revenue: number } | null;
  dailyRevenue: { date: string; value: number }[];
  productionTotal: number;
  productionCompleted: number;
  productionCompletion: number | null;
  overdueProductionItems: number;
  packingTotal: number;
  packed: number;
  packingAccuracy: number | null;
  deliveryStops: number;
  deliveredStops: number;
  failedDeliveries: number;
  deliveryCompletion: number | null;
  marginMedian: number | null;
  marginAtRiskItems: number;
  inventoryShortages: number;
  imminentShortages: number;
  purchasingNeeds: number;
  stalePurchaseOrders: number;
  overdueTasks: number;
  openTasks: number;
  cateringOpenPipeline: number;
  cateringAccepted: number;
  cateringAcceptedRevenue: number;
  cateringFollowUpsOverdue: number;
  mealPlanActive: number;
  mealPlanWeeklyRecurring: number;
  mealPlanCyclesMissing: number;
  failedIntegrations: number;
  brandCount: number;
  locationCount: number;
  brandsRanked: { id: string; name: string; revenue: number; orders: number }[];
  locationsRanked: { id: string; name: string; revenue: number; orders: number }[];
  kpis: ExecutiveKpi[];
  health: HealthScore;
  insights: ExecutiveInsightSeed[];
  costingVarianceAlerts: Awaited<ReturnType<typeof summarizeCostingVarianceAlerts>>;
  warnings: string[];
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeLabel(f: ExecutiveFilters): string {
  return `${isoDate(f.from)} → ${isoDate(f.to)}`;
}

function pct(value: number | null, previous: number | null): number | null {
  if (value == null || previous == null) return null;
  if (previous === 0) return value === 0 ? 0 : null;
  return (value - previous) / Math.abs(previous);
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export async function loadExecutiveOverview(
  scope: ExecutiveScope,
  filters: ExecutiveFilters,
): Promise<ExecutiveOverview> {
  const previous = shiftToPreviousPeriod(filters);

  const baseWhere = await whereOrdersInWindowForOwner({
    userId: scope.userId,
    from: filters.from,
    to: filters.to,
    brandId: filters.brandId,
    locationId: filters.locationId,
  });
  const previousWhere = await whereOrdersInWindowForOwner({
    userId: scope.userId,
    from: previous.from,
    to: previous.to,
    brandId: filters.brandId,
    locationId: filters.locationId,
  });

  const uid = scope.userId;
  const [
    productionBatchScope,
    packingBatchScope,
    deliveryRouteScope,
    costingRunScope,
    demandLineScope,
    purchaseOrderScope,
    kitchenTaskScope,
    cateringQuoteScope,
    mealPlanScope,
    integrationScope,
    locationScope,
  ] = await Promise.all([
    productionBatchListWhereForOwner(uid),
    packingBatchListWhereForOwner(uid),
    deliveryRouteListWhereForOwner(uid),
    costingRunListWhereForOwner(uid),
    ingredientDemandLineListWhereForOwner(uid),
    purchaseOrderListWhereForOwner(uid),
    kitchenTaskListWhereForOwner(uid),
    cateringQuoteListWhereForOwner(uid),
    mealPlanListWhereForOwner(uid),
    integrationConnectionListWhereForOwner(uid),
    locationListWhereForOwner(uid),
  ]);

  const [
    orders,
    previousOrders,
    productionBatches,
    packingBatches,
    deliveryStops,
    latestCostingRun,
    inventoryLines,
    openPurchaseOrders,
    stalePurchaseOrders,
    overdueTasks,
    openTasks,
    cateringQuotes,
    cateringFollowUps,
    mealPlans,
    failedIntegrations,
    brandRevenue,
    locationRevenue,
    brandCount,
    locationCount,
    newCustomerCount,
  ] = await Promise.all([
    prisma.order.findMany({
      where: baseWhere,
      take: SERVICE_AGGREGATION_TAKE,
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        customerEmail: true,
        brandId: true,
        locationId: true,
        fulfillmentType: true,
        importedFromExternal: { select: { provider: true } },
        storefrontOrder: { select: { id: true } },
        orderItems: {
          select: { quantity: true, product: { select: { title: true } } },
        },
      },
    }),
    prisma.order.findMany({
      where: previousWhere,
      take: SERVICE_AGGREGATION_TAKE,
      select: { id: true, status: true, total: true, customerEmail: true },
    }),
    prisma.productionBatch.findMany({
      where: {
        AND: [
          productionBatchScope,
          {
            productionDate: { gte: filters.from, lte: filters.to },
            ...(filters.brandId ? { brandId: filters.brandId } : {}),
            ...(filters.locationId ? { locationId: filters.locationId } : {}),
          },
        ],
      },
      take: SERVICE_AGGREGATION_TAKE,
      select: { status: true, totalItems: true, completedItems: true },
    }),
    prisma.packingBatch.findMany({
      where: {
        AND: [
          packingBatchScope,
          {
            packingDate: { gte: filters.from, lte: filters.to },
            ...(filters.brandId ? { brandId: filters.brandId } : {}),
            ...(filters.locationId ? { locationId: filters.locationId } : {}),
          },
        ],
      },
      take: SERVICE_AGGREGATION_TAKE,
      select: { totalItems: true, packedItems: true },
    }),
    prisma.deliveryStop.findMany({
      where: {
        AND: [
          {
            route: {
              AND: [
                deliveryRouteScope,
                ...(filters.locationId ? [{ locationId: filters.locationId }] : []),
              ],
            },
          },
          { createdAt: { gte: filters.from, lte: filters.to } },
        ],
      },
      take: SERVICE_AGGREGATION_TAKE,
      select: { status: true },
    }),
    prisma.costingRun.findFirst({
      where: costingRunScope,
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    }),
    prisma.ingredientDemandRunLine.findMany({
      where: {
        AND: [
          demandLineScope as unknown as Prisma.IngredientDemandRunLineWhereInput,
          { status: "OPEN", shortageQuantity: { gt: 0 } },
        ],
      },
      select: {
        demandDate: true,
      },
      take: 1000,
    }),
    prisma.purchaseOrder.count({
      where: {
        AND: [purchaseOrderScope, { status: { in: ["DRAFT", "READY_FOR_REVIEW", "APPROVED"] } }],
      },
    }),
    prisma.purchaseOrder.count({
      where: {
        AND: [
          purchaseOrderScope,
          {
            status: "DRAFT",
            createdAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        ],
      },
    }),
    prisma.kitchenTask.count({
      where: {
        AND: [kitchenTaskScope, { status: { not: "DONE" }, dueAt: { lt: new Date() } }],
      },
    }),
    prisma.kitchenTask.count({
      where: { AND: [kitchenTaskScope, { status: { not: "DONE" } }] },
    }),
    prisma.cateringQuote.findMany({
      where: {
        AND: [cateringQuoteScope, { createdAt: { gte: filters.from, lte: filters.to } }],
      },
      take: SERVICE_AGGREGATION_TAKE,
      select: { status: true, total: true },
    }),
    prisma.cateringQuoteFollowUp.count({
      where: {
        AND: [
          { status: "PENDING", dueAt: { lt: new Date() } },
          { quote: cateringQuoteScope },
        ],
      },
    }),
    prisma.mealPlan.findMany({
      where: {
        AND: [mealPlanScope, { status: "ACTIVE" }],
      },
      take: SERVICE_AGGREGATION_TAKE,
      select: {
        id: true,
        frequency: true,
        pricePerCycle: true,
        nextOrderDate: true,
        cycles: {
          where: { status: { in: ["UPCOMING", "READY_TO_GENERATE"] } },
          take: 1,
          select: { id: true },
        },
      },
    }),
    prisma.integrationConnection.count({
      where: { AND: [integrationScope, { status: { in: ["NEEDS_AUTH", "ERROR"] } }] },
    }),
    prisma.order.groupBy({
      by: ["brandId"],
      where: { ...baseWhere, brandId: { not: null } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["locationId"],
      where: { ...baseWhere, locationId: { not: null } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.brand.count({ where: { workspace: { ownerUserId: scope.userId } } }),
    prisma.location.count({ where: locationScope }),
    prisma.kitchenCustomer.count({
      where: {
        AND: [
          await kitchenCustomerListWhereForOwner(scope.userId),
          { firstOrderAt: { gte: filters.from, lte: filters.to } },
        ],
      },
    }),
  ]);

  // --- Revenue / orders ---
  let netRevenue = 0;
  let previousNetRevenue = 0;
  let cancelledOrderCount = 0;
  for (const o of orders) {
    if (o.status === "CANCELLED") cancelledOrderCount += 1;
    if (orderContributesToRevenue(o.status)) netRevenue += Number(o.total ?? 0);
  }
  for (const o of previousOrders) {
    if (orderContributesToRevenue(o.status)) previousNetRevenue += Number(o.total ?? 0);
  }
  netRevenue = Math.round(netRevenue * 100) / 100;
  previousNetRevenue = Math.round(previousNetRevenue * 100) / 100;

  const orderCount = orders.length;
  const previousOrderCount = previousOrders.length;
  const aov = orderCount > 0 ? Math.round((netRevenue / orderCount) * 100) / 100 : null;
  const previousAov =
    previousOrderCount > 0
      ? Math.round((previousNetRevenue / previousOrderCount) * 100) / 100
      : null;

  const repeat = computeRepeatRate(
    orders.map((o) => ({ email: o.customerEmail ?? "", orderId: o.id })),
  );
  const prevRepeat = computeRepeatRate(
    previousOrders.map((o) => ({ email: o.customerEmail ?? "", orderId: o.id })),
  );

  // --- Channel + product mix ---
  const channelBuckets = new Map<string, { revenue: number; orders: number }>();
  const productBuckets = new Map<string, number>();
  const dailyMap = new Map<string, number>();
  for (const o of orders) {
    const channelKey = channelOf(o);
    const channelLabel = ANALYTICS_CHANNEL_LABEL[channelKey];
    const cb = channelBuckets.get(channelLabel) ?? { revenue: 0, orders: 0 };
    cb.orders += 1;
    if (orderContributesToRevenue(o.status)) cb.revenue += Number(o.total ?? 0);
    channelBuckets.set(channelLabel, cb);
    if (orderContributesToRevenue(o.status)) {
      const d = isoDate(o.createdAt);
      dailyMap.set(d, (dailyMap.get(d) ?? 0) + Number(o.total ?? 0));
    }
    for (const it of o.orderItems) {
      const t = it.product?.title ?? "(unknown)";
      productBuckets.set(t, (productBuckets.get(t) ?? 0) + it.quantity);
    }
  }
  const channelMix = Array.from(channelBuckets.entries())
    .map(([channel, v]) => ({ channel, revenue: Math.round(v.revenue * 100) / 100, orders: v.orders }))
    .sort((a, b) => b.revenue - a.revenue);
  const topChannel = channelMix[0] ?? null;
  const topProducts = Array.from(productBuckets.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([title, quantity]) => ({ title, quantity }));
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: Math.round(value * 100) / 100 }));

  // --- Production / packing / delivery ---
  const productionTotal = productionBatches.reduce((s, b) => s + b.totalItems, 0);
  const productionCompleted = productionBatches.reduce((s, b) => s + b.completedItems, 0);
  const productionCompletion =
    productionTotal > 0 ? Math.round((productionCompleted / productionTotal) * 10000) / 10000 : null;
  const overdueProductionItems = Math.max(0, productionTotal - productionCompleted);

  const packingTotal = packingBatches.reduce((s, b) => s + b.totalItems, 0);
  const packed = packingBatches.reduce((s, b) => s + b.packedItems, 0);
  const packingAccuracy =
    packingTotal > 0 ? Math.round((packed / packingTotal) * 10000) / 10000 : null;

  const deliveredStops = deliveryStops.filter((s) => s.status === "DELIVERED").length;
  const failedDeliveries = deliveryStops.filter((s) => s.status === "FAILED").length;
  const deliveryCompletion =
    deliveryStops.length > 0
      ? Math.round((deliveredStops / deliveryStops.length) * 10000) / 10000
      : null;

  // --- Margin (median of latest costing run) ---
  let marginMedian: number | null = null;
  let marginAtRiskItems = 0;
  if (latestCostingRun) {
    const profitability = await prisma.profitabilityLine.findMany({
      where: { runId: latestCostingRun.id },
      take: SERVICE_AGGREGATION_TAKE,
      select: { grossMarginPercent: true, foodCostPercent: true, warningLevel: true },
    });
    if (profitability.length > 0) {
      const margins = profitability
        .map((p) => Number(p.grossMarginPercent ?? 0))
        .sort((a, b) => a - b);
      const mid = Math.floor(margins.length / 2);
      const median =
        margins.length % 2 === 0 ? (margins[mid - 1] + margins[mid]) / 2 : margins[mid];
      marginMedian = Math.round((median / 100) * 10000) / 10000;
      marginAtRiskItems = profitability.filter(
        (p) =>
          p.warningLevel === "MEDIUM" ||
          p.warningLevel === "HIGH" ||
          Number(p.foodCostPercent ?? 0) >= 40,
      ).length;
    }
  }

  // --- Inventory ---
  const inventoryShortages = inventoryLines.length;
  const threeDaysOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const imminentShortages = inventoryLines.filter((l) => l.demandDate <= threeDaysOut).length;

  // --- Catering ---
  const cateringAcceptedQuotes = cateringQuotes.filter((q) => q.status === "ACCEPTED");
  const cateringAcceptedRevenue = cateringAcceptedQuotes.reduce(
    (s, q) => s + Number(q.total ?? 0),
    0,
  );
  const cateringOpenPipeline = cateringQuotes.filter(
    (q) => q.status !== "REJECTED" && q.status !== "ACCEPTED",
  ).length;

  // --- Meal plans ---
  const mealPlanActive = mealPlans.length;
  const mealPlanCyclesMissing = mealPlans.filter((p) => p.cycles.length === 0).length;
  const mealPlanWeeklyRecurring = mealPlans.reduce((sum, p) => {
    const price = Number(p.pricePerCycle ?? 0);
    const weeklyFactor =
      p.frequency === "WEEKLY"
        ? 1
        : p.frequency === "BIWEEKLY"
        ? 0.5
        : p.frequency === "MONTHLY"
        ? 0.25
        : 1;
    return sum + price * weeklyFactor;
  }, 0);

  // --- Brand / location ranking ---
  const brandIds = brandRevenue.map((b) => b.brandId).filter((id): id is string => !!id);
  const locationIds = locationRevenue
    .map((l) => l.locationId)
    .filter((id): id is string => !!id);
  const [brandMeta, locationMeta] = await Promise.all([
    brandIds.length > 0
      ? prisma.brand.findMany({
          where: { id: { in: brandIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([] as { id: string; name: string }[]),
    locationIds.length > 0
      ? prisma.location.findMany({
          where: { id: { in: locationIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([] as { id: string; name: string }[]),
  ]);
  const brandsRanked = brandRevenue
    .filter((b) => !!b.brandId)
    .map((b) => ({
      id: b.brandId as string,
      name: brandMeta.find((m) => m.id === b.brandId)?.name ?? "(unknown)",
      revenue: Math.round(Number(b._sum.total ?? 0) * 100) / 100,
      orders: b._count._all,
    }))
    .sort((a, b) => b.revenue - a.revenue);
  const locationsRanked = locationRevenue
    .filter((l) => !!l.locationId)
    .map((l) => ({
      id: l.locationId as string,
      name: locationMeta.find((m) => m.id === l.locationId)?.name ?? "(unknown)",
      revenue: Math.round(Number(l._sum.total ?? 0) * 100) / 100,
      orders: l._count._all,
    }))
    .sort((a, b) => b.revenue - a.revenue);
  const topBrand = brandsRanked[0] ?? null;
  const topLocation = locationsRanked[0] ?? null;

  const health = evaluateBusinessHealth({
    revenueTrend: pct(netRevenue, previousNetRevenue),
    orderTrend: pct(orderCount, previousOrderCount),
    overdueProductionItems,
    packingAccuracy,
    failedDeliveries,
    marginMedian,
    marginAtRiskItems,
    inventoryShortages,
    overdueTasks,
    failedIntegrations,
    repeatRate: repeat.repeatRate,
  });

  const insights = deriveInsights({
    revenueTrend: pct(netRevenue, previousNetRevenue),
    orderTrend: pct(orderCount, previousOrderCount),
    packingAccuracy,
    productionCompletion,
    overdueProductionItems,
    failedDeliveries,
    inventoryShortages,
    imminentShortages,
    marginAtRiskItems,
    failedIntegrations,
    cateringFollowUpsOverdue: cateringFollowUps,
    mealPlanCyclesMissing,
    overdueTasks,
    stalePurchaseOrders,
    repeatRate: repeat.repeatRate,
  });

  const kpis: ExecutiveKpi[] = [
    kpi("revenue", "Net revenue", fmtMoney(netRevenue), netRevenue, previousNetRevenue, "Excludes cancelled orders", "/dashboard/analytics/revenue", "currency"),
    kpi("orders", "Orders", String(orderCount), orderCount, previousOrderCount, `${cancelledOrderCount} cancelled`, "/dashboard/analytics/orders", "number"),
    kpi("average_order_value", "Average order value", aov == null ? "—" : fmtMoney(aov), aov, previousAov, "Net revenue ÷ orders", "/dashboard/analytics/revenue", "currency"),
    kpi("repeat_customers", "Repeat rate", repeat.repeatRate == null ? "—" : `${(repeat.repeatRate * 100).toFixed(1)}%`, repeat.repeatRate, prevRepeat.repeatRate, "Customers with ≥ 2 orders", "/dashboard/analytics/customers", "percent"),
    kpi("new_customers", "New customers", String(newCustomerCount), newCustomerCount, null, "First order in window", "/dashboard/customers", "number"),
    kpi("top_channel", "Top channel", topChannel?.channel ?? "—", topChannel ? topChannel.revenue : null, null, topChannel ? fmtMoney(topChannel.revenue) : "Connect a channel", "/dashboard/analytics/channels", "text"),
    kpi("production_completion", "Production completion", productionCompletion == null ? "—" : `${(productionCompletion * 100).toFixed(1)}%`, productionCompletion, null, `${productionCompleted}/${productionTotal} items`, "/dashboard/production", "percent"),
    kpi("packing_accuracy", "Packing accuracy", packingAccuracy == null ? "—" : `${(packingAccuracy * 100).toFixed(1)}%`, packingAccuracy, null, `${packed}/${packingTotal} items`, "/dashboard/packing", "percent"),
    kpi("delivery_performance", "Delivery on-time", deliveryCompletion == null ? "—" : `${(deliveryCompletion * 100).toFixed(1)}%`, deliveryCompletion, null, `${deliveredStops}/${deliveryStops.length} stops`, "/dashboard/routes", "percent"),
    kpi("margin_estimate", "Margin estimate", marginMedian == null ? "—" : `${(marginMedian * 100).toFixed(1)}%`, marginMedian, null, "Operational estimate", "/dashboard/costing", "percent"),
    kpi("inventory_alerts", "Inventory alerts", String(inventoryShortages), inventoryShortages, null, `${imminentShortages} within 3 days`, "/dashboard/inventory/demand", "number"),
    kpi("purchasing_needs", "Purchasing needs", String(openPurchaseOrders), openPurchaseOrders, null, `${stalePurchaseOrders} stale > 7d`, "/dashboard/purchasing", "number"),
    kpi("overdue_tasks", "Overdue tasks", String(overdueTasks), overdueTasks, null, `${openTasks} open total`, "/dashboard/tasks", "number"),
    kpi("catering_pipeline", "Catering pipeline", `${cateringOpenPipeline} open · ${fmtMoney(cateringAcceptedRevenue)} accepted`, cateringOpenPipeline, null, `${cateringAcceptedQuotes.length} accepted`, "/dashboard/catering-quotes", "text"),
    kpi("meal_plan_recurring", "Meal plan recurring", fmtMoney(mealPlanWeeklyRecurring), mealPlanWeeklyRecurring, null, `${mealPlanActive} active plans`, "/dashboard/meal-plans", "currency"),
    kpi("top_brand", "Top brand", topBrand?.name ?? "—", topBrand?.revenue ?? null, null, topBrand ? fmtMoney(topBrand.revenue) : `${brandCount} brand${brandCount === 1 ? "" : "s"} configured`, "/dashboard/brands", "text"),
    kpi("top_location", "Top location", topLocation?.name ?? "—", topLocation?.revenue ?? null, null, topLocation ? fmtMoney(topLocation.revenue) : `${locationCount} location${locationCount === 1 ? "" : "s"} configured`, "/dashboard/locations", "text"),
  ];

  const costingVarianceAlerts = await summarizeCostingVarianceAlerts(scope.userId);
  const warnings: string[] = [];
  if (!latestCostingRun) {
    warnings.push("No costing run yet — run one to populate margin estimates.");
  }
  if (costingVarianceAlerts.hasAlerts) {
    warnings.push(`${costingVarianceAlerts.count} costing variance alert(s) — review Actual vs Theoretical.`);
  }

  return {
    rangeLabel: rangeLabel(filters),
    filters,
    netRevenue,
    previousNetRevenue,
    revenueTrend: pct(netRevenue, previousNetRevenue),
    orderCount,
    previousOrderCount,
    orderTrend: pct(orderCount, previousOrderCount),
    cancelledOrderCount,
    aov,
    previousAov,
    repeatRate: repeat.repeatRate,
    previousRepeatRate: prevRepeat.repeatRate,
    newCustomerCount,
    topChannel: topChannel
      ? { channel: topChannel.channel, revenue: topChannel.revenue }
      : null,
    channelMix,
    topProducts,
    topBrand,
    topLocation,
    dailyRevenue,
    productionTotal,
    productionCompleted,
    productionCompletion,
    overdueProductionItems,
    packingTotal,
    packed,
    packingAccuracy,
    deliveryStops: deliveryStops.length,
    deliveredStops,
    failedDeliveries,
    deliveryCompletion,
    marginMedian,
    marginAtRiskItems,
    inventoryShortages,
    imminentShortages,
    purchasingNeeds: openPurchaseOrders,
    stalePurchaseOrders,
    overdueTasks,
    openTasks,
    cateringOpenPipeline,
    cateringAccepted: cateringAcceptedQuotes.length,
    cateringAcceptedRevenue: Math.round(cateringAcceptedRevenue * 100) / 100,
    cateringFollowUpsOverdue: cateringFollowUps,
    mealPlanActive,
    mealPlanWeeklyRecurring: Math.round(mealPlanWeeklyRecurring * 100) / 100,
    mealPlanCyclesMissing,
    failedIntegrations,
    brandCount,
    locationCount,
    brandsRanked,
    locationsRanked,
    kpis,
    health,
    insights,
    costingVarianceAlerts,
    warnings,
  };
}

function kpi(
  key: string,
  label: string,
  value: string,
  rawValue: number | null,
  previousValue: number | null,
  sub: string | null,
  drilldownRoute: string,
  format: ExecutiveKpi["format"],
): ExecutiveKpi {
  const deltaPct = pct(rawValue, previousValue);
  return {
    key,
    label,
    value,
    rawValue,
    comparison: previousValue == null ? null : { previousValue, deltaPct },
    sub,
    drilldownRoute,
    format,
  };
}

/** Build a default filter set when none provided. */
export function defaultExecutiveFilters(): ExecutiveFilters {
  return defaultFilters();
}

export async function persistExecutiveSnapshot(
  scope: ExecutiveScope,
  overview: ExecutiveOverview,
  periodType: "DAILY" | "WEEKLY" | "MONTHLY",
): Promise<void> {
  const snapshotDate = startOfDay(new Date());
  const workspaceId = await resolveOwnerWorkspaceId(scope.userId);
  await prisma.executiveSnapshot.upsert({
    where: {
      userId_snapshotDate_periodType: {
        userId: scope.userId,
        snapshotDate,
        periodType,
      },
    },
    create: {
      userId: scope.userId,
      workspaceId,
      snapshotDate,
      periodType,
      revenue: new Prisma.Decimal(overview.netRevenue),
      orderCount: overview.orderCount,
      averageOrderValue:
        overview.aov == null ? null : new Prisma.Decimal(overview.aov),
      customerCount: overview.newCustomerCount,
      repeatCustomerRate: overview.repeatRate,
      productionCompletionRate: overview.productionCompletion,
      packingAccuracyRate: overview.packingAccuracy,
      deliveryCompletionRate: overview.deliveryCompletion,
      marginEstimate: overview.marginMedian,
      inventoryAlertCount: overview.inventoryShortages,
      openTaskCount: overview.openTasks,
      overdueTaskCount: overview.overdueTasks,
      topChannel: overview.topChannel?.channel ?? null,
      topBrandId: overview.topBrand?.id ?? null,
      topLocationId: overview.topLocation?.id ?? null,
      payloadJson: {
        rangeLabel: overview.rangeLabel,
        dailyRevenue: overview.dailyRevenue,
        topProducts: overview.topProducts,
      } as Prisma.InputJsonValue,
    },
    update: {
      revenue: new Prisma.Decimal(overview.netRevenue),
      orderCount: overview.orderCount,
      averageOrderValue:
        overview.aov == null ? null : new Prisma.Decimal(overview.aov),
      customerCount: overview.newCustomerCount,
      repeatCustomerRate: overview.repeatRate,
      productionCompletionRate: overview.productionCompletion,
      packingAccuracyRate: overview.packingAccuracy,
      deliveryCompletionRate: overview.deliveryCompletion,
      marginEstimate: overview.marginMedian,
      inventoryAlertCount: overview.inventoryShortages,
      openTaskCount: overview.openTasks,
      overdueTaskCount: overview.overdueTasks,
      topChannel: overview.topChannel?.channel ?? null,
      topBrandId: overview.topBrand?.id ?? null,
      topLocationId: overview.topLocation?.id ?? null,
      payloadJson: {
        rangeLabel: overview.rangeLabel,
        dailyRevenue: overview.dailyRevenue,
        topProducts: overview.topProducts,
      } as Prisma.InputJsonValue,
    },
  });
  // suppress unused-vars warning for endOfDay (utility kept for downstream)
  void endOfDay;
}

export async function syncExecutiveInsights(
  scope: ExecutiveScope,
  overview: ExecutiveOverview,
): Promise<void> {
  const seeds = overview.insights.filter((s) => s.type !== "all_clear");
  const workspaceId = await resolveOwnerWorkspaceId(scope.userId);
  const insightScope = await executiveInsightListWhereForOwner(scope.userId);

  await prisma.$transaction(async (tx) => {
    await tx.executiveInsight.updateMany({
      where: {
        AND: [insightScope, { status: "OPEN", type: { notIn: seeds.map((s) => s.type) } }],
      },
      data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: "auto" },
    });
    for (const seed of seeds) {
      const existing = await tx.executiveInsight.findFirst({
        where: { AND: [insightScope, { type: seed.type, status: "OPEN" }] },
        select: { id: true },
      });
      if (existing) {
        await tx.executiveInsight.update({
          where: { id: existing.id },
          data: {
            severity: seed.severity,
            title: seed.title,
            description: seed.description,
            actionLabel: seed.actionLabel ?? null,
            actionRoute: seed.actionRoute ?? null,
            sourceType: seed.sourceType ?? null,
            sourceId: seed.sourceId ?? null,
            metadataJson: (seed.metadata ?? {}) as Prisma.InputJsonValue,
          },
        });
      } else {
        await tx.executiveInsight.create({
          data: {
            userId: scope.userId,
            workspaceId: workspaceId ?? undefined,
            type: seed.type,
            severity: seed.severity,
            title: seed.title,
            description: seed.description,
            actionLabel: seed.actionLabel ?? null,
            actionRoute: seed.actionRoute ?? null,
            sourceType: seed.sourceType ?? null,
            sourceId: seed.sourceId ?? null,
            metadataJson: (seed.metadata ?? {}) as Prisma.InputJsonValue,
          },
        });
      }
    }
  });
}

export async function listOpenExecutiveInsights(scope: ExecutiveScope) {
  const insightScope = await executiveInsightListWhereForOwner(scope.userId);
  return prisma.executiveInsight.findMany({
    where: { AND: [insightScope, { status: "OPEN" }] },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 25,
  });
}

export async function listRecentExecutiveSnapshots(scope: ExecutiveScope, limit = 14) {
  const where = await executiveSnapshotListWhereForOwner(scope.userId);
  return prisma.executiveSnapshot.findMany({
    where,
    orderBy: { snapshotDate: "desc" },
    take: limit,
  });
}
