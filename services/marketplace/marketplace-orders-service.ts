import type { MarketplacePOStatus } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

import { buildMarketplaceOrderTimeline } from "@/lib/marketplace/order-status";
import type { MarketplaceOrdersFilters } from "@/lib/marketplace/orders-filters";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { onOrderReceived } from "@/services/marketplace/inventory-integration-service";

export type MarketplaceOrderListItem = {
  id: string;
  poNumber: string | null;
  status: MarketplacePOStatus;
  vendorId: string;
  vendorName: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  requestedDeliveryDate: string | null;
  trackingNumber: string | null;
};

export type MarketplaceOrderDetail = {
  id: string;
  poNumber: string | null;
  status: MarketplacePOStatus;
  vendor: { id: string; companyName: string };
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentMethod: string;
  notes: string | null;
  deliveryAddress: Record<string, unknown>;
  requestedDeliveryDate: string | null;
  confirmedDeliveryDate: string | null;
  trackingNumber: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
    receivedQuantity: number;
    returnedQuantity: number;
  }>;
  timeline: ReturnType<typeof buildMarketplaceOrderTimeline>;
  dispute: { id: string; status: string; reason: string } | null;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function buildOrderWhere(workspaceId: string, filters: MarketplaceOrdersFilters) {
  const where: Parameters<typeof prisma.marketplacePurchaseOrder.findMany>[0]["where"] = {
    workspaceId,
  };

  if (filters.tab === "po") {
    where.status = { notIn: ["DRAFT"] };
    where.poNumber = { not: null };
  } else {
    where.status = filters.status ? filters.status : { not: "DRAFT" };
  }

  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = startOfDay(new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      where.createdAt.lte = endOfDay(new Date(filters.dateTo));
    }
  }

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { poNumber: { contains: q, mode: "insensitive" } },
      { vendor: { companyName: { contains: q, mode: "insensitive" } } },
      { items: { some: { productName: { contains: q, mode: "insensitive" } } } },
    ];
  }

  return where;
}

export async function loadMarketplaceOrders(
  workspaceId: string,
  filters: MarketplaceOrdersFilters,
): Promise<{
  items: MarketplaceOrderListItem[];
  total: number;
  page: number;
  totalPages: number;
  vendors: Array<{ id: string; companyName: string }>;
}> {
  const where = buildOrderWhere(workspaceId, filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total, vendors] = await Promise.all([
    prisma.marketplacePurchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.pageSize,
      include: {
        vendor: { select: { id: true, companyName: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.marketplacePurchaseOrder.count({ where }),
    prisma.marketplacePurchaseOrder.findMany({
      where: { workspaceId, status: { not: "DRAFT" } },
      distinct: ["vendorId"],
      select: { vendor: { select: { id: true, companyName: true } } },
      orderBy: { vendor: { companyName: "asc" } },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      poNumber: row.poNumber,
      status: row.status,
      vendorId: row.vendorId,
      vendorName: row.vendor.companyName,
      total: decimalToNumber(row.total),
      currency: row.currency,
      itemCount: row._count.items,
      createdAt: row.createdAt.toISOString(),
      requestedDeliveryDate: row.requestedDeliveryDate?.toISOString() ?? null,
      trackingNumber: row.trackingNumber,
    })),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    vendors: vendors.map((entry) => entry.vendor),
  };
}

export async function loadMarketplaceOrderDetail(
  workspaceId: string,
  orderId: string,
): Promise<MarketplaceOrderDetail | null> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: orderId, workspaceId },
    include: {
      vendor: { select: { id: true, companyName: true } },
      items: true,
      dispute: { select: { id: true, status: true, reason: true } },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    poNumber: order.poNumber,
    status: order.status,
    vendor: order.vendor,
    subtotal: decimalToNumber(order.subtotal),
    deliveryFee: decimalToNumber(order.deliveryFee),
    total: decimalToNumber(order.total),
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    deliveryAddress: order.deliveryAddress as Record<string, unknown>,
    requestedDeliveryDate: order.requestedDeliveryDate?.toISOString() ?? null,
    confirmedDeliveryDate: order.confirmedDeliveryDate?.toISOString() ?? null,
    trackingNumber: order.trackingNumber,
    approvedAt: order.approvedAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((line) => ({
      id: line.id,
      productId: line.productId,
      productName: line.productName,
      sku: line.sku,
      quantity: line.quantity,
      unitPrice: decimalToNumber(line.unitPrice),
      total: decimalToNumber(line.total),
      receivedQuantity: line.receivedQuantity,
      returnedQuantity: line.returnedQuantity,
    })),
    timeline: buildMarketplaceOrderTimeline({
      status: order.status,
      createdAt: order.createdAt,
      approvedAt: order.approvedAt,
      confirmedDeliveryDate: order.confirmedDeliveryDate,
      trackingNumber: order.trackingNumber,
    }),
    dispute: order.dispute
      ? {
          id: order.dispute.id,
          status: order.dispute.status,
          reason: order.dispute.reason,
        }
      : null,
  };
}

export async function approveMarketplaceOrder(input: {
  workspaceId: string;
  orderId: string;
  approvedById: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: input.orderId, workspaceId: input.workspaceId },
    select: { id: true, status: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "PENDING_APPROVAL") {
    return { ok: false, error: "Order is not awaiting approval." };
  }

  await prisma.marketplacePurchaseOrder.update({
    where: { id: order.id },
    data: {
      status: "SUBMITTED",
      approvedById: input.approvedById,
      approvedAt: new Date(),
    },
  });

  return { ok: true };
}

export async function cancelMarketplaceOrder(input: {
  workspaceId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: input.orderId, workspaceId: input.workspaceId },
    select: { id: true, status: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (["COMPLETED", "CANCELLED", "SHIPPED", "DELIVERED"].includes(order.status)) {
    return { ok: false, error: "This order can no longer be cancelled." };
  }

  await prisma.marketplacePurchaseOrder.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
  });

  return { ok: true };
}

