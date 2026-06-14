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

import type { CrossChannelInventoryProvider,
  StoredCrossChannelReservation,
  CrossChannelInventorySettings,
} from "@/lib/inventory/cross-channel-inventory-settings";
import {
  crossChannelSettingsFromConnection,
  mergeCrossChannelIntoConnectionSettings,
  storedReservationsFromConnection,
} from "@/lib/inventory/cross-channel-inventory-settings";
import type { InventoryConflictResolution } from "@/lib/integrations/inventory-sync-settings";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { externalProductListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { integrationConnectionListWhereForOwner, storefrontInventoryItemListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
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

export type CrossChannelHealthStatus =
  | "healthy"
  | "degraded"
  | "conflict"
  | "offline"
  | "disabled";

export type CrossChannelChannelHealth = {
  provider: CrossChannelInventoryProvider;
  connectionId: string;
  connectionName: string | null;
  status: CrossChannelHealthStatus;
  lastSyncedAtIso: string | null;
  mappedProductCount: number;
  conflictCount: number;
  inSyncCount: number;
};

export type CrossChannelHealthDashboard = {
  generatedAtIso: string;
  overallStatus: CrossChannelHealthStatus;
  channels: CrossChannelChannelHealth[];
};

export type CrossChannelDailyReconciliationReport = {
  reportDateIso: string;
  summary: {
    totalProducts: number;
    inSyncCount: number;
    conflictCount: number;
    lowStockCount: number;
    reservationCount: number;
  };
  conflicts: CrossChannelConflict[];
  lowStockAlerts: CrossChannelLowStockAlert[];
  channelHealth: CrossChannelChannelHealth[];
  notes: string[];
};

export type CrossChannelSyncSnapshot = {
  pulledAtIso: string;
  levels: CrossChannelLevel[];
  conflicts: CrossChannelConflict[];
  lowStockAlerts: CrossChannelLowStockAlert[];
  reservations: StoredCrossChannelReservation[];
  inSyncCount: number;
  notes: string[];
  channelHealth?: CrossChannelChannelHealth[];
  overallHealth?: CrossChannelHealthStatus;
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

const DEFAULT_STALE_SYNC_HOURS = 24;

export function computeCrossChannelHealthStatus(params: {
  enabled: boolean;
  mappedProductCount: number;
  conflictCount: number;
  lastSyncedAtIso: string | null;
  staleAfterHours?: number;
  now?: Date;
}): CrossChannelHealthStatus {
  if (!params.enabled) return "disabled";
  if (params.mappedProductCount === 0) return "offline";
  if (params.conflictCount > 0) return "conflict";
  if (!params.lastSyncedAtIso) return "degraded";

  const staleMs = (params.staleAfterHours ?? DEFAULT_STALE_SYNC_HOURS) * 60 * 60 * 1000;
  const syncedAt = new Date(params.lastSyncedAtIso).getTime();
  const nowMs = (params.now ?? new Date()).getTime();
  if (Number.isNaN(syncedAt) || nowMs - syncedAt > staleMs) return "degraded";
  return "healthy";
}

export function computeOverallCrossChannelHealth(
  channels: CrossChannelChannelHealth[],
): CrossChannelHealthStatus {
  if (channels.length === 0) return "offline";
  const priority: CrossChannelHealthStatus[] = [
    "conflict",
    "offline",
    "degraded",
    "disabled",
    "healthy",
  ];
  for (const status of priority) {
    if (channels.some((c) => c.status === status)) return status;
  }
  return "healthy";
}

export function buildCrossChannelHealthDashboard(params: {
  snapshot: CrossChannelSyncSnapshot;
  connections: Array<{
    id: string;
    provider: string;
    name: string | null;
    settings: CrossChannelInventorySettings;
  }>;
  now?: Date;
}): CrossChannelHealthDashboard {
  const now = params.now ?? new Date();
  const posProductCount = params.snapshot.levels.length;
  const posConflicts = 0;
  const posInSync = params.snapshot.inSyncCount;

  const externalChannels: CrossChannelChannelHealth[] = params.connections.map((conn) => {
    const provider = EXTERNAL_PROVIDER_MAP[conn.provider] ?? "SHOPIFY";
    const mappedProductCount = params.snapshot.levels.filter((level) =>
      level.channels.some((c) => c.connectionId === conn.id),
    ).length;
    const conflictCount = params.snapshot.conflicts.filter(
      (c) => c.channel.connectionId === conn.id,
    ).length;
    const inSyncCount = params.snapshot.levels.filter((level) => {
      const channel = level.channels.find((c) => c.connectionId === conn.id);
      return channel != null && channel.quantity === level.masterQuantity;
    }).length;

    return {
      provider,
      connectionId: conn.id,
      connectionName: conn.name,
      status: computeCrossChannelHealthStatus({
        enabled: conn.settings.enabled,
        mappedProductCount,
        conflictCount,
        lastSyncedAtIso: conn.settings.lastSyncedAtIso ?? null,
        now,
      }),
      lastSyncedAtIso: conn.settings.lastSyncedAtIso ?? null,
      mappedProductCount,
      conflictCount,
      inSyncCount,
    };
  });

  const channels: CrossChannelChannelHealth[] = [
    {
      provider: "POS",
      connectionId: POS_CONNECTION_ID,
      connectionName: "Kitchen spine (POS)",
      status: posProductCount > 0 ? "healthy" : "offline",
      lastSyncedAtIso: params.snapshot.pulledAtIso,
      mappedProductCount: posProductCount,
      conflictCount: posConflicts,
      inSyncCount: posInSync,
    },
    ...externalChannels,
  ];

  return {
    generatedAtIso: now.toISOString(),
    overallStatus: computeOverallCrossChannelHealth(channels),
    channels,
  };
}

export function enrichCrossChannelSnapshotWithHealth(
  snapshot: CrossChannelSyncSnapshot,
  dashboard: CrossChannelHealthDashboard,
): CrossChannelSyncSnapshot {
  return {
    ...snapshot,
    channelHealth: dashboard.channels,
    overallHealth: dashboard.overallStatus,
  };
}

export function detectNewCrossChannelConflicts(
  previousIds: readonly string[],
  conflicts: readonly CrossChannelConflict[],
): CrossChannelConflict[] {
  const prev = new Set(previousIds);
  return conflicts.filter((c) => !prev.has(c.id));
}

export function buildCrossChannelDailyReconciliationReport(params: {
  snapshot: CrossChannelSyncSnapshot;
  channelHealth: CrossChannelChannelHealth[];
  now?: Date;
}): CrossChannelDailyReconciliationReport {
  const now = params.now ?? new Date();
  return {
    reportDateIso: now.toISOString(),
    summary: {
      totalProducts: params.snapshot.levels.length,
      inSyncCount: params.snapshot.inSyncCount,
      conflictCount: params.snapshot.conflicts.length,
      lowStockCount: params.snapshot.lowStockAlerts.length,
      reservationCount: params.snapshot.reservations.length,
    },
    conflicts: params.snapshot.conflicts,
    lowStockAlerts: params.snapshot.lowStockAlerts,
    channelHealth: params.channelHealth,
    notes: [
      ...params.snapshot.notes,
      "Daily reconciliation compares POS master spine to connected sales channels.",
      "DoorDash inventory compare is BETA — push requires partner-approved menu APIs.",
    ],
  };
}

export function formatCrossChannelConflictNotification(params: {
  conflicts: CrossChannelConflict[];
  dashboardUrl: string;
}): { subject: string; text: string } {
  const lines = params.conflicts.map(
    (c) =>
      `- ${c.productTitle} (${c.channel.provider}): master ${c.masterQuantity}, channel ${c.channel.quantity}, delta ${c.delta}`,
  );
  return {
    subject: `[OS Kitchen] ${params.conflicts.length} inventory conflict(s) detected`,
    text: [
      "Cross-channel inventory drift detected between your Kitchen spine and a sales channel.",
      "",
      ...lines,
      "",
      `Review and resolve: ${params.dashboardUrl}`,
      "",
      "SMS alerts are not available — email only.",
    ].join("\n"),
  };
}

export function formatCrossChannelDailyReconciliationEmail(params: {
  report: CrossChannelDailyReconciliationReport;
  dashboardUrl: string;
}): { subject: string; text: string } {
  const { summary, channelHealth } = params.report;
  const channelLines = channelHealth.map(
    (c) =>
      `- ${c.provider}${c.connectionName ? ` (${c.connectionName})` : ""}: ${c.status}, last sync ${c.lastSyncedAtIso ? new Date(c.lastSyncedAtIso).toLocaleString() : "never"}, ${c.conflictCount} conflict(s)`,
  );
  return {
    subject: `[OS Kitchen] Daily inventory reconciliation — ${summary.conflictCount} conflict(s), ${summary.lowStockCount} low-stock`,
    text: [
      "Daily cross-channel inventory reconciliation",
      `Report date: ${new Date(params.report.reportDateIso).toLocaleString()}`,
      "",
      `Products tracked: ${summary.totalProducts}`,
      `In sync: ${summary.inSyncCount}`,
      `Conflicts: ${summary.conflictCount}`,
      `Low stock alerts: ${summary.lowStockCount}`,
      `Active reservations: ${summary.reservationCount}`,
      "",
      "Channel health:",
      ...channelLines,
      "",
      `Open dashboard: ${params.dashboardUrl}`,
    ].join("\n"),
  };
}

export function resolveCrossChannelConflictNotificationRecipient(params: {
  ownerEmail: string | null | undefined;
  settings: CrossChannelInventorySettings;
}): string | null {
  const override = params.settings.notificationEmail?.trim();
  if (override) return override;
  const owner = params.ownerEmail?.trim();
  return owner || null;
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
  const inventoryScope = await storefrontInventoryItemListWhereForOwner(userId);
  const items = await prisma.storefrontInventoryItem.findMany({
    where: inventoryScope,
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
          where: { id: { in: productIds }, menu: { userId } },
          select: { id: true, title: true, barcode: true, maxStorefrontQuantity: true },
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
      sku: product.barcode,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockAt ?? 5,
    });
  }

  for (const product of products) {
    if (masterByProduct.has(product.id)) continue;
    masterByProduct.set(product.id, {
      title: product.title,
      sku: product.barcode,
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

async function loadCrossChannelConnections(userId: string) {
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);
  return prisma.integrationConnection.findMany({
    where: {
      AND: [
        connectionWhere,
        { provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] as IntegrationProvider[] } },
      ],
    },
    select: { id: true, provider: true, name: true, settingsJson: true },
    orderBy: { name: "asc" },
  });
}

async function persistConnectionCrossChannelSettings(
  connectionId: string,
  settings: CrossChannelInventorySettings,
  settingsJson: unknown,
) {
  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      settingsJson: mergeCrossChannelIntoConnectionSettings(
        settingsJson,
        settings,
      ) as Prisma.InputJsonValue,
    },
  });
}

