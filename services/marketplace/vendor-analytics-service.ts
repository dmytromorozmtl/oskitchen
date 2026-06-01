import type { MarketplacePOStatus } from "@prisma/client";
import { format, startOfDay, subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export type VendorSalesTrendPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type VendorConversionStep = {
  key: string;
  label: string;
  count: number;
  ratePercent: number | null;
};

export type VendorProductPerformanceRow = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  revenue: number;
  unitsSold: number;
  orderCount: number;
  conversionRate: number;
  stockQty: number;
  status: string;
};

export type VendorCustomerSegment = {
  segment: string;
  buyers: number;
  orders: number;
  revenue: number;
  sharePercent: number;
};

export type VendorMarketplaceInsight = {
  id: string;
  title: string;
  detail: string;
  tone: "neutral" | "positive" | "warning";
};

export type VendorInventoryForecastRow = {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  avgDailySales: number;
  daysUntilStockout: number | null;
  suggestedReorderQty: number;
  urgency: "low" | "medium" | "high";
};

export type VendorAnalyticsModel = {
  currency: string;
  revenue30d: number;
  orders30d: number;
  avgOrderValue: number;
  repeatBuyerRate: number;
  avgRating: number | null;
  salesTrend: VendorSalesTrendPoint[];
  conversionFunnel: VendorConversionStep[];
  productPerformance: VendorProductPerformanceRow[];
  customerSegments: VendorCustomerSegment[];
  marketplaceInsights: VendorMarketplaceInsight[];
  inventoryForecast: VendorInventoryForecastRow[];
};

