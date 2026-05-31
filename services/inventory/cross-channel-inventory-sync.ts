/**
 * Cross-channel inventory sync engine — POS, Shopify, WooCommerce, DoorDash.
 *
 * Unifies the Kitchen spine quantity with external channel levels, handles
 * conflict resolution, reservations, low-stock alerts, and realtime push plans.
 *
 * @see services/integrations/inventory-sync-service.ts — Shopify/Woo compare primitives
 * @see services/integrations/inventory-sync-load.ts — legacy pull/push persistence
 */

import type { IntegrationProvider, Prisma } from "@prisma/client";

import {
  crossChannelSettingsFromConnection,
  mergeCrossChannelIntoConnectionSettings,
  storedReservationsFromConnection,
  type CrossChannelInventoryProvider,
  type StoredCrossChannelReservation,
} from "@/lib/inventory/cross-channel-inventory-settings";
import type { InventoryConflictResolution } from "@/lib/integrations/inventory-sync-settings";
import { prisma } from "@/lib/prisma";
import { externalProductListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  applyInventorySyncPlan,
  detectInventoryConflicts,
  extractChannelQuantity,
  resolveConflictQuantity,
  type InventoryLevelRow,
  type InventorySyncConflict,
} from "@/services/integrations/inventory-sync-service";
import {
  loadInventorySyncSnapshot,
  runInventorySyncPull,
  runInventorySyncPush,
} from "@/services/integrations/inventory-sync-load";

export type CrossChannelLevel = {
  productId: string;
  productTitle: string;
  sku: string | null;
  masterQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  channels: CrossChannelChannelLevel[];
};

export type CrossChannelChannelLevel = {
  provider: CrossChannelInventoryProvider;
  connectionId: string;
  externalProductId: string;
  externalVariantId: string;
  quantity: number;
  inventoryItemId?: string | null;
};

export type CrossChannelConflict = {
  id: string;
  productId: string;
  productTitle: string;
  masterQuantity: number;
  channel: CrossChannelChannelLevel;
  delta: number;
};

export type CrossChannelLowStockAlert = {
  id: string;
  productId: string;
  productTitle: string;
  availableQuantity: number;
  threshold: number;
  channels: CrossChannelInventoryProvider[];
};

export type CrossChannelSyncSnapshot = {
  pulledAtIso: string;
  levels: CrossChannelLevel[];
  conflicts: CrossChannelConflict[];
  lowStockAlerts: CrossChannelLowStockAlert[];
  reservations: StoredCrossChannelReservation[];
  inSyncCount: number;
  notes: string[];
};

export type CrossChannelRealtimeSyncPlan = {
  productId: string;
  masterQuantity: number;
  pushTargets: Array<{
    provider: CrossChannelInventoryProvider;
    connectionId: string;
    quantity: number;
  }>;
  reason: "inventory_change" | "reservation_created" | "reservation_released" | "conflict_resolved";
};

export type CrossChannelInventoryChangeEvent = {
  productId: string;
  previousQuantity: number;
  nextQuantity: number;
  source: CrossChannelInventoryProvider;
  orderId?: string | null;
};

const POS_CONNECTION_ID = "pos:local" as const;
const EXTERNAL_PROVIDER_MAP: Record<string, CrossChannelInventoryProvider | null> = {
  SHOPIFY: "SHOPIFY",
  WOOCOMMERCE: "WOOCOMMERCE",
  DOORDASH: "DOORDASH",
};

function roundQty(value: number): number {
  return Math.max(0, Math.round(value));
}

export function extractDoorDashChannelQuantity(rawPayloadJson: unknown): number {
  if (!rawPayloadJson || typeof rawPayloadJson !== "object") return 0;
  const o = rawPayloadJson as Record<string, unknown>;
  if (o.quantity != null) return roundQty(Number(o.quantity));
  if (o.stock_quantity != null) return roundQty(Number(o.stock_quantity));
  if (o.available_quantity != null) return roundQty(Number(o.available_quantity));
  if (typeof o.in_stock === "boolean") return o.in_stock ? 1 : 0;
  return 0;
}

export function extractCrossChannelQuantity(
  provider: string,
  rawPayloadJson: unknown,
): number {
  if (provider === "DOORDASH") return extractDoorDashChannelQuantity(rawPayloadJson);
  return extractChannelQuantity(provider, rawPayloadJson);
}

export function computeAvailableQuantity(
  masterQuantity: number,
  reservedQuantity: number,
): number {
  return Math.max(0, roundQty(masterQuantity) - roundQty(reservedQuantity));
}

