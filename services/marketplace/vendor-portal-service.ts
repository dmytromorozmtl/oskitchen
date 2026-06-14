import type { MarketplacePOStatus, MarketplaceTransactionStatus } from "@prisma/client";
import { subDays } from "date-fns";

import { buildVendorPortalHub } from "@/lib/marketplace/vendor-portal-builders";
import type {
  VendorInvoicesModel,
  VendorPortalAnalyticsHighlight,
  VendorPortalHub,
  VendorPortalInvoiceRow,
} from "@/lib/marketplace/vendor-portal-types";
import { prisma } from "@/lib/prisma";

export type { VendorPortalHub, VendorInvoicesModel } from "@/lib/marketplace/vendor-portal-types";

const ACTIVE_ORDER_STATUSES: MarketplacePOStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DISPUTED",
  "PENDING_APPROVAL",
];

const PENDING_VENDOR_STATUSES: MarketplacePOStatus[] = ["SUBMITTED", "PENDING_APPROVAL"];

const OUTSTANDING_TX_STATUSES: MarketplaceTransactionStatus[] = ["PENDING", "AVAILABLE"];

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function mapInvoiceRow(row: {
  id: string;
  purchaseOrderId: string;
  grossAmount: { toString(): string };
  netAmount: { toString(): string };
  status: MarketplaceTransactionStatus;
  createdAt: Date;
  purchaseOrder: {
    poNumber: string | null;
    currency: string;
    workspace: { name: string } | null;
  };
}): VendorPortalInvoiceRow {
  const poNumber = row.purchaseOrder.poNumber;
  return {
    id: row.id,
    purchaseOrderId: row.purchaseOrderId,
    invoiceNumber: poNumber ? `INV-${poNumber}` : `INV-${row.purchaseOrderId.slice(0, 8).toUpperCase()}`,
    buyerName: row.purchaseOrder.workspace?.name ?? "Buyer workspace",
    grossAmount: decimalToNumber(row.grossAmount),
    netAmount: decimalToNumber(row.netAmount),
    currency: row.purchaseOrder.currency,
    status: row.status,
    issuedAtIso: row.createdAt.toISOString(),
    href: `/vendor/orders/${row.purchaseOrderId}`,
  };
}

