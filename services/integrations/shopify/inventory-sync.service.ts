import { IntegrationProvider } from "@prisma/client";

import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { prisma } from "@/lib/prisma";
import {
  extractShopifyInventoryItemId,
  fetchShopifyPrimaryLocationId,
  pushShopifyInventoryLevel,
} from "@/services/integrations/shopify-inventory";

export type ShopifyInventorySyncResult = {
  adjusted: number;
  pushed: number;
  skipped: number;
};

async function kitchenQuantityForProduct(userId: string, productId: string): Promise<number> {
  const item = await prisma.storefrontInventoryItem.findFirst({
    where: { productId, userId },
    select: { quantity: true },
    orderBy: { updatedAt: "desc" },
  });
  if (item) return item.quantity;
  const product = await prisma.product.findFirst({
    where: { id: productId },
    select: { maxStorefrontQuantity: true },
  });
  return product?.maxStorefrontQuantity ?? 0;
}

async function setKitchenQuantity(userId: string, productId: string, quantity: number): Promise<void> {
  const storefront = await prisma.storefrontSettings.findFirst({
    where: { userId },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });
  const nextQty = Math.max(0, Math.round(quantity));
  if (!storefront) {
    await prisma.product.updateMany({
      where: { id: productId },
      data: { maxStorefrontQuantity: nextQty },
    });
    return;
  }
  await prisma.storefrontInventoryItem.upsert({
    where: {
      storefrontId_productId: { storefrontId: storefront.id, productId },
    },
    create: {
      userId,
      storefrontId: storefront.id,
      productId,
      quantity: nextQty,
    },
    update: { quantity: nextQty },
  });
}

/**
 * Decrement mapped kitchen stock for Shopify line items and push levels back to Shopify.
 * Runs on orders/create only — idempotent per external order via prior import check.
 */
export async function syncShopifyInventoryFromOrder(input: {
  userId: string;
  connectionId: string;
  normalized: NormalizedKitchenOrder;
  rawPayload: unknown;
}): Promise<ShopifyInventorySyncResult> {
  const conn = await prisma.integrationConnection.findFirst({
    where: { id: input.connectionId, provider: IntegrationProvider.SHOPIFY },
  });
  if (!conn) {
    return { adjusted: 0, pushed: 0, skipped: 0 };
  }

  const creds = getShopifyCredentials(
    conn,
    (conn.settingsJson as { apiVersion?: string } | null)?.apiVersion,
  );
  const locationId = creds ? await fetchShopifyPrimaryLocationId(creds) : null;

  let adjusted = 0;
  let pushed = 0;
  let skipped = 0;

  for (const line of input.normalized.lineItems) {
    const sku = line.sku?.trim();
    if (!sku) {
      skipped += 1;
      continue;
    }

    const externalProduct = await prisma.externalProduct.findFirst({
      where: {
        connectionId: input.connectionId,
        provider: IntegrationProvider.SHOPIFY,
        OR: [{ sku }, { externalVariantId: line.externalLineId ?? "" }],
        mappedProductId: { not: null },
      },
      select: {
        mappedProductId: true,
        rawPayloadJson: true,
        externalVariantId: true,
      },
    });

    if (!externalProduct?.mappedProductId) {
      skipped += 1;
      continue;
    }

    const current = await kitchenQuantityForProduct(input.userId, externalProduct.mappedProductId);
    const next = Math.max(0, current - line.quantity);
    await setKitchenQuantity(input.userId, externalProduct.mappedProductId, next);
    adjusted += 1;

    if (!creds || !locationId) continue;

    const inventoryItemId = extractShopifyInventoryItemId(externalProduct.rawPayloadJson);
    if (!inventoryItemId) continue;

    const result = await pushShopifyInventoryLevel(creds, {
      inventoryItemId,
      locationId,
      quantity: next,
    });
    if (result.ok) pushed += 1;
  }

  return { adjusted, pushed, skipped };
}