export function activeReservationsForProduct(
  reservations: StoredCrossChannelReservation[],
  productId: string,
  now = new Date(),
): StoredCrossChannelReservation[] {
  const nowMs = now.getTime();
  return reservations.filter(
    (r) => r.productId === productId && new Date(r.expiresAt).getTime() > nowMs,
  );
}

export function sumReservedQuantity(
  reservations: StoredCrossChannelReservation[],
  productId: string,
  now = new Date(),
): number {
  return activeReservationsForProduct(reservations, productId, now).reduce(
    (sum, r) => sum + r.quantity,
    0,
  );
}

export function buildCrossChannelLevels(params: {
  masterByProduct: Map<
    string,
    { title: string; sku: string | null; quantity: number; lowStockThreshold: number }
  >;
  externalRows: Array<{
    connectionId: string;
    provider: string;
    externalProductId: string;
    externalVariantId: string;
    mappedProductId: string;
    title: string;
    sku: string | null;
    rawPayloadJson: unknown;
    inventoryItemId?: string | null;
  }>;
  reservations: StoredCrossChannelReservation[];
  lowStockThresholdDefault: number;
  now?: Date;
}): CrossChannelLevel[] {
  const byProduct = new Map<string, CrossChannelLevel>();

  for (const [productId, master] of params.masterByProduct) {
    const reservedQuantity = sumReservedQuantity(params.reservations, productId, params.now);
    byProduct.set(productId, {
      productId,
      productTitle: master.title,
      sku: master.sku,
      masterQuantity: master.quantity,
      reservedQuantity,
      availableQuantity: computeAvailableQuantity(master.quantity, reservedQuantity),
      lowStockThreshold: master.lowStockThreshold ?? params.lowStockThresholdDefault,
      channels: [
        {
          provider: "POS",
          connectionId: POS_CONNECTION_ID,
          externalProductId: productId,
          externalVariantId: "",
          quantity: master.quantity,
        },
      ],
    });
  }

  for (const row of params.externalRows) {
    const mapped = byProduct.get(row.mappedProductId);
    const provider = EXTERNAL_PROVIDER_MAP[row.provider];
    if (!provider) continue;

    const channelQty = extractCrossChannelQuantity(row.provider, row.rawPayloadJson);
    const level = mapped ?? {
      productId: row.mappedProductId,
      productTitle: row.title,
      sku: row.sku,
      masterQuantity: 0,
      reservedQuantity: sumReservedQuantity(params.reservations, row.mappedProductId, params.now),
      availableQuantity: 0,
      lowStockThreshold: params.lowStockThresholdDefault,
      channels: [] as CrossChannelChannelLevel[],
    };

    if (!mapped) {
      level.availableQuantity = computeAvailableQuantity(
        level.masterQuantity,
        level.reservedQuantity,
      );
      byProduct.set(row.mappedProductId, level);
    }

    level.channels.push({
      provider,
      connectionId: row.connectionId,
      externalProductId: row.externalProductId,
      externalVariantId: row.externalVariantId,
      quantity: channelQty,
      inventoryItemId: row.inventoryItemId ?? null,
    });
  }

  return [...byProduct.values()];
}

export function detectCrossChannelConflicts(levels: CrossChannelLevel[]): CrossChannelConflict[] {
  const conflicts: CrossChannelConflict[] = [];
  for (const level of levels) {
    for (const channel of level.channels) {
      if (channel.provider === "POS") continue;
      const delta = level.masterQuantity - channel.quantity;
      if (delta === 0) continue;
      conflicts.push({
        id: `${channel.connectionId}:${channel.externalProductId}:${channel.externalVariantId}`,
        productId: level.productId,
        productTitle: level.productTitle,
        masterQuantity: level.masterQuantity,
        channel,
        delta,
      });
    }
  }
  return conflicts;
}

export function detectCrossChannelLowStockAlerts(
  levels: CrossChannelLevel[],
): CrossChannelLowStockAlert[] {
  const alerts: CrossChannelLowStockAlert[] = [];
  for (const level of levels) {
    if (level.availableQuantity > level.lowStockThreshold) continue;
    alerts.push({
      id: `low-stock:${level.productId}`,
      productId: level.productId,
      productTitle: level.productTitle,
      availableQuantity: level.availableQuantity,
      threshold: level.lowStockThreshold,
      channels: level.channels.map((c) => c.provider),
    });
  }
  return alerts;
}

