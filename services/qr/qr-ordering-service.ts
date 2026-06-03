import { randomUUID } from "crypto";

import QRCode from "qrcode";
import { OrderStatus } from "@prisma/client";

import { absoluteQrOrderUrl } from "@/lib/qr/qr-order-meta";
import { buildQrOrderSourceMetadata } from "@/lib/qr/qr-order-meta";
import {
  calculateSplitBillShare,
  type QrTableCheckoutStyle,
  type QrTableSelfServiceMetadata,
} from "@/lib/qr/table-self-service";
import { parseQrTableSelfServiceMetadata } from "@/lib/qr/table-self-service";
import { loadStorefrontMenuCatalogForPage } from "@/lib/storefront/menu-page-data";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { prisma } from "@/lib/prisma";
import { restaurantTableListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { createOrderViaCenter } from "@/services/orders/order-creation-service";
import type { StorefrontCatalogProduct } from "@/lib/storefront/catalog-types";

export type QrOrderingContext = {
  storeSlug: string;
  tableRouteId: string;
  tableLabel: string;
  restaurantName: string;
  currency: string;
  ownerUserId: string;
  products: StorefrontCatalogProduct[];
  categories: string[];
};

export type CreateQRCodeResult = {
  url: string;
  qrDataUrl: string;
  tableRouteId: string;
};

export type ProcessQROrderInput = {
  storeSlug: string;
  tableRouteId: string;
  lines: { productId: string; quantity: number }[];
  customerName?: string;
  checkoutStyle?: QrTableCheckoutStyle;
  splitGuests?: number;
};

export type ProcessQROrderResultExtended = ProcessQROrderResult & {
  paymentStatus?: string;
  checkoutStyle?: QrTableCheckoutStyle;
  orderTotal?: number;
  splitShareAmount?: number;
  splitGuests?: number;
};

export type ProcessQROrderResult =
  | {
      ok: true;
      orderId: string;
      lookupToken: string;
      estimatedWaitMinutes: number;
      tableLabel: string;
    }
  | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatTableLabel(tableRouteId: string, tableName?: string | null): string {
  if (tableName?.trim()) return tableName.trim();
  const decoded = decodeURIComponent(tableRouteId).trim();
  return decoded.match(/^\d+$/) ? `Table ${decoded}` : decoded;
}

export async function resolveRestaurantTable(
  ownerUserId: string,
  tableRouteId: string,
): Promise<{ id: string; name: string } | null> {
  const scope = await restaurantTableListWhereForOwner(ownerUserId);
  const decoded = decodeURIComponent(tableRouteId).trim();
  if (UUID_RE.test(decoded)) {
    const row = await prisma.restaurantTable.findFirst({
      where: { AND: [scope, { id: decoded }] },
      select: { id: true, name: true },
    });
    return row;
  }
  const byName = await prisma.restaurantTable.findFirst({
    where: { AND: [scope, { name: decoded }] },
    select: { id: true, name: true },
  });
  if (byName) return byName;
  return prisma.restaurantTable.findFirst({
    where: { AND: [scope, { name: { equals: decoded, mode: "insensitive" } }] },
    select: { id: true, name: true },
  });
}

export async function resolveQROrderingContext(
  storeSlug: string,
  tableRouteId: string,
): Promise<QrOrderingContext | null> {
  const sf = await getStorefrontForPublicFromRequest(storeSlug, null);
  if (!sf?.published || !sf.enabled) return null;

  const catalogPage = await loadStorefrontMenuCatalogForPage(storeSlug);
  if (!catalogPage) return null;

  const ownerUserId = sf.userId;

  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { businessName: true },
  });

  const table = await resolveRestaurantTable(ownerUserId, tableRouteId);
  const tableLabel = formatTableLabel(tableRouteId, table?.name);

  const categories = ["Menu"];

  return {
    storeSlug: catalogPage.effectiveStoreSlug,
    tableRouteId: decodeURIComponent(tableRouteId).trim(),
    tableLabel,
    restaurantName:
      settings?.businessName?.trim() ||
      catalogPage.effectiveStoreSlug.replace(/-/g, " "),
    currency: catalogPage.currency,
    ownerUserId,
    products: catalogPage.catalog.products.filter((p) => p.canAddToCart),
    categories,
  };
}

export async function createQRCode(
  ownerUserId: string,
  input: { storeSlug: string; tableRouteId: string },
): Promise<CreateQRCodeResult | { error: string }> {
  const storefront = await prisma.storefrontSettings.findFirst({
    where: { userId: ownerUserId, published: true, enabled: true },
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { storeSlug: true },
  });
  if (!storefront?.storeSlug || storefront.storeSlug !== input.storeSlug) {
    return { error: "Published storefront not found for this slug." };
  }

  const tableRouteId = input.tableRouteId.trim();
  if (!tableRouteId) return { error: "Table id is required." };

  const url = absoluteQrOrderUrl(storefront.storeSlug, tableRouteId);
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 320,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return { url, qrDataUrl, tableRouteId };
}

function estimateWaitMinutes(activeKitchenCount: number): number {
  const base = 12;
  const extra = Math.min(activeKitchenCount * 2, 18);
  return base + extra;
}

