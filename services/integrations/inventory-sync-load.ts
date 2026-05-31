import type { IntegrationProvider, Prisma } from "@prisma/client";

import { decryptOptional } from "@/lib/crypto";
import {
  inventorySyncSettingsFromConnection,
  mergeInventorySyncIntoConnectionSettings,
  storedConflictsFromConnection,
  type StoredInventoryConflict,
} from "@/lib/integrations/inventory-sync-settings";
import { getShopifyCredentials } from "@/lib/integrations/decrypt-connection";
import { prisma } from "@/lib/prisma";
import { externalProductListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  applyInventorySyncPlan,
  buildInventorySyncSnapshot,
  detectInventoryConflicts,
  extractChannelQuantity,
  resolveConflictQuantity,
  type InventoryLevelRow,
  type InventorySyncSnapshot,
} from "@/services/integrations/inventory-sync-service";
import {
  extractShopifyInventoryItemId,
  fetchShopifyPrimaryLocationId,
  providerSupportsInventoryPush,
  pushShopifyInventoryLevel,
  pushWooInventoryLevel,
} from "@/services/integrations/shopify-inventory";

async function kitchenQuantityForProduct(
  userId: string,
  productId: string,
): Promise<number> {
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
  if (!storefront) {
    await prisma.product.updateMany({
      where: { id: productId },
      data: { maxStorefrontQuantity: Math.max(0, Math.round(quantity)) },
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
      quantity: Math.max(0, Math.round(quantity)),
    },
    update: {
      quantity: Math.max(0, Math.round(quantity)),
    },
  });
}

export async function loadInventorySyncSnapshot(userId: string): Promise<InventorySyncSnapshot> {
  const [productWhere, connectionWhere] = await Promise.all([
    externalProductListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
  ]);

  const [externalProducts, connections] = await Promise.all([
    prisma.externalProduct.findMany({
      where: {
        AND: [
          productWhere,
          { provider: { in: ["SHOPIFY", "WOOCOMMERCE"] } },
          { mappedProductId: { not: null } },
        ],
      },
      select: {
        connectionId: true,
        provider: true,
        externalProductId: true,
        externalVariantId: true,
        mappedProductId: true,
        title: true,
        sku: true,
        rawPayloadJson: true,
      },
      take: 200,
    }),
    prisma.integrationConnection.findMany({
      where: {
        AND: [connectionWhere, { provider: { in: ["SHOPIFY", "WOOCOMMERCE"] } }],
      },
      select: { id: true, provider: true, settingsJson: true },
    }),
  ]);

  const enabledConnections = new Set(
    connections
      .filter((c) => inventorySyncSettingsFromConnection(c.settingsJson).enabled)
      .map((c) => c.id),
  );

  const levels: InventoryLevelRow[] = [];
  for (const row of externalProducts) {
    if (!row.connectionId || !enabledConnections.has(row.connectionId)) continue;
    if (!row.mappedProductId) continue;
    const kitchenQuantity = await kitchenQuantityForProduct(userId, row.mappedProductId);
    levels.push({
      connectionId: row.connectionId,
      provider: row.provider as "SHOPIFY" | "WOOCOMMERCE",
      externalProductId: row.externalProductId,
      externalVariantId: row.externalVariantId,
      mappedProductId: row.mappedProductId,
      productTitle: row.title,
      sku: row.sku,
      kitchenQuantity,
      channelQuantity: extractChannelQuantity(row.provider, row.rawPayloadJson),
      inventoryItemId: extractShopifyInventoryItemId(row.rawPayloadJson),
    });
  }

  return buildInventorySyncSnapshot({ levels });
}

function conflictsToStored(conflicts: ReturnType<typeof detectInventoryConflicts>): StoredInventoryConflict[] {
  return conflicts.map((c) => ({
    id: c.id,
    connectionId: c.level.connectionId,
    provider: c.level.provider,
    externalProductId: c.level.externalProductId,
    externalVariantId: c.level.externalVariantId,
    mappedProductId: c.level.mappedProductId,
    productTitle: c.level.productTitle,
    sku: c.level.sku,
    kitchenQuantity: c.level.kitchenQuantity,
    channelQuantity: c.level.channelQuantity,
    detectedAt: new Date().toISOString(),
  }));
}