export function buildCrossChannelSyncSnapshot(params: {
  levels: CrossChannelLevel[];
  reservations: StoredCrossChannelReservation[];
  now?: Date;
}): CrossChannelSyncSnapshot {
  const conflicts = detectCrossChannelConflicts(params.levels);
  const lowStockAlerts = detectCrossChannelLowStockAlerts(params.levels);
  const inSyncCount = params.levels.filter((level) => {
    const external = level.channels.filter((c) => c.provider !== "POS");
    return external.length > 0 && external.every((c) => c.quantity === level.masterQuantity);
  }).length;

  return {
    pulledAtIso: (params.now ?? new Date()).toISOString(),
    levels: params.levels,
    conflicts,
    lowStockAlerts,
    reservations: params.reservations,
    inSyncCount,
    notes: [
      "Cross-channel sync compares Kitchen spine (POS) to Shopify, WooCommerce, and DoorDash.",
      "Reservations reduce available quantity until released or expired.",
      "Unresolved conflicts stay queued until Kitchen wins or Channel wins.",
    ],
  };
}

export function resolveCrossChannelConflict(
  conflict: CrossChannelConflict,
  strategy: InventoryConflictResolution,
): { masterQuantity: number; channelQuantity: number; resolved: boolean } {
  const legacy: InventorySyncConflict = {
    id: conflict.id,
    delta: conflict.delta,
    level: {
      connectionId: conflict.channel.connectionId,
      provider: conflict.channel.provider === "DOORDASH" ? "SHOPIFY" : conflict.channel.provider,
      externalProductId: conflict.channel.externalProductId,
      externalVariantId: conflict.channel.externalVariantId,
      mappedProductId: conflict.productId,
      productTitle: conflict.productTitle,
      sku: null,
      kitchenQuantity: conflict.masterQuantity,
      channelQuantity: conflict.channel.quantity,
      inventoryItemId: conflict.channel.inventoryItemId,
    } as InventoryLevelRow,
  };
  const outcome = resolveConflictQuantity(legacy, strategy);
  return {
    masterQuantity: outcome.kitchenQuantity,
    channelQuantity: outcome.channelQuantity,
    resolved: outcome.resolved,
  };
}

export function applyCrossChannelConflictPlan(params: {
  conflicts: CrossChannelConflict[];
  strategy: InventoryConflictResolution;
}) {
  const legacyConflicts: InventorySyncConflict[] = params.conflicts.map((c) => ({
    id: c.id,
    delta: c.delta,
    level: {
      connectionId: c.channel.connectionId,
      provider:
        c.channel.provider === "DOORDASH" || c.channel.provider === "POS"
          ? "SHOPIFY"
          : c.channel.provider,
      externalProductId: c.channel.externalProductId,
      externalVariantId: c.channel.externalVariantId,
      mappedProductId: c.productId,
      productTitle: c.productTitle,
      sku: null,
      kitchenQuantity: c.masterQuantity,
      channelQuantity: c.channel.quantity,
      inventoryItemId: c.channel.inventoryItemId,
    } as InventoryLevelRow,
  }));
  return applyInventorySyncPlan({ conflicts: legacyConflicts, strategy: params.strategy });
}

export function createCrossChannelReservation(params: {
  reservations: StoredCrossChannelReservation[];
  productId: string;
  quantity: number;
  channel: CrossChannelInventoryProvider;
  orderId?: string | null;
  ttlMinutes?: number;
  now?: Date;
}): { reservations: StoredCrossChannelReservation[]; reservation: StoredCrossChannelReservation } {
  const now = params.now ?? new Date();
  const ttlMinutes = params.ttlMinutes ?? 30;
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60_000);
  const reservation: StoredCrossChannelReservation = {
    id: `res:${params.productId}:${now.getTime()}`,
    productId: params.productId,
    quantity: roundQty(params.quantity),
    channel: params.channel,
    orderId: params.orderId ?? null,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  };
  return {
    reservations: [...params.reservations, reservation],
    reservation,
  };
}

export function releaseCrossChannelReservation(
  reservations: StoredCrossChannelReservation[],
  reservationId: string,
): StoredCrossChannelReservation[] {
  return reservations.filter((r) => r.id !== reservationId);
}

