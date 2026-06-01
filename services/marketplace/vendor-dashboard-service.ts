import type { MarketplacePOStatus } from "@prisma/client";
import { format, startOfDay, subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export type VendorDashboardPendingAction = {
  id: string;
  kind: "order" | "stock" | "product" | "message";
  title: string;
  description: string;
  href: string;
};

export type VendorRevenuePoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type VendorTopProduct = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  revenue: number;
  unitsSold: number;
  stockQty: number;
};

export type VendorRecentOrder = {
  id: string;
  poNumber: string | null;
  status: MarketplacePOStatus;
  total: number;
  currency: string;
  buyerWorkspaceName: string | null;
  createdAt: string;
  itemCount: number;
};

export type VendorDashboardModel = {
  vendorName: string;
  currency: string;
  ordersTotal: number;
  ordersActive: number;
  ordersPending: number;
  revenueMonth: number;
  revenuePending: number;
  avgOrderValue: number;
  lowStockCount: number;
  unreadMessages: number;
  avgRating: number | null;
  reviewCount: number;
  revenueTrend: VendorRevenuePoint[];
  topProducts: VendorTopProduct[];
  recentOrders: VendorRecentOrder[];
  pendingActions: VendorDashboardPendingAction[];
};

const ACTIVE_STATUSES: MarketplacePOStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DISPUTED",
];

