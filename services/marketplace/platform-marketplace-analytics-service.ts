import { format, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";

import { toCsv } from "@/lib/import-export/csv-format";
import { prisma } from "@/lib/prisma";

export type PlatformAnalyticsSlice = {
  label: string;
  value: number;
};

export type PlatformGmvTrendPoint = {
  label: string;
  gmv: number;
  orders: number;
};

export type PlatformVendorMetrics = {
  active: number;
  new: number;
  churned: number;
  totalApproved: number;
};

export type PlatformBuyerMetrics = {
  active: number;
  new: number;
  repeat: number;
  totalBuyers: number;
};

export type PlatformMarketplaceAnalyticsModel = {
  currency: string;
  gmv30d: number;
  gmvPrev30d: number;
  orders30d: number;
  commissionRevenue30d: number;
  commissionRevenueAllTime: number;
  featuredPlacementRevenue30d: number;
  gmvTrend: PlatformGmvTrendPoint[];
  revenueByCategory: PlatformAnalyticsSlice[];
  revenueByVendorTier: PlatformAnalyticsSlice[];
  vendorMetrics: PlatformVendorMetrics;
  buyerMetrics: PlatformBuyerMetrics;
};

const GMV_STATUSES = [
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "DISPUTED",
] as const;

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function monthKey(date: Date): string {
  return format(startOfMonth(date), "yyyy-MM");
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return format(new Date(Number(year), Number(month) - 1, 1), "MMM yyyy");
}

export async function loadPlatformMarketplaceAnalytics(): Promise<PlatformMarketplaceAnalyticsModel> {
  const now = new Date();
  const periodStart = subDays(now, 30);
  const prevPeriodStart = subDays(now, 60);
  const trendStart = startOfMonth(subMonths(now, 11));
  const vendorNewSince = subDays(now, 30);
  const vendorActiveSince = subDays(now, 30);
  const vendorChurnCutoff = subDays(now, 90);

  const [
    ordersTrendWindow,
    ordersCurrentPeriod,
    ordersPrevPeriod,
    lineItemsCurrent,
    transactionsCurrent,
    transactionsAll,
    vendors,
    buyerOrderGroups,
    buyerFirstOrders,
  ] = await Promise.all([
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        status: { in: [...GMV_STATUSES] },
        createdAt: { gte: trendStart },
      },
      select: { total: true, createdAt: true },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        status: { in: [...GMV_STATUSES] },
        createdAt: { gte: periodStart },
      },
      select: { id: true, total: true, workspaceId: true, vendorId: true, createdAt: true, vendor: { select: { planTier: true } } },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        status: { in: [...GMV_STATUSES] },
        createdAt: { gte: prevPeriodStart, lt: periodStart },
      },
      select: { total: true },
    }),
    prisma.marketplacePOLineItem.findMany({
      where: {
        purchaseOrder: {
          status: { in: [...GMV_STATUSES] },
          createdAt: { gte: periodStart },
        },
      },
      select: {
        total: true,
        product: { select: { category: { select: { name: true } } } },
      },
    }),
    prisma.vendorTransaction.findMany({
      where: { createdAt: { gte: periodStart } },
      select: { commissionAmount: true, grossAmount: true, createdAt: true },
    }),
    prisma.vendorTransaction.aggregate({
      _sum: { commissionAmount: true },
    }),
    prisma.vendor.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        createdAt: true,
        planTier: true,
        orders: {
          where: { status: { in: [...GMV_STATUSES] } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.marketplacePurchaseOrder.groupBy({
      by: ["workspaceId"],
      where: { status: { in: [...GMV_STATUSES] } },
      _count: { _all: true },
      _max: { createdAt: true },
    }),
    prisma.marketplacePurchaseOrder.groupBy({
      by: ["workspaceId"],
      where: { status: { in: [...GMV_STATUSES] } },
      _min: { createdAt: true },
    }),
  ]);

  const gmvByMonth = new Map<string, { gmv: number; orders: number }>();
  for (let index = 0; index < 12; index += 1) {
    const key = monthKey(subMonths(now, 11 - index));
    gmvByMonth.set(key, { gmv: 0, orders: 0 });
  }
  for (const order of ordersTrendWindow) {
    const key = monthKey(order.createdAt);
    const bucket = gmvByMonth.get(key);
    if (!bucket) continue;
    bucket.gmv += decimalToNumber(order.total);
    bucket.orders += 1;
  }

  const gmvTrend: PlatformGmvTrendPoint[] = [...gmvByMonth.entries()].map(([key, bucket]) => ({
    label: monthLabel(key),
    gmv: round2(bucket.gmv),
    orders: bucket.orders,
  }));

  const categoryTotals = new Map<string, number>();
  for (const line of lineItemsCurrent) {
    const label = line.product.category.name;
    categoryTotals.set(label, (categoryTotals.get(label) ?? 0) + decimalToNumber(line.total));
  }
  const revenueByCategory = [...categoryTotals.entries()]
    .map(([label, value]) => ({ label, value: round2(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const tierTotals = new Map<string, number>();
  for (const order of ordersCurrentPeriod) {
    const tier = order.vendor.planTier;
    tierTotals.set(tier, (tierTotals.get(tier) ?? 0) + decimalToNumber(order.total));
  }
  const revenueByVendorTier = [...tierTotals.entries()]
    .map(([label, value]) => ({ label, value: round2(value) }))
    .sort((a, b) => b.value - a.value);

  const gmv30d = round2(ordersCurrentPeriod.reduce((sum, order) => sum + decimalToNumber(order.total), 0));
  const gmvPrev30d = round2(ordersPrevPeriod.reduce((sum, order) => sum + decimalToNumber(order.total), 0));
  const orders30d = ordersCurrentPeriod.length;

  const commissionRevenue30d = round2(
    transactionsCurrent.reduce((sum, row) => sum + decimalToNumber(row.commissionAmount), 0),
  );
  const commissionRevenueAllTime = round2(decimalToNumber(transactionsAll._sum.commissionAmount));

  const activeVendorIds = new Set(
    ordersCurrentPeriod.map((order) => order.vendorId),
  );
  const vendorMetrics: PlatformVendorMetrics = {
    totalApproved: vendors.length,
    active: vendors.filter((vendor) => activeVendorIds.has(vendor.id)).length,
    new: vendors.filter((vendor) => vendor.createdAt >= vendorNewSince).length,
    churned: vendors.filter((vendor) => {
      const lastOrderAt = vendor.orders[0]?.createdAt;
      if (!lastOrderAt) return false;
      return lastOrderAt < vendorChurnCutoff && vendor.createdAt < vendorActiveSince;
    }).length,
  };

  const activeBuyers = new Set(
    ordersCurrentPeriod.map((order) => order.workspaceId),
  );
  const firstOrderByWorkspace = new Map(
    buyerFirstOrders.map((row) => [row.workspaceId, row._min.createdAt]),
  );
  const buyerMetrics: PlatformBuyerMetrics = {
    totalBuyers: buyerOrderGroups.length,
    active: activeBuyers.size,
    new: [...firstOrderByWorkspace.entries()].filter(([, firstAt]) => firstAt && firstAt >= periodStart).length,
    repeat: buyerOrderGroups.filter((row) => row._count._all >= 2).length,
  };

  return {
    currency: "USD",
    gmv30d,
    gmvPrev30d,
    orders30d,
    commissionRevenue30d,
    commissionRevenueAllTime,
    featuredPlacementRevenue30d: 0,
    gmvTrend,
    revenueByCategory,
    revenueByVendorTier,
    vendorMetrics,
    buyerMetrics,
  };
}

export function buildPlatformMarketplaceAnalyticsExportCsv(
  model: PlatformMarketplaceAnalyticsModel,
): string {
  const sections = [
    toCsv(
      ["metric", "value"],
      [
        ["GMV (30d)", model.gmv30d],
        ["GMV (prev 30d)", model.gmvPrev30d],
        ["Orders (30d)", model.orders30d],
        ["Commission revenue (30d)", model.commissionRevenue30d],
        ["Commission revenue (all time)", model.commissionRevenueAllTime],
        ["Featured placement revenue (30d)", model.featuredPlacementRevenue30d],
        ["Vendors active", model.vendorMetrics.active],
        ["Vendors new", model.vendorMetrics.new],
        ["Vendors churned", model.vendorMetrics.churned],
        ["Buyers active", model.buyerMetrics.active],
        ["Buyers new", model.buyerMetrics.new],
        ["Buyers repeat", model.buyerMetrics.repeat],
      ],
    ),
    "",
    toCsv(
      ["month", "gmv", "orders"],
      model.gmvTrend.map((point) => [point.label, point.gmv, point.orders]),
    ),
    "",
    toCsv(
      ["category", "revenue"],
      model.revenueByCategory.map((row) => [row.label, row.value]),
    ),
    "",
    toCsv(
      ["vendor_tier", "revenue"],
      model.revenueByVendorTier.map((row) => [row.label, row.value]),
    ),
  ];

  return sections.join("\n");
}
