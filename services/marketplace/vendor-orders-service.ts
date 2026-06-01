import type { MarketplacePOStatus } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

import { buildMarketplaceOrderTimeline } from "@/lib/marketplace/order-status";
import type { VendorOrdersFilters } from "@/lib/marketplace/vendor-orders-filters";
import { prisma } from "@/lib/prisma";

export type VendorOrderListItem = {
  id: string;
  poNumber: string | null;
  status: MarketplacePOStatus;
  buyerWorkspaceName: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  requestedDeliveryDate: string | null;
  trackingNumber: string | null;
};

export type VendorOrderDetail = {
  id: string;
  poNumber: string | null;
  status: MarketplacePOStatus;
  buyer: { workspaceId: string; name: string };
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
  }>;
  timeline: ReturnType<typeof buildMarketplaceOrderTimeline>;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function buildVendorOrderWhere(vendorId: string, filters: VendorOrdersFilters) {
  const where: Parameters<typeof prisma.marketplacePurchaseOrder.findMany>[0]["where"] = {
    vendorId,
    status: filters.status ? filters.status : { not: "DRAFT" },
  };

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
      { workspace: { name: { contains: q, mode: "insensitive" } } },
      { items: { some: { productName: { contains: q, mode: "insensitive" } } } },
      { items: { some: { sku: { contains: q, mode: "insensitive" } } } },
    ];
  }

  return where;
}

export async function loadVendorOrders(
  vendorId: string,
  filters: VendorOrdersFilters,
): Promise<{
  items: VendorOrderListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const where = buildVendorOrderWhere(vendorId, filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.marketplacePurchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.pageSize,
      include: {
        workspace: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.marketplacePurchaseOrder.count({ where }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      poNumber: row.poNumber,
      status: row.status,
      buyerWorkspaceName: row.workspace.name,
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
  };
}

export async function loadVendorOrderDetail(
  vendorId: string,
  orderId: string,
): Promise<VendorOrderDetail | null> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: orderId, vendorId },
    include: {
      workspace: { select: { id: true, name: true } },
      items: true,
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    poNumber: order.poNumber,
    status: order.status,
    buyer: { workspaceId: order.workspace.id, name: order.workspace.name },
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
    })),
    timeline: buildMarketplaceOrderTimeline({
      status: order.status,
      createdAt: order.createdAt,
      approvedAt: order.approvedAt,
      confirmedDeliveryDate: order.confirmedDeliveryDate,
      trackingNumber: order.trackingNumber,
    }),
  };
}

async function findVendorOrder(vendorId: string, orderId: string) {
  return prisma.marketplacePurchaseOrder.findFirst({
    where: { id: orderId, vendorId },
    select: { id: true, status: true, notes: true },
  });
}

export async function bulkConfirmVendorOrders(input: {
  vendorId: string;
  orderIds: string[];
}): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  if (input.orderIds.length === 0) return { ok: false, error: "No orders selected." };

  const result = await prisma.marketplacePurchaseOrder.updateMany({
    where: {
      vendorId: input.vendorId,
      id: { in: input.orderIds },
      status: { in: ["SUBMITTED", "PENDING_APPROVAL"] },
    },
    data: { status: "CONFIRMED" },
  });

  return { ok: true, updated: result.count };
}

export async function confirmVendorOrder(input: {
  vendorId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await findVendorOrder(input.vendorId, input.orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!["SUBMITTED", "PENDING_APPROVAL"].includes(order.status)) {
    return { ok: false, error: "Order cannot be confirmed in its current status." };
  }

  await prisma.marketplacePurchaseOrder.update({
    where: { id: order.id },
    data: { status: "CONFIRMED" },
  });

  return { ok: true };
}

export async function startProcessingVendorOrder(input: {
  vendorId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await findVendorOrder(input.vendorId, input.orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "CONFIRMED") {
    return { ok: false, error: "Only confirmed orders can move to processing." };
  }

  await prisma.marketplacePurchaseOrder.update({
    where: { id: order.id },
    data: { status: "PROCESSING" },
  });

  return { ok: true };
}

export type ShipLineInput = {
  lineItemId: string;
  shippedQuantity: number;
};

export async function shipVendorOrder(input: {
  vendorId: string;
  orderId: string;
  trackingNumber: string;
  confirmedDeliveryDate?: string;
  lines?: ShipLineInput[];
}): Promise<{ ok: true; status: MarketplacePOStatus } | { ok: false; error: string }> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: input.orderId, vendorId: input.vendorId },
    include: { items: true },
  });

  if (!order) return { ok: false, error: "Order not found." };
  if (!["CONFIRMED", "PROCESSING"].includes(order.status)) {
    return { ok: false, error: "Order is not ready to ship." };
  }
  if (!input.trackingNumber.trim()) {
    return { ok: false, error: "Tracking number is required." };
  }

  const lineMap = new Map((input.lines ?? []).map((line) => [line.lineItemId, line.shippedQuantity]));
  let partial = false;

  for (const item of order.items) {
    const shipped = lineMap.get(item.id) ?? item.quantity;
    if (shipped < 0 || shipped > item.quantity) {
      return { ok: false, error: `Invalid shipped quantity for ${item.sku}.` };
    }
    if (shipped < item.quantity) partial = true;
  }

  const shipmentNote = input.lines?.length
    ? `Partial shipment ${new Date().toISOString()}: ${input.lines
        .map((line) => {
          const item = order.items.find((row) => row.id === line.lineItemId);
          return item ? `${item.sku} ${line.shippedQuantity}/${item.quantity}` : null;
        })
        .filter(Boolean)
        .join(", ")}`
    : null;

  const nextStatus: MarketplacePOStatus = partial ? "PROCESSING" : "SHIPPED";

  await prisma.marketplacePurchaseOrder.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      trackingNumber: input.trackingNumber.trim(),
      confirmedDeliveryDate: input.confirmedDeliveryDate
        ? new Date(input.confirmedDeliveryDate)
        : partial
          ? order.confirmedDeliveryDate
          : new Date(),
      notes: shipmentNote
        ? [order.notes, shipmentNote].filter(Boolean).join("\n")
        : order.notes,
    },
  });

  return { ok: true, status: nextStatus };
}

export function buildVendorPackingSlipHtml(order: VendorOrderDetail, vendorName: string): string {
  const address = order.deliveryAddress;
  const addressLines = [
    address.line1,
    address.line2,
    [address.city, address.region, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)));

  const lines = order.items
    .map(
      (line) =>
        `<tr><td>${escapeHtml(line.sku)}</td><td>${escapeHtml(line.productName)}</td><td style="text-align:right">${line.quantity}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Packing slip ${escapeHtml(order.poNumber ?? order.id)}</title>
<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#111}table{width:100%;border-collapse:collapse;margin-top:1.5rem}th,td{border-bottom:1px solid #ddd;padding:.5rem;text-align:left}h1{margin:0 0 .25rem}@media print{body{padding:0}}</style>
</head><body>
<h1>Packing slip</h1>
<p><strong>Ship from:</strong> ${escapeHtml(vendorName)}</p>
<p><strong>Ship to:</strong> ${escapeHtml(order.buyer.name)}<br>${addressLines.join("<br>")}</p>
<p><strong>PO:</strong> ${escapeHtml(order.poNumber ?? order.id)} · ${new Date(order.createdAt).toLocaleDateString()}</p>
${order.trackingNumber ? `<p><strong>Tracking:</strong> ${escapeHtml(order.trackingNumber)}</p>` : ""}
<table><thead><tr><th>SKU</th><th>Product</th><th>Qty</th></tr></thead><tbody>${lines}</tbody></table>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
