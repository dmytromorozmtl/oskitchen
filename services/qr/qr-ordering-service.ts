import { randomUUID } from "crypto";

import QRCode from "qrcode";
import { OrderStatus } from "@prisma/client";

import { absoluteQrOrderUrl } from "@/lib/qr/qr-order-meta";
import { buildQrOrderSourceMetadata } from "@/lib/qr/qr-order-meta";
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

export async function processQROrder(input: ProcessQROrderInput): Promise<ProcessQROrderResult> {
  const ctx = await resolveQROrderingContext(input.storeSlug, input.tableRouteId);
  if (!ctx) return { ok: false, error: "Menu not available." };

  const lines = input.lines.filter((l) => l.quantity > 0);
  if (!lines.length) return { ok: false, error: "Cart is empty." };

  const table = await resolveRestaurantTable(ctx.ownerUserId, input.tableRouteId);
  const tableLabel = formatTableLabel(input.tableRouteId, table?.name);

  const activeCount = await prisma.order.count({
    where: {
      userId: ctx.ownerUserId,
      status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
      createdAt: { gte: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    },
  });

  const guestToken = randomUUID().slice(0, 8);
  const metadata = buildQrOrderSourceMetadata({
    storeSlug: ctx.storeSlug,
    tableRouteId: ctx.tableRouteId,
    tableLabel,
    restaurantTableId: table?.id ?? null,
  });

  const created = await createOrderViaCenter(
    { userId: ctx.ownerUserId },
    {
      orderType: "RESTAURANT_ORDER",
      statusKey: "IN_PRODUCTION",
      fulfillmentDetail: "DINE_IN",
      paymentMode: "PAY_LATER",
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

  return {
    ok: true,
    orderId: created.orderId,
    lookupToken: created.lookupToken,
    estimatedWaitMinutes: estimateWaitMinutes(activeCount),
    tableLabel,
  };
}