function buildTableSelfServiceMetadata(input: {
  storeSlug: string;
  tableRouteId: string;
  tableLabel: string;
  restaurantTableId?: string | null;
  checkoutStyle: QrTableCheckoutStyle;
  orderTotal: number;
  currency: string;
  splitGuests?: number;
}): QrTableSelfServiceMetadata {
  const base = buildQrOrderSourceMetadata({
    storeSlug: input.storeSlug,
    tableRouteId: input.tableRouteId,
    tableLabel: input.tableLabel,
    restaurantTableId: input.restaurantTableId,
  }) as QrTableSelfServiceMetadata;

  base.qr = {
    ...base.qr,
    channel: "table_qr",
    selfService: true,
    checkoutStyle: input.checkoutStyle,
  };

  if (input.checkoutStyle === "split" && input.splitGuests) {
    base.split = {
      guests: input.splitGuests,
      shareAmount: calculateSplitBillShare(input.orderTotal, input.splitGuests),
      paidShares: 0,
      currency: input.currency,
    };
  }

  return base;
}

function paymentModeForCheckout(style: QrTableCheckoutStyle): "PAY_LATER" | "CASH" {
  return style === "pay_now" ? "CASH" : "PAY_LATER";
}

export async function processQROrder(
  input: ProcessQROrderInput,
): Promise<ProcessQROrderResultExtended> {
  const ctx = await resolveQROrderingContext(input.storeSlug, input.tableRouteId);
  if (!ctx) return { ok: false, error: "Menu not available." };

  const lines = input.lines.filter((l) => l.quantity > 0);
  if (!lines.length) return { ok: false, error: "Cart is empty." };

  const checkoutStyle: QrTableCheckoutStyle = input.checkoutStyle ?? "pay_later";
  const splitGuests =
    checkoutStyle === "split"
      ? Math.max(2, Math.min(20, Math.round(input.splitGuests ?? 2)))
      : undefined;

  const table = await resolveRestaurantTable(ctx.ownerUserId, input.tableRouteId);
  const tableLabel = formatTableLabel(input.tableRouteId, table?.name);

  let orderTotal = 0;
  for (const line of lines) {
    const product = ctx.products.find((p) => p.id === line.productId);
    if (product) orderTotal += Number(product.price) * line.quantity;
  }
  orderTotal = Math.round(orderTotal * 100) / 100;

  const activeCount = await prisma.order.count({
    where: {
      userId: ctx.ownerUserId,
      status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
      createdAt: { gte: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    },
  });

  const guestToken = randomUUID().slice(0, 8);
  const metadata = buildTableSelfServiceMetadata({
    storeSlug: ctx.storeSlug,
    tableRouteId: ctx.tableRouteId,
    tableLabel,
    restaurantTableId: table?.id ?? null,
    checkoutStyle,
    orderTotal,
    currency: ctx.currency,
    splitGuests,
  });

  const created = await createOrderViaCenter(
    { userId: ctx.ownerUserId },
    {
      orderType: "RESTAURANT_ORDER",
      statusKey: "IN_PRODUCTION",
      fulfillmentDetail: "DINE_IN",
      paymentMode: paymentModeForCheckout(checkoutStyle),
      customerName: input.customerName?.trim() || `Table ${tableLabel.replace(/^Table\s*/i, "")}`,
      customerEmail: `qr-guest-${guestToken}@table.local`,
      channelProvider: "qr",
      creationSourceOverride: "qr_table",
      sourceMetadataJson: JSON.stringify(metadata),
      lines: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    },
  );

  if (!created.ok) return { ok: false, error: created.error };

  if (table?.id) {
    await prisma.order.update({
      where: { id: created.orderId },
      data: { tableId: table.id },
    });
  }

  const order = await prisma.order.findUnique({
    where: { id: created.orderId },
    select: { paymentStatus: true },
  });

  return {
    ok: true,
    orderId: created.orderId,
    lookupToken: created.lookupToken,
    estimatedWaitMinutes: estimateWaitMinutes(activeCount),
    tableLabel,
    paymentStatus: order?.paymentStatus ?? (checkoutStyle === "pay_now" ? "PAID" : "UNPAID"),
    checkoutStyle,
    orderTotal,
    splitShareAmount: metadata.split?.shareAmount,
    splitGuests: metadata.split?.guests,
  };
}

export async function payQrTableSplitShare(input: {
  orderId: string;
  lookupToken: string;
  storeSlug: string;
}): Promise<
  | { ok: true; paidShares: number; guests: number; fullyPaid: boolean; paymentStatus: string }
  | { ok: false; error: string }
> {
  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      lookupToken: input.lookupToken,
    },
    select: {
      id: true,
      userId: true,
      sourceMetadataJson: true,
      paymentStatus: true,
    },
  });

  if (!order) return { ok: false, error: "Order not found." };

  const meta = parseQrTableSelfServiceMetadata(order.sourceMetadataJson);
  if (meta?.qr?.storeSlug && meta.qr.storeSlug !== input.storeSlug) {
    return { ok: false, error: "Order not found." };
  }
  if (!meta?.split) return { ok: false, error: "This order is not a split-bill check." };
  if (meta.split.paidShares >= meta.split.guests) {
    return { ok: false, error: "This check is already fully paid." };
  }

  const nextPaid = meta.split.paidShares + 1;
  const fullyPaid = nextPaid >= meta.split.guests;
  const updatedMeta: QrTableSelfServiceMetadata = {
    ...meta,
    split: { ...meta.split, paidShares: nextPaid },
  };

  await prisma.order.update({
    where: { id: order.id },
    data: {
      sourceMetadataJson: JSON.stringify(updatedMeta),
      paymentStatus: fullyPaid ? "PAID" : "PARTIAL",
      paymentMode: fullyPaid ? "CASH" : "PAY_LATER",
    },
  });

  return {
    ok: true,
    paidShares: nextPaid,
    guests: meta.split.guests,
    fullyPaid,
    paymentStatus: fullyPaid ? "PAID" : "PARTIAL",
  };
}