export function planCrossChannelRealtimeSync(params: {
  level: CrossChannelLevel;
  settings: { autoPushOnChange: boolean; conflictResolution: InventoryConflictResolution };
  reason: CrossChannelRealtimeSyncPlan["reason"];
}): CrossChannelRealtimeSyncPlan | null {
  if (!params.settings.autoPushOnChange) return null;
  if (params.settings.conflictResolution === "manual_review") {
    const hasConflict = params.level.channels.some(
      (c) => c.provider !== "POS" && c.quantity !== params.level.masterQuantity,
    );
    if (hasConflict) return null;
  }

  const pushTargets = params.level.channels
    .filter((c) => c.provider !== "POS")
    .map((c) => ({
      provider: c.provider,
      connectionId: c.connectionId,
      quantity: params.level.availableQuantity,
    }));

  if (pushTargets.length === 0) return null;

  return {
    productId: params.level.productId,
    masterQuantity: params.level.masterQuantity,
    pushTargets,
    reason: params.reason,
  };
}

async function kitchenProductsForOwner(userId: string) {
  const items = await prisma.storefrontInventoryItem.findMany({
    where: { userId },
    select: {
      productId: true,
      quantity: true,
      lowStockAt: true,
      storefront: { select: { userId: true } },
    },
    take: 500,
  });

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds }, userId },
          select: { id: true, title: true, sku: true, maxStorefrontQuantity: true },
        })
      : [];
  const productById = new Map(products.map((p) => [p.id, p]));

  const masterByProduct = new Map<
    string,
    { title: string; sku: string | null; quantity: number; lowStockThreshold: number }
  >();

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) continue;
    masterByProduct.set(item.productId, {
      title: product.title,
      sku: product.sku,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockAt ?? 5,
    });
  }

  for (const product of products) {
    if (masterByProduct.has(product.id)) continue;
    masterByProduct.set(product.id, {
      title: product.title,
      sku: product.sku,
      quantity: product.maxStorefrontQuantity ?? 0,
      lowStockThreshold: 5,
    });
  }

  return masterByProduct;
}

async function loadAllReservations(userId: string): Promise<StoredCrossChannelReservation[]> {
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);
  const connections = await prisma.integrationConnection.findMany({
    where: {
      AND: [
        connectionWhere,
        { provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] as IntegrationProvider[] } },
      ],
    },
    select: { settingsJson: true },
  });
  return connections.flatMap((c) => storedReservationsFromConnection(c.settingsJson));
}

async function persistReservations(userId: string, reservations: StoredCrossChannelReservation[]) {
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);
  const connections = await prisma.integrationConnection.findMany({
    where: {
      AND: [
        connectionWhere,
        { provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] as IntegrationProvider[] } },
      ],
    },
    select: { id: true, settingsJson: true },
  });
  for (const conn of connections) {
    const settings = crossChannelSettingsFromConnection(conn.settingsJson);
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: mergeCrossChannelIntoConnectionSettings(
          conn.settingsJson,
          settings,
          reservations,
        ) as Prisma.InputJsonValue,
      },
    });
  }
}

export async function loadCrossChannelInventorySnapshot(
  userId: string,
): Promise<CrossChannelSyncSnapshot> {
  const [productWhere, connectionWhere, masterByProduct, reservations] = await Promise.all([
    externalProductListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
    kitchenProductsForOwner(userId),
    loadAllReservations(userId),
  ]);

  const settingsRow = await prisma.integrationConnection.findFirst({
    where: {
      AND: [
        connectionWhere,
        { provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] as IntegrationProvider[] } },
      ],
    },
    select: { settingsJson: true },
    orderBy: { updatedAt: "desc" },
  });
  const settings = crossChannelSettingsFromConnection(settingsRow?.settingsJson);

  const externalProducts = await prisma.externalProduct.findMany({
    where: {
      AND: [
        productWhere,
        {
          provider: {
            in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] as IntegrationProvider[],
          },
        },
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
    take: 500,
  });

  const enabledConnections = await prisma.integrationConnection.findMany({
    where: {
      AND: [
        connectionWhere,
        { provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] as IntegrationProvider[] } },
      ],
    },
    select: { id: true, settingsJson: true },
  });
  const enabledIds = new Set(
    enabledConnections
      .filter((c) => crossChannelSettingsFromConnection(c.settingsJson).enabled)
      .map((c) => c.id),
  );

  const externalRows = externalProducts
    .filter((row) => row.connectionId && row.mappedProductId && enabledIds.has(row.connectionId))
    .map((row) => ({
      connectionId: row.connectionId!,
      provider: row.provider,
      externalProductId: row.externalProductId,
      externalVariantId: row.externalVariantId,
      mappedProductId: row.mappedProductId!,
      title: row.title,
      sku: row.sku,
      rawPayloadJson: row.rawPayloadJson,
      inventoryItemId: null as string | null,
    }));

  const levels = buildCrossChannelLevels({
    masterByProduct,
    externalRows,
    reservations,
    lowStockThresholdDefault: settings.lowStockThreshold,
  });

  return buildCrossChannelSyncSnapshot({ levels, reservations });
}