export async function runInventorySyncPull(userId: string): Promise<InventorySyncSnapshot> {
  const snapshot = await loadInventorySyncSnapshot(userId);
  const conflicts = snapshot.conflicts;

  const connections = await prisma.integrationConnection.findMany({
    where: { userId, provider: { in: ["SHOPIFY", "WOOCOMMERCE"] } },
    select: { id: true, settingsJson: true },
  });

  for (const conn of connections) {
    const settings = inventorySyncSettingsFromConnection(conn.settingsJson);
    const stored = conflictsToStored(conflicts.filter((c) => c.level.connectionId === conn.id));
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: mergeInventorySyncIntoConnectionSettings(
          conn.settingsJson,
          settings,
          stored,
        ) as Prisma.InputJsonValue,
        lastSyncAt: new Date(),
      },
    });
  }

  return snapshot;
}

export async function runInventorySyncPush(
  userId: string,
  connectionId: string,
  strategy: "kitchen_wins" | "channel_wins" | "manual_review",
  conflictId?: string,
): Promise<{ ok: boolean; message: string; pushed: number; pulled: number }> {
  const snapshot = await loadInventorySyncSnapshot(userId);
  let conflicts = snapshot.conflicts.filter((c) => c.level.connectionId === connectionId);
  if (conflictId) conflicts = conflicts.filter((c) => c.id === conflictId);
  if (conflicts.length === 0) {
    return { ok: true, message: "Nothing to sync.", pushed: 0, pulled: 0 };
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: { id: connectionId, userId },
  });
  if (!conn || !providerSupportsInventoryPush(conn.provider)) {
    return { ok: false, message: "Connection not found.", pushed: 0, pulled: 0 };
  }

  let pushed = 0;
  let pulled = 0;

  for (const conflict of conflicts) {
    const outcome = resolveConflictQuantity(conflict, strategy);
    if (!outcome.resolved && strategy === "manual_review") continue;

    const targetKitchen = outcome.kitchenQuantity;
    const targetChannel = outcome.channelQuantity;

    if (strategy === "kitchen_wins" || (strategy === "manual_review" && conflictId)) {
      if (conn.provider === "WOOCOMMERCE") {
        const key = decryptOptional(conn.consumerKeyEncrypted);
        const secret = decryptOptional(conn.consumerSecretEncrypted);
        if (!key || !secret || !conn.baseUrl) continue;
        const result = await pushWooInventoryLevel(
          { baseUrl: conn.baseUrl, consumerKey: key, consumerSecret: secret },
          conflict.level.externalProductId,
          targetChannel,
        );
        if (result.ok) pushed += 1;
      } else if (conn.provider === "SHOPIFY") {
        const creds = getShopifyCredentials(conn);
        const itemId = conflict.level.inventoryItemId;
        if (!creds || !itemId) continue;
        const locationId = await fetchShopifyPrimaryLocationId(creds);
        if (!locationId) continue;
        const result = await pushShopifyInventoryLevel(creds, {
          inventoryItemId: itemId,
          locationId,
          quantity: targetChannel,
        });
        if (result.ok) pushed += 1;
      }
    }

    if (
      strategy === "channel_wins" ||
      (strategy === "manual_review" && conflictId && targetKitchen !== conflict.level.kitchenQuantity)
    ) {
      if (conflict.level.mappedProductId) {
        await setKitchenQuantity(userId, conflict.level.mappedProductId, targetKitchen);
        pulled += 1;
      }
    }
  }

  const remaining = applyInventorySyncPlan({ conflicts, strategy });
  const stored = conflictsToStored(remaining.remainingConflicts);
  const settings = inventorySyncSettingsFromConnection(conn.settingsJson);
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: mergeInventorySyncIntoConnectionSettings(
        conn.settingsJson,
        settings,
        stored,
      ) as Prisma.InputJsonValue,
      lastSyncAt: new Date(),
    },
  });

  return {
    ok: true,
    message: `Sync complete — pushed ${pushed}, pulled ${pulled}.`,
    pushed,
    pulled,
  };
}

export async function listStoredInventoryConflicts(userId: string): Promise<StoredInventoryConflict[]> {
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);
  const connections = await prisma.integrationConnection.findMany({
    where: { AND: [connectionWhere, { provider: { in: ["SHOPIFY", "WOOCOMMERCE"] } }] },
    select: { settingsJson: true },
  });
  return connections.flatMap((c) => storedConflictsFromConnection(c.settingsJson));
}