const PENDING_VENDOR_STATUSES: MarketplacePOStatus[] = ["SUBMITTED", "PENDING_APPROVAL"];

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export async function loadVendorDashboard(vendorId: string): Promise<VendorDashboardModel> {
  const monthStart = subDays(new Date(), 30);
  const trendStart = startOfDay(subDays(new Date(), 29));

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { companyName: true },
  });

  const [
    ordersTotal,
    ordersActive,
    ordersPending,
    revenueMonthAgg,
    revenuePendingAgg,
    avgOrderAgg,
    lowStockCountSafe,
    ratingAgg,
    ordersForTrend,
    lineItemsAggRaw,
    recentOrders,
    pendingConfirmOrders,
    pendingReviewProducts,
    lowStockProducts,
    vendorOrderIds,
  ] = await Promise.all([
    prisma.marketplacePurchaseOrder.count({
      where: { vendorId, status: { notIn: ["DRAFT", "CANCELLED"] } },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: { vendorId, status: { in: ACTIVE_STATUSES } },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: { vendorId, status: { in: PENDING_VENDOR_STATUSES } },
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId, createdAt: { gte: monthStart } },
      _sum: { grossAmount: true },
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId, status: "PENDING" },
      _sum: { netAmount: true },
    }),
    prisma.marketplacePurchaseOrder.aggregate({
      where: { vendorId, status: { notIn: ["DRAFT", "CANCELLED"] } },
      _avg: { total: true },
    }),
    prisma.vendorProduct.count({
      where: {
        vendorId,
        status: "ACTIVE",
        stockQty: { lte: 5 },
      },
    }),
    prisma.marketplaceVendorReview.aggregate({
      where: { vendorId },
      _avg: { overall: true },
      _count: { _all: true },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        vendorId,
        createdAt: { gte: trendStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      select: { createdAt: true, total: true },
    }),
    prisma.marketplacePOLineItem.groupBy({
      by: ["productId"],
      where: {
        purchaseOrder: {
          vendorId,
          createdAt: { gte: monthStart },
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
      },
      _sum: { quantity: true, total: true },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: { vendorId, status: { notIn: ["DRAFT", "CANCELLED"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        _count: { select: { items: true } },
        workspace: { select: { name: true } },
      },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: { vendorId, status: "SUBMITTED" },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, poNumber: true, total: true, currency: true },
    }),
    prisma.vendorProduct.findMany({
      where: { vendorId, status: "PENDING_REVIEW" },
      take: 3,
      select: { id: true, name: true, sku: true },
    }),
    prisma.vendorProduct.findMany({
      where: { vendorId, status: "ACTIVE", stockQty: { lte: 5 } },
      orderBy: { stockQty: "asc" },
      take: 3,
      select: { id: true, name: true, stockQty: true },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: { vendorId },
      select: { id: true },
    }),
  ]);

  const orderIds = vendorOrderIds.map((order) => order.id);
  const unreadMessages =
    orderIds.length > 0
      ? await prisma.vendorMessage.count({
          where: {
            readAt: null,
            senderType: "BUYER",
            purchaseOrderId: { in: orderIds },
          },
        })
      : 0;

  const lineItemsAgg = [...lineItemsAggRaw]
    .sort((a, b) => decimalToNumber(b._sum.total) - decimalToNumber(a._sum.total))
    .slice(0, 5);

  const productIds = lineItemsAgg.map((row) => row.productId);
  const products = productIds.length
    ? await prisma.vendorProduct.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, slug: true, stockQty: true },
      })
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));

  const trendBuckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i -= 1) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    trendBuckets.set(key, { revenue: 0, orders: 0 });
  }
  for (const order of ordersForTrend) {
    const key = format(order.createdAt, "yyyy-MM-dd");
    const bucket = trendBuckets.get(key);
    if (!bucket) continue;
    bucket.revenue += decimalToNumber(order.total);
    bucket.orders += 1;
  }

  const revenueTrend = [...trendBuckets.entries()].map(([key, bucket]) => ({
    label: format(new Date(`${key}T12:00:00`), "MMM d"),
    revenue: Math.round(bucket.revenue * 100) / 100,
    orders: bucket.orders,
  }));

  const topProducts: VendorTopProduct[] = lineItemsAgg
    .map((row) => {
      const product = productById.get(row.productId);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        revenue: decimalToNumber(row._sum.total),
        unitsSold: row._sum.quantity ?? 0,
        stockQty: product.stockQty,
      };
    })
    .filter((row): row is VendorTopProduct => row != null);

  const pendingActions: VendorDashboardPendingAction[] = [
    ...pendingConfirmOrders.map((order) => ({
      id: `order-${order.id}`,
      kind: "order" as const,
      title: "Confirm new order",
      description: `${order.poNumber ?? order.id.slice(0, 8)} · ${order.currency} ${decimalToNumber(order.total).toFixed(2)}`,
      href: `/vendor/orders/${order.id}`,
    })),
    ...lowStockProducts.map((product) => ({
      id: `stock-${product.id}`,
      kind: "stock" as const,
      title: "Low stock SKU",
      description: `${product.name} · ${product.stockQty} units left`,
      href: `/vendor/products?highlight=${product.id}`,
    })),
    ...pendingReviewProducts.map((product) => ({
      id: `product-${product.id}`,
      kind: "product" as const,
      title: "Product pending review",
      description: `${product.name} (${product.sku})`,
      href: `/vendor/products?highlight=${product.id}`,
    })),
  ].slice(0, 8);

  if (unreadMessages > 0) {
    pendingActions.unshift({
      id: "messages",
      kind: "message",
      title: "Unread buyer messages",
      description: `${unreadMessages} message${unreadMessages === 1 ? "" : "s"} need a reply`,
      href: "/vendor/orders",
    });
  }

  return {
    vendorName: vendor?.companyName ?? "Vendor",
    currency: "USD",
    ordersTotal,
    ordersActive,
    ordersPending,
    revenueMonth: decimalToNumber(revenueMonthAgg._sum.grossAmount),
    revenuePending: decimalToNumber(revenuePendingAgg._sum.netAmount),
    avgOrderValue: decimalToNumber(avgOrderAgg._avg.total),
    lowStockCount: lowStockCountSafe,
    unreadMessages,
    avgRating:
      ratingAgg._avg.overall != null
        ? Math.round(Number(ratingAgg._avg.overall) * 10) / 10
        : null,
    reviewCount: ratingAgg._count._all,
    revenueTrend,
    topProducts,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      poNumber: order.poNumber,
      status: order.status,
      total: decimalToNumber(order.total),
      currency: order.currency,
      buyerWorkspaceName: order.workspace.name,
      createdAt: order.createdAt.toISOString(),
      itemCount: order._count.items,
    })),
    pendingActions,
  };
}