export async function runCrossChannelInventorySyncPull(userId: string) {
  await runInventorySyncPull(userId);
  return loadCrossChannelInventorySnapshot(userId);
}

export async function runCrossChannelInventorySyncPush(
  userId: string,
  connectionId: string,
  strategy: "kitchen_wins" | "channel_wins" | "manual_review",
  conflictId?: string,
) {
  const result = await runInventorySyncPush(userId, connectionId, strategy, conflictId);
  const snapshot = await loadCrossChannelInventorySnapshot(userId);
  return { ...result, snapshot };
}

export async function reserveCrossChannelInventory(params: {
  userId: string;
  productId: string;
  quantity: number;
  channel: CrossChannelInventoryProvider;
  orderId?: string | null;
  ttlMinutes?: number;
}) {
  const reservations = await loadAllReservations(params.userId);
  const { reservations: next, reservation } = createCrossChannelReservation({
    reservations,
    productId: params.productId,
    quantity: params.quantity,
    channel: params.channel,
    orderId: params.orderId,
    ttlMinutes: params.ttlMinutes,
  });
  await persistReservations(params.userId, next);
  return reservation;
}

export async function releaseCrossChannelInventoryReservation(
  userId: string,
  reservationId: string,
) {
  const reservations = await loadAllReservations(userId);
  const next = releaseCrossChannelReservation(reservations, reservationId);
  await persistReservations(userId, next);
  return next;
}

export async function handleCrossChannelInventoryChangeEvent(
  userId: string,
  event: CrossChannelInventoryChangeEvent,
): Promise<CrossChannelRealtimeSyncPlan | null> {
  const snapshot = await loadCrossChannelInventorySnapshot(userId);
  const level = snapshot.levels.find((l) => l.productId === event.productId);
  if (!level) return null;

  const settingsRow = await prisma.integrationConnection.findFirst({
    where: { userId, provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] } },
    select: { settingsJson: true },
    orderBy: { updatedAt: "desc" },
  });
  const settings = crossChannelSettingsFromConnection(settingsRow?.settingsJson);

  const updatedLevel: CrossChannelLevel = {
    ...level,
    masterQuantity: event.nextQuantity,
    availableQuantity: computeAvailableQuantity(event.nextQuantity, level.reservedQuantity),
    channels: level.channels.map((c) =>
      c.provider === "POS" ? { ...c, quantity: event.nextQuantity } : c,
    ),
  };

  return planCrossChannelRealtimeSync({
    level: updatedLevel,
    settings,
    reason: "inventory_change",
  });
}

/** Bridge legacy Shopify/Woo snapshot into cross-channel levels for dashboards. */
export function crossChannelLevelsFromLegacySnapshot(
  legacyLevels: InventoryLevelRow[],
  reservations: StoredCrossChannelReservation[] = [],
): CrossChannelLevel[] {
  const masterByProduct = new Map<
    string,
    { title: string; sku: string | null; quantity: number; lowStockThreshold: number }
  >();
  for (const row of legacyLevels) {
    if (!row.mappedProductId) continue;
    masterByProduct.set(row.mappedProductId, {
      title: row.productTitle,
      sku: row.sku,
      quantity: row.kitchenQuantity,
      lowStockThreshold: 5,
    });
  }
  return buildCrossChannelLevels({
    masterByProduct,
    externalRows: legacyLevels
      .filter((r) => r.mappedProductId)
      .map((r) => ({
        connectionId: r.connectionId,
        provider: r.provider,
        externalProductId: r.externalProductId,
        externalVariantId: r.externalVariantId,
        mappedProductId: r.mappedProductId!,
        title: r.productTitle,
        sku: r.sku,
        rawPayloadJson: { stock_quantity: r.channelQuantity, variant: { inventoryQuantity: r.channelQuantity } },
        inventoryItemId: r.inventoryItemId,
      })),
    reservations,
    lowStockThresholdDefault: 5,
  });
}

export { detectInventoryConflicts, loadInventorySyncSnapshot };