const COMPLETED_STATUSES: MarketplacePOStatus[] = ["DELIVERED", "COMPLETED"];
const CONFIRMED_PLUS: MarketplacePOStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function loadVendorAnalytics(vendorId: string): Promise<VendorAnalyticsModel> {
  const trendStart = startOfDay(subDays(new Date(), 29));
  const periodStart = subDays(new Date(), 30);

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { commissionRate: true, planTier: true },
  });

  const [
    orders30d,
    activeProducts,
    ratingAgg,
    lineItemsAgg,
    ordersByWorkspace,
    lowStockProducts,
    allOrdersCount,
  ] = await Promise.all([
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        vendorId,
        createdAt: { gte: periodStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        workspaceId: true,
      },
    }),
    prisma.vendorProduct.count({
      where: { vendorId, status: "ACTIVE" },
    }),
    prisma.marketplaceVendorReview.aggregate({
      where: { vendorId },
      _avg: { overall: true },
      _count: { _all: true },
    }),
    prisma.marketplacePOLineItem.groupBy({
      by: ["productId"],
      where: {
        purchaseOrder: {
          vendorId,
          createdAt: { gte: periodStart },
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
      },
      _sum: { quantity: true, total: true },
      _count: { _all: true },
    }),
    prisma.marketplacePurchaseOrder.groupBy({
      by: ["workspaceId"],
      where: {
        vendorId,
        createdAt: { gte: periodStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.vendorProduct.findMany({
      where: { vendorId, status: "ACTIVE" },
      select: { id: true, name: true, sku: true, slug: true, stockQty: true, status: true },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: { vendorId, status: { notIn: ["DRAFT", "CANCELLED"] } },
    }),
  ]);

  const revenue30d = orders30d.reduce((sum, order) => sum + decimalToNumber(order.total), 0);
  const orders30dCount = orders30d.length;
  const avgOrderValue = orders30dCount > 0 ? revenue30d / orders30dCount : 0;

  const trendBuckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i -= 1) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    trendBuckets.set(key, { revenue: 0, orders: 0 });
  }
  for (const order of orders30d) {
    const key = format(order.createdAt, "yyyy-MM-dd");
    const bucket = trendBuckets.get(key);
    if (!bucket) continue;
    bucket.revenue += decimalToNumber(order.total);
    bucket.orders += 1;
  }

  const salesTrend = [...trendBuckets.entries()].map(([key, bucket]) => ({
    label: format(new Date(`${key}T12:00:00`), "MMM d"),
    revenue: round2(bucket.revenue),
    orders: bucket.orders,
  }));

  const ordersSubmitted = orders30dCount;
  const ordersConfirmed = orders30d.filter((order) => CONFIRMED_PLUS.includes(order.status)).length;
  const ordersCompleted = orders30d.filter((order) => COMPLETED_STATUSES.includes(order.status)).length;

  const conversionFunnel: VendorConversionStep[] = [
    { key: "catalog", label: "Active catalog SKUs", count: activeProducts, ratePercent: null },
    {
      key: "submitted",
      label: "Orders placed (30d)",
      count: ordersSubmitted,
      ratePercent: activeProducts > 0 ? round2((ordersSubmitted / activeProducts) * 100) : null,
    },
    {
      key: "confirmed",
      label: "Orders confirmed+",
      count: ordersConfirmed,
      ratePercent: ordersSubmitted > 0 ? round2((ordersConfirmed / ordersSubmitted) * 100) : null,
    },
    {
      key: "completed",
      label: "Orders completed",
      count: ordersCompleted,
      ratePercent: ordersConfirmed > 0 ? round2((ordersCompleted / ordersConfirmed) * 100) : null,
    },
  ];

  const productIds = lineItemsAgg.map((row) => row.productId);
  const products = productIds.length
    ? await prisma.vendorProduct.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, slug: true, stockQty: true, status: true },
      })
    : [];
  const productById = new Map(products.map((product) => [product.id, product]));

  const productPerformance: VendorProductPerformanceRow[] = [...lineItemsAgg]
    .sort((a, b) => decimalToNumber(b._sum.total) - decimalToNumber(a._sum.total))
    .slice(0, 15)
    .map((row) => {
      const product = productById.get(row.productId);
      if (!product) return null;
      const orderCount = row._count._all;
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        revenue: decimalToNumber(row._sum.total),
        unitsSold: row._sum.quantity ?? 0,
        orderCount,
        conversionRate: allOrdersCount > 0 ? round2((orderCount / allOrdersCount) * 100) : 0,
        stockQty: product.stockQty,
        status: product.status,
      };
    })
    .filter((row): row is VendorProductPerformanceRow => row != null);

  const workspaceIds = ordersByWorkspace.map((row) => row.workspaceId);
  const workspaces = workspaceIds.length
    ? await prisma.workspace.findMany({
        where: { id: { in: workspaceIds } },
        select: { id: true, type: true, name: true },
      })
    : [];
  const workspaceById = new Map(workspaces.map((workspace) => [workspace.id, workspace]));

  const priorBuyers = workspaceIds.length
    ? await prisma.marketplacePurchaseOrder.findMany({
        where: {
          vendorId,
          workspaceId: { in: workspaceIds },
          createdAt: { lt: periodStart },
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
        distinct: ["workspaceId"],
        select: { workspaceId: true },
      })
    : [];
  const priorBuyerSet = new Set(priorBuyers.map((row) => row.workspaceId));

  const segmentMap = new Map<string, { buyers: Set<string>; orders: number; revenue: number }>();
  for (const row of ordersByWorkspace) {
    const workspace = workspaceById.get(row.workspaceId);
    const isRepeat = priorBuyerSet.has(row.workspaceId);
    const segment = isRepeat ? "Repeat buyers" : "New buyers";
    const typeSegment = workspace?.type ?? "BUSINESS";
    for (const key of [segment, `${typeSegment} workspaces`]) {
      const bucket = segmentMap.get(key) ?? { buyers: new Set<string>(), orders: 0, revenue: 0 };
      bucket.buyers.add(row.workspaceId);
      bucket.orders += row._count._all;
      bucket.revenue += decimalToNumber(row._sum.total);
      segmentMap.set(key, bucket);
    }
  }

  const customerSegments: VendorCustomerSegment[] = [...segmentMap.entries()]
    .map(([segment, bucket]) => ({
      segment,
      buyers: bucket.buyers.size,
      orders: bucket.orders,
      revenue: round2(bucket.revenue),
      sharePercent: revenue30d > 0 ? round2((bucket.revenue / revenue30d) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const repeatBuyers = ordersByWorkspace.filter((row) => priorBuyerSet.has(row.workspaceId)).length;
  const repeatBuyerRate =
    ordersByWorkspace.length > 0 ? round2((repeatBuyers / ordersByWorkspace.length) * 100) : 0;

  const avgRating =
    ratingAgg._avg.overall != null ? round2(Number(ratingAgg._avg.overall)) : null;

  const marketplaceInsights: VendorMarketplaceInsight[] = [];

  if (avgRating != null && avgRating >= 4.5) {
    marketplaceInsights.push({
      id: "rating-high",
      title: "Strong buyer satisfaction",
      detail: `Average rating ${avgRating}/5 across ${ratingAgg._count._all} reviews.`,
      tone: "positive",
    });
  } else if (avgRating != null && avgRating < 4) {
    marketplaceInsights.push({
      id: "rating-low",
      title: "Review score needs attention",
      detail: `Average rating ${avgRating}/5 — check delivery accuracy and product descriptions.`,
      tone: "warning",
    });
  }

  marketplaceInsights.push({
    id: "plan-tier",
    title: `${vendor?.planTier ?? "FREE"} plan`,
    detail:
      vendor?.planTier === "FREE"
        ? "Upgrade to GROWTH for lower commission and featured placement slots."
        : "Your plan includes marketplace analytics and priority catalog placement.",
    tone: "neutral",
  });

  if (repeatBuyerRate >= 40) {
    marketplaceInsights.push({
      id: "repeat-strong",
      title: "Healthy repeat purchase rate",
      detail: `${repeatBuyerRate}% of active buyers in the last 30 days are returning customers.`,
      tone: "positive",
    });
  }

  if (ordersConfirmed > 0 && ordersCompleted / ordersConfirmed < 0.7) {
    marketplaceInsights.push({
      id: "fulfillment-gap",
      title: "Fulfillment completion gap",
      detail: "Confirm and ship orders faster to improve buyer retention and ratings.",
      tone: "warning",
    });
  }

  const salesByProduct = new Map(
    lineItemsAgg.map((row) => [row.productId, (row._sum.quantity ?? 0) / 30]),
  );

  const inventoryForecast: VendorInventoryForecastRow[] = lowStockProducts
    .map((product) => {
      const avgDailySales = salesByProduct.get(product.id) ?? 0;
      const daysUntilStockout =
        avgDailySales > 0 ? Math.floor(product.stockQty / avgDailySales) : null;
      const suggestedReorderQty = Math.max(
        Math.ceil(avgDailySales * 14),
        product.stockQty <= 5 ? 20 : 10,
      );
      let urgency: VendorInventoryForecastRow["urgency"] = "low";
      if (daysUntilStockout != null && daysUntilStockout <= 7) urgency = "high";
      else if (daysUntilStockout != null && daysUntilStockout <= 14) urgency = "medium";
      else if (product.stockQty <= 5) urgency = "medium";

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        stockQty: product.stockQty,
        avgDailySales: round2(avgDailySales),
        daysUntilStockout,
        suggestedReorderQty,
        urgency,
      };
    })
    .sort((a, b) => {
      const aDays = a.daysUntilStockout ?? 999;
      const bDays = b.daysUntilStockout ?? 999;
      return aDays - bDays;
    })
    .slice(0, 10);

  return {
    currency: "USD",
    revenue30d: round2(revenue30d),
    orders30d: orders30dCount,
    avgOrderValue: round2(avgOrderValue),
    repeatBuyerRate,
    avgRating,
    salesTrend,
    conversionFunnel,
    productPerformance,
    customerSegments,
    marketplaceInsights,
    inventoryForecast,
  };
}

export function buildVendorAnalyticsExportCsv(model: VendorAnalyticsModel): string {
  const lines = [
    "section,metric,value",
    `summary,revenue_30d,${model.revenue30d}`,
    `summary,orders_30d,${model.orders30d}`,
    `summary,avg_order_value,${model.avgOrderValue}`,
    `summary,repeat_buyer_rate,${model.repeatBuyerRate}`,
    "",
    "product,sku,revenue,units,orders,conversion_rate",
    ...model.productPerformance.map(
      (row) =>
        `${escapeCsv(row.name)},${escapeCsv(row.sku)},${row.revenue},${row.unitsSold},${row.orderCount},${row.conversionRate}`,
    ),
  ];
  return lines.join("\n");
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