export async function loadVendorPortalHub(vendorId: string): Promise<VendorPortalHub> {
  const periodStart = subDays(new Date(), 30);

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { companyName: true },
  });
  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`);
  }

  const [
    ordersActive,
    ordersPending,
    ordersMonth,
    revenueMonthAgg,
    outstandingAgg,
    outstandingCount,
    paidOutCount,
    recentOrders,
    recentInvoiceRows,
    repeatBuyerGroups,
    ratingAgg,
  ] = await Promise.all([
    prisma.marketplacePurchaseOrder.count({
      where: { vendorId, status: { in: ACTIVE_ORDER_STATUSES } },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: { vendorId, status: { in: PENDING_VENDOR_STATUSES } },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: {
        vendorId,
        createdAt: { gte: periodStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    }),
    prisma.marketplacePurchaseOrder.aggregate({
      where: {
        vendorId,
        createdAt: { gte: periodStart },
        status: { in: ["DELIVERED", "COMPLETED", "SHIPPED", "CONFIRMED", "PROCESSING"] },
      },
      _sum: { total: true },
    }),
    prisma.vendorTransaction.aggregate({
      where: { vendorId, status: { in: OUTSTANDING_TX_STATUSES } },
      _sum: { netAmount: true },
    }),
    prisma.vendorTransaction.count({
      where: { vendorId, status: { in: OUTSTANDING_TX_STATUSES } },
    }),
    prisma.vendorTransaction.count({
      where: { vendorId, status: "PAID_OUT" },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: { vendorId, status: { not: "DRAFT" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        poNumber: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
        workspace: { select: { name: true } },
      },
    }),
    prisma.vendorTransaction.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        purchaseOrder: {
          select: {
            poNumber: true,
            currency: true,
            workspace: { select: { name: true } },
          },
        },
      },
    }),
    prisma.marketplacePurchaseOrder.groupBy({
      by: ["workspaceId"],
      where: {
        vendorId,
        createdAt: { gte: periodStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _count: { _all: true },
    }),
    prisma.marketplaceVendorReview.aggregate({
      where: { vendorId },
      _avg: { overall: true },
      _count: { _all: true },
    }),
  ]);

  const repeatBuyers = repeatBuyerGroups.filter((row) => row._count._all > 1).length;
  const totalBuyers = repeatBuyerGroups.length;
  const repeatBuyerRate =
    totalBuyers > 0 ? Math.round((repeatBuyers / totalBuyers) * 100) : 0;

  const revenue30d = decimalToNumber(revenueMonthAgg._sum.total);
  const currency = recentOrders[0]?.currency ?? "USD";

  const analyticsHighlights: VendorPortalAnalyticsHighlight[] = [
    {
      id: "revenue",
      label: "Revenue (30d)",
      value: new Intl.NumberFormat("en-US", { style: "currency", currency }).format(revenue30d),
      detail: `${ordersMonth} purchase orders in the last 30 days`,
    },
    {
      id: "repeat",
      label: "Repeat buyer rate",
      value: `${repeatBuyerRate}%`,
      detail: `${repeatBuyers} of ${totalBuyers} buyers reordered this month`,
    },
    {
      id: "rating",
      label: "Average rating",
      value:
        ratingAgg._avg.overall != null
          ? `${Math.round(ratingAgg._avg.overall * 10) / 10} / 5`
          : "—",
      detail: `${ratingAgg._count._all} marketplace reviews`,
    },
  ];

  return buildVendorPortalHub({
    vendorId,
    vendorName: vendor.companyName,
    currency,
    ordersActive,
    ordersPending,
    ordersMonth,
    outstandingCount,
    outstandingAmount: decimalToNumber(outstandingAgg._sum.netAmount),
    paidOutCount,
    revenue30d,
    orders30d: ordersMonth,
    repeatBuyerRate,
    avgRating: ratingAgg._avg.overall,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      poNumber: order.poNumber,
      buyerName: order.workspace?.name ?? "Buyer workspace",
      total: decimalToNumber(order.total),
      currency: order.currency,
      status: order.status,
      createdAtIso: order.createdAt.toISOString(),
    })),
    recentInvoices: recentInvoiceRows.map(mapInvoiceRow),
    analyticsHighlights,
  });
}

export async function loadVendorInvoices(
  vendorId: string,
  page = 1,
  pageSize = 20,
): Promise<VendorInvoicesModel> {
  const skip = (page - 1) * pageSize;

  const [outstandingAgg, paidAgg, pendingCount, availableCount, paidCount, total, rows] =
    await Promise.all([
      prisma.vendorTransaction.aggregate({
        where: { vendorId, status: { in: OUTSTANDING_TX_STATUSES } },
        _sum: { netAmount: true },
      }),
      prisma.vendorTransaction.aggregate({
        where: { vendorId, status: "PAID_OUT" },
        _sum: { netAmount: true },
      }),
      prisma.vendorTransaction.count({ where: { vendorId, status: "PENDING" } }),
      prisma.vendorTransaction.count({ where: { vendorId, status: "AVAILABLE" } }),
      prisma.vendorTransaction.count({ where: { vendorId, status: "PAID_OUT" } }),
      prisma.vendorTransaction.count({ where: { vendorId } }),
      prisma.vendorTransaction.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          purchaseOrder: {
            select: {
              poNumber: true,
              currency: true,
              workspace: { select: { name: true } },
            },
          },
        },
      }),
    ]);

  const currency = rows[0]?.purchaseOrder.currency ?? "USD";

  return {
    currency,
    outstandingAmount: decimalToNumber(outstandingAgg._sum.netAmount),
    paidOutAmount: decimalToNumber(paidAgg._sum.netAmount),
    pendingCount,
    availableCount,
    paidCount,
    invoices: rows.map(mapInvoiceRow),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