export async function recordCrossChannelConnectionSync(
  userId: string,
  connectionId: string,
  syncedAt: Date = new Date(),
): Promise<void> {
  const connectionWhere = await integrationConnectionListWhereForOwner(userId);
  const conn = await prisma.integrationConnection.findFirst({
    where: { AND: [connectionWhere, { id: connectionId }] },
    select: { id: true, settingsJson: true },
  });
  if (!conn) return;
  const settings = crossChannelSettingsFromConnection(conn.settingsJson);
  await persistConnectionCrossChannelSettings(
    conn.id,
    { ...settings, lastSyncedAtIso: syncedAt.toISOString() },
    conn.settingsJson,
  );
}

async function loadCrossChannelSnapshotWithHealth(
  userId: string,
): Promise<CrossChannelSyncSnapshot> {
  const [productWhere, connectionWhere, masterByProduct, reservations, connections] =
    await Promise.all([
      externalProductListWhereForOwner(userId),
      integrationConnectionListWhereForOwner(userId),
      kitchenProductsForOwner(userId),
      loadAllReservations(userId),
      loadCrossChannelConnections(userId),
    ]);

  const settingsRow = connections[0];
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

  const enabledIds = new Set(
    connections
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

  const snapshot = buildCrossChannelSyncSnapshot({ levels, reservations });
  const dashboard = buildCrossChannelHealthDashboard({
    snapshot,
    connections: connections.map((c) => ({
      id: c.id,
      provider: c.provider,
      name: c.name,
      settings: crossChannelSettingsFromConnection(c.settingsJson),
    })),
  });
  return enrichCrossChannelSnapshotWithHealth(snapshot, dashboard);
}

export async function loadCrossChannelInventorySnapshot(
  userId: string,
): Promise<CrossChannelSyncSnapshot> {
  return loadCrossChannelSnapshotWithHealth(userId);
}

export async function notifyCrossChannelInventoryConflicts(
  userId: string,
  snapshot: CrossChannelSyncSnapshot,
): Promise<{ sent: boolean; skipped: boolean; reason?: string }> {
  const connections = await loadCrossChannelConnections(userId);
  const owner = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const notifyEnabled = connections.some(
    (c) => crossChannelSettingsFromConnection(c.settingsJson).notifyOnConflict !== false,
  );
  if (!notifyEnabled) return { sent: false, skipped: true, reason: "notifications_disabled" };
  if (!isEmailConfigured()) return { sent: false, skipped: true, reason: "email_not_configured" };

  const previousIds = connections.flatMap(
    (c) => crossChannelSettingsFromConnection(c.settingsJson).lastNotifiedConflictIds ?? [],
  );
  const newConflicts = detectNewCrossChannelConflicts(previousIds, snapshot.conflicts);
  if (newConflicts.length === 0) {
    return { sent: false, skipped: true, reason: "no_new_conflicts" };
  }

  const settings = crossChannelSettingsFromConnection(connections[0]?.settingsJson);
  const recipient = resolveCrossChannelConflictNotificationRecipient({
    ownerEmail: owner?.email,
    settings,
  });
  if (!recipient) return { sent: false, skipped: true, reason: "no_recipient" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.oskitchen.com";
  const { subject, text } = formatCrossChannelConflictNotification({
    conflicts: newConflicts,
    dashboardUrl: `${siteUrl}/dashboard/inventory/cross-channel`,
  });

  try {
    await sendRawEmail({ to: recipient, subject, text });
  } catch (e) {
    logger.warn("cross_channel_conflict_notify_failed", e);
    return { sent: false, skipped: true, reason: "send_failed" };
  }

  const mergedIds = [...new Set([...previousIds, ...newConflicts.map((c) => c.id)])].slice(-200);
  for (const conn of connections) {
    const connSettings = crossChannelSettingsFromConnection(conn.settingsJson);
    if (connSettings.notifyOnConflict === false) continue;
    await persistConnectionCrossChannelSettings(
      conn.id,
      { ...connSettings, lastNotifiedConflictIds: mergedIds },
      conn.settingsJson,
    );
  }

  return { sent: true, skipped: false };
}

export async function sendCrossChannelDailyReconciliationEmail(
  userId: string,
): Promise<{
  sent: boolean;
  skipped: boolean;
  reason?: string;
  report?: CrossChannelDailyReconciliationReport;
}> {
  const connections = await loadCrossChannelConnections(userId);
  const digestEnabled = connections.some(
    (c) => crossChannelSettingsFromConnection(c.settingsJson).dailyReconciliationEmail !== false,
  );
  if (!digestEnabled) return { sent: false, skipped: true, reason: "digest_disabled" };
  if (connections.length === 0) return { sent: false, skipped: true, reason: "no_connections" };
  if (!isEmailConfigured()) return { sent: false, skipped: true, reason: "email_not_configured" };

  const owner = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  const settings = crossChannelSettingsFromConnection(connections[0]?.settingsJson);
  const recipient = resolveCrossChannelConflictNotificationRecipient({
    ownerEmail: owner?.email,
    settings,
  });
  if (!recipient) return { sent: false, skipped: true, reason: "no_recipient" };

  const snapshot = await loadCrossChannelInventorySnapshot(userId);
  const report = buildCrossChannelDailyReconciliationReport({
    snapshot,
    channelHealth: snapshot.channelHealth ?? [],
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.oskitchen.com";
  const { subject, text } = formatCrossChannelDailyReconciliationEmail({
    report,
    dashboardUrl: `${siteUrl}/dashboard/inventory/cross-channel`,
  });

  try {
    await sendRawEmail({ to: recipient, subject, text });
  } catch (e) {
    logger.warn("cross_channel_daily_reconciliation_failed", e);
    return { sent: false, skipped: true, reason: "send_failed", report };
  }

  return { sent: true, skipped: false, report };
}

export async function runCrossChannelDailyReconciliationBatch(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  const connections = await prisma.integrationConnection.findMany({
    where: {
      provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] },
    },
    select: { userId: true, settingsJson: true },
    distinct: ["userId"],
    take: 200,
  });

  let sent = 0;
  let skipped = 0;
  for (const row of connections) {
    const settings = crossChannelSettingsFromConnection(row.settingsJson);
    if (settings.dailyReconciliationEmail === false) {
      skipped += 1;
      continue;
    }
    const result = await sendCrossChannelDailyReconciliationEmail(row.userId);
    if (result.sent) sent += 1;
    else skipped += 1;
  }

  return { processed: connections.length, sent, skipped };
}

export async function runCrossChannelInventorySyncPull(userId: string) {
  await runInventorySyncPull(userId);
  const connections = await loadCrossChannelConnections(userId);
  const syncedAt = new Date();
  await Promise.all(
    connections
      .filter((c) => crossChannelSettingsFromConnection(c.settingsJson).enabled)
      .map((c) => recordCrossChannelConnectionSync(userId, c.id, syncedAt)),
  );
  const snapshot = await loadCrossChannelInventorySnapshot(userId);
  await notifyCrossChannelInventoryConflicts(userId, snapshot);
  return snapshot;
}

export async function runCrossChannelInventorySyncPush(
  userId: string,
  connectionId: string,
  strategy: "kitchen_wins" | "channel_wins" | "manual_review",
  conflictId?: string,
) {
  const result = await runInventorySyncPush(userId, connectionId, strategy, conflictId);
  await recordCrossChannelConnectionSync(userId, connectionId);
  const snapshot = await loadCrossChannelInventorySnapshot(userId);
  await notifyCrossChannelInventoryConflicts(userId, snapshot);
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

  const connectionScope = await integrationConnectionListWhereForOwner(userId);
  const settingsRow = await prisma.integrationConnection.findFirst({
    where: {
      AND: [
        connectionScope,
        { provider: { in: ["SHOPIFY", "WOOCOMMERCE", "DOORDASH"] } },
      ],
    },
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
