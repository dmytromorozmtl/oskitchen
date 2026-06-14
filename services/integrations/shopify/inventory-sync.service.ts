import { IntegrationProvider } from "@prisma/client";

import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { prisma } from "@/lib/prisma";
import {
  integrationConnectionByProviderWhereForOwner,
  storefrontInventoryItemListWhereForOwner,
  storefrontSettingsListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
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

export type ShopifyInboundInventorySyncResult = {
  updated: boolean;
  productId: string | null;
  quantity: number | null;
};

async function kitchenQuantityForProduct(userId: string, productId: string): Promise<number> {
  const inventoryScope = await storefrontInventoryItemListWhereForOwner(userId);
  const item = await prisma.storefrontInventoryItem.findFirst({
    where: { AND: [inventoryScope, { productId }] },
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
  const storefrontScope = await storefrontSettingsListWhereForOwner(userId);
  const storefront = await prisma.storefrontSettings.findFirst({
    where: storefrontScope,
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

/**
 * Inbound sync — Shopify products/update variant inventory_quantity → mapped kitchen inventory.
 */
export async function syncShopifyInventoryFromProductWebhook(input: {
  userId: string;
  connectionId: string;
  externalProductId: string;
  externalVariantId: string;
  inventoryQuantity: number;
}): Promise<ShopifyInboundInventorySyncResult> {
  const externalProduct = await prisma.externalProduct.findFirst({
    where: {
      connectionId: input.connectionId,
      provider: IntegrationProvider.SHOPIFY,
      externalProductId: input.externalProductId,
      externalVariantId: input.externalVariantId,
      mappedProductId: { not: null },
    },
    select: { mappedProductId: true },
  });

  if (!externalProduct?.mappedProductId) {
    return { updated: false, productId: null, quantity: null };
  }

  const quantity = Math.max(0, Math.round(input.inventoryQuantity));
  await setKitchenQuantity(input.userId, externalProduct.mappedProductId, quantity);

  return {
    updated: true,
    productId: externalProduct.mappedProductId,
    quantity,
  };
}

async function findMappedExternalProductByInventoryItemId(
  connectionId: string,
  inventoryItemId: string,
): Promise<{
  mappedProductId: string;
  externalProductId: string;
  externalVariantId: string;
} | null> {
  const rows = await prisma.externalProduct.findMany({
    where: {
      connectionId,
      provider: IntegrationProvider.SHOPIFY,
      mappedProductId: { not: null },
    },
    select: {
      mappedProductId: true,
      externalProductId: true,
      externalVariantId: true,
      rawPayloadJson: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  for (const row of rows) {
    if (extractShopifyInventoryItemId(row.rawPayloadJson) === inventoryItemId && row.mappedProductId) {
      return {
        mappedProductId: row.mappedProductId,
        externalProductId: row.externalProductId,
        externalVariantId: row.externalVariantId,
      };
    }
  }
  return null;
}

/**
 * Real-time inbound sync — Shopify inventory_levels/update → mapped kitchen inventory.
 */
export async function syncShopifyInventoryFromInventoryLevelWebhook(input: {
  userId: string;
  connectionId: string;
  inventoryItemId: string;
  available: number;
}): Promise<ShopifyInboundInventorySyncResult> {
  const mapped = await findMappedExternalProductByInventoryItemId(
    input.connectionId,
    input.inventoryItemId,
  );

  if (!mapped) {
    return { updated: false, productId: null, quantity: null };
  }

  const quantity = Math.max(0, Math.round(input.available));
  await setKitchenQuantity(input.userId, mapped.mappedProductId, quantity);

  return {
    updated: true,
    productId: mapped.mappedProductId,
    quantity,
  };
}