export type ReceiveLineInput = {
  lineItemId: string;
  receivedQuantity: number;
};

export async function receiveMarketplaceOrder(input: {
  workspaceId: string;
  orderId: string;
  lines: ReceiveLineInput[];
}): Promise<{ ok: true; status: MarketplacePOStatus } | { ok: false; error: string }> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: input.orderId, workspaceId: input.workspaceId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (!["SHIPPED", "DELIVERED", "PROCESSING", "CONFIRMED"].includes(order.status)) {
    return { ok: false, error: "Order is not ready for receiving." };
  }

  const byId = new Map(input.lines.map((line) => [line.lineItemId, line.receivedQuantity]));

  await prisma.$transaction(async (tx) => {
    for (const line of order.items) {
      const qty = byId.get(line.id);
      if (qty == null) continue;
      if (qty < 0 || qty > line.quantity) {
        throw new Error(`Invalid received quantity for ${line.sku}.`);
      }
      await tx.marketplacePOLineItem.update({
        where: { id: line.id },
        data: { receivedQuantity: qty },
      });
    }

    const updatedItems = await tx.marketplacePOLineItem.findMany({
      where: { purchaseOrderId: order.id },
    });
    const fullyReceived = updatedItems.every((line) => line.receivedQuantity >= line.quantity);
    const partiallyReceived = updatedItems.some((line) => line.receivedQuantity > 0);

    await tx.marketplacePurchaseOrder.update({
      where: { id: order.id },
      data: {
        status: fullyReceived ? "COMPLETED" : partiallyReceived ? "DELIVERED" : order.status,
        confirmedDeliveryDate: fullyReceived || partiallyReceived ? new Date() : order.confirmedDeliveryDate,
      },
    });
  });

  const refreshed = await prisma.marketplacePurchaseOrder.findUnique({
    where: { id: order.id },
    select: { status: true },
  });

  if (refreshed && ["COMPLETED", "DELIVERED"].includes(refreshed.status)) {
    try {
      await onOrderReceived({
        workspaceId: input.workspaceId,
        orderId: order.id,
      });
    } catch (error) {
      logger.error("[marketplace] inventory onOrderReceived failed", error);
    }
  }

  return { ok: true, status: refreshed!.status };
}

export function buildMarketplaceInvoiceHtml(order: MarketplaceOrderDetail): string {
  const lines = order.items
    .map(
      (line) =>
        `<tr><td>${escapeHtml(line.sku)}</td><td>${escapeHtml(line.productName)}</td><td style="text-align:right">${line.quantity}</td><td style="text-align:right">${line.unitPrice.toFixed(2)}</td><td style="text-align:right">${line.total.toFixed(2)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>PO ${escapeHtml(order.poNumber ?? order.id)}</title>
<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#111}table{width:100%;border-collapse:collapse;margin-top:1.5rem}th,td{border-bottom:1px solid #ddd;padding:.5rem;text-align:left}h1{margin:0 0 .25rem}@media print{body{padding:0}}</style>
</head><body>
<h1>Marketplace purchase order</h1>
<p><strong>${escapeHtml(order.vendor.companyName)}</strong> · ${escapeHtml(order.poNumber ?? order.id)}</p>
<p>Status: ${escapeHtml(order.status)} · Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
<table><thead><tr><th>SKU</th><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${lines}</tbody></table>
<p style="margin-top:1rem"><strong>Subtotal:</strong> ${order.currency} ${order.subtotal.toFixed(2)}<br>
<strong>Delivery:</strong> ${order.currency} ${order.deliveryFee.toFixed(2)}<br>
<strong>Total:</strong> ${order.currency} ${order.total.toFixed(2)}</p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
