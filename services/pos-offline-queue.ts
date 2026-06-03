/**
 * Server-side offline POS order queue — staging buffer for replay when connectivity returns.
 * Client IndexedDB queue remains canonical in-browser (`lib/pos/offline-pos-queue.ts`).
 * Does not imply certified hardware offline or EMV store-and-forward while disconnected.
 */
import { randomUUID } from "crypto";

import type { PosCheckoutInput } from "@/services/pos/pos-checkout-service";
import { checkoutPosSale } from "@/services/pos/pos-checkout-service";
import { formatOfflineSyncSuccessMessage } from "@/lib/pos/offline-sync";
import type { OfflineCardCaptureInput } from "@/lib/pos/offline-card-pci";
import { resetOfflineCardCapturesForTests } from "@/services/pos/offline-card-service";

export { formatOfflineSyncSuccessMessage };

export type OfflinePosQueueEntryStatus = "pending" | "synced" | "failed" | "conflict";

export type OfflinePosQueueMetadata = {
  tableId?: string | null;
  deviceId?: string | null;
  /** PCI-safe card metadata staged with the offline order (last4 + brand only). */
  offlineCard?: {
    last4: string;
    cardBrand: string;
    paymentIntentId?: string | null;
  };
};

export type { OfflineCardCaptureRecord as OfflineCardQueueEntry } from "@/services/pos/offline-card-service";

export type OfflinePosQueuedOrder = {
  id: string;
  userId: string;
  workspaceId: string | null;
  payload: PosCheckoutInput;
  metadata: OfflinePosQueueMetadata;
  createdAt: string;
  status: OfflinePosQueueEntryStatus;
  lastError?: string;
};

export type OfflinePosQueuedReceipt = {
  id: string;
  userId: string;
  workspaceId: string | null;
  offlineSaleId: string;
  orderId: string | null;
  receiptText: string;
  createdAt: string;
  status: "pending" | "printed" | "failed";
  lastError?: string;
};

export type OfflinePosPreAuthorization = {
  id: string;
  userId: string;
  workspaceId: string | null;
  offlineSaleId: string;
  registerId: string;
  tableId: string | null;
  deviceId: string | null;
  amountCents: number;
  currency: string;
  cardBrand?: string;
  last4?: string;
  paymentIntentId?: string | null;
  orderId?: string | null;
  createdAt: string;
  status: "pending" | "captured" | "failed" | "expired";
  lastError?: string;
};

export type OfflinePosTableConflict = {
  tableId: string;
  orderIds: string[];
  deviceIds: string[];
};

const queues = new Map<string, OfflinePosQueuedOrder[]>();
const receiptQueues = new Map<string, OfflinePosQueuedReceipt[]>();
const preAuthQueues = new Map<string, OfflinePosPreAuthorization[]>();
const syncStats = new Map<string, { syncedTotal: number; lastSyncedAtIso: string | null }>();

function queueKey(userId: string, workspaceId: string | null): string {
  return `${userId}:${workspaceId ?? "none"}`;
}

export function detectOfflineTableConflicts(
  orders: readonly OfflinePosQueuedOrder[],
): OfflinePosTableConflict[] {
  const pending = orders.filter((entry) => entry.status === "pending");
  const byTable = new Map<string, OfflinePosQueuedOrder[]>();

  for (const order of pending) {
    const tableId = order.metadata.tableId?.trim();
    if (!tableId) continue;
    const list = byTable.get(tableId) ?? [];
    list.push(order);
    byTable.set(tableId, list);
  }

  const conflicts: OfflinePosTableConflict[] = [];
  for (const [tableId, rows] of byTable) {
    const deviceIds = [...new Set(rows.map((r) => r.metadata.deviceId ?? "unknown"))];
    if (rows.length > 1 && deviceIds.length > 1) {
      conflicts.push({
        tableId,
        orderIds: rows.map((r) => r.id),
        deviceIds,
      });
    }
  }
  return conflicts;
}

export async function getOfflineQueueStats(input: {
  userId: string;
  workspaceId?: string | null;
}): Promise<{
  pendingOrders: number;
  syncedOrders: number;
  failedOrders: number;
  conflictOrders: number;
  pendingReceipts: number;
  pendingPreAuths: number;
  pendingCardCaptures: number;
  failedCardCaptures: number;
  capturedCardCaptures: number;
  lastSyncedAtIso: string | null;
  syncedTotal: number;
  tableConflicts: OfflinePosTableConflict[];
}> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const orders = queues.get(key) ?? [];
  const receipts = receiptQueues.get(key) ?? [];
  const preAuths = preAuthQueues.get(key) ?? [];
  const stats = syncStats.get(key) ?? { syncedTotal: 0, lastSyncedAtIso: null };
  const { getOfflineCardDashboard } = await import("@/services/pos/offline-card-service");
  const cardStats = await getOfflineCardDashboard({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
  });

  return {
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    syncedOrders: orders.filter((o) => o.status === "synced").length,
    failedOrders: orders.filter((o) => o.status === "failed").length,
    conflictOrders: orders.filter((o) => o.status === "conflict").length,
    pendingReceipts: receipts.filter((r) => r.status === "pending").length,
    pendingPreAuths: preAuths.filter((p) => p.status === "pending").length,
    pendingCardCaptures: cardStats.queued,
    failedCardCaptures: cardStats.failed,
    capturedCardCaptures: cardStats.captured,
    lastSyncedAtIso: stats.lastSyncedAtIso,
    syncedTotal: stats.syncedTotal,
    tableConflicts: detectOfflineTableConflicts(orders),
  };
}

/** Stage a POS checkout payload for later sync (e.g. device regained connectivity). */
export async function queueOrder(input: {
  userId: string;
  workspaceId?: string | null;
  payload: PosCheckoutInput;
  metadata?: OfflinePosQueueMetadata;
}): Promise<{ id: string }> {
  const id = randomUUID();
  const entry: OfflinePosQueuedOrder = {
    id,
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    payload: input.payload,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const key = queueKey(input.userId, entry.workspaceId);
  const list = queues.get(key) ?? [];
  list.push(entry);
  queues.set(key, list);

  const offlineSaleId = input.payload.offlineSaleId?.trim();
  const cardMeta = input.metadata?.offlineCard;
  if (
    offlineSaleId &&
    cardMeta &&
    input.payload.paymentMode === "OFFLINE_CARD_QUEUED"
  ) {
    await queueOfflineCardCapture({
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      capture: {
        offlineSaleId,
        registerId: input.payload.registerId,
        amountCents: Math.round(
          input.payload.lines.reduce(
            (sum, line) => sum + line.quantity * line.unitPrice,
            0,
          ) * 100,
        ),
        cardBrand: cardMeta.cardBrand,
        last4: cardMeta.last4,
        paymentIntentId: cardMeta.paymentIntentId ?? undefined,
        tableId: input.metadata?.tableId ?? null,
        deviceId: input.metadata?.deviceId ?? null,
      },
    });
  }

  return { id };
}

/** Queue receipt text for browser print when connectivity returns. */
export async function queueReceiptPrint(input: {
  userId: string;
  workspaceId?: string | null;
  offlineSaleId: string;
  receiptText: string;
  orderId?: string | null;
}): Promise<{ id: string }> {
  const id = randomUUID();
  const entry: OfflinePosQueuedReceipt = {
    id,
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    offlineSaleId: input.offlineSaleId,
    orderId: input.orderId ?? null,
    receiptText: input.receiptText,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const key = queueKey(input.userId, entry.workspaceId);
  const list = receiptQueues.get(key) ?? [];
  list.push(entry);
  receiptQueues.set(key, list);
  return { id };
}

/**
 * Store card pre-authorization metadata for capture when online.
 * Does not perform EMV store-and-forward — Stripe Terminal capture required when connected.
 */
export async function storeOfflinePreAuthorization(input: {
  userId: string;
  workspaceId?: string | null;
  offlineSaleId: string;
  registerId: string;
  amountCents: number;
  currency?: string;
  tableId?: string | null;
  deviceId?: string | null;
  cardBrand?: string;
  last4?: string;
  paymentIntentId?: string | null;
  orderId?: string | null;
}): Promise<{ id: string }> {
  const id = randomUUID();
  const entry: OfflinePosPreAuthorization = {
    id,
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    offlineSaleId: input.offlineSaleId,
    registerId: input.registerId,
    tableId: input.tableId ?? null,
    deviceId: input.deviceId ?? null,
    amountCents: Math.max(0, Math.round(input.amountCents)),
    currency: input.currency ?? "usd",
    cardBrand: input.cardBrand,
    last4: input.last4,
    paymentIntentId: input.paymentIntentId ?? null,
    orderId: input.orderId ?? null,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const key = queueKey(input.userId, entry.workspaceId);
  const list = preAuthQueues.get(key) ?? [];
  list.push(entry);
  preAuthQueues.set(key, list);
  return { id };
}

/** Stage PCI-safe offline card capture metadata for sync when Stripe Terminal is online. */
export async function queueOfflineCardCapture(input: {
  userId: string;
  workspaceId?: string | null;
  capture: OfflineCardCaptureInput;
  orderId?: string | null;
}): Promise<{ id: string }> {
  const { enqueueOfflineCardCapture, linkOfflineCardCaptureToOrder } =
    await import("@/services/pos/offline-card-service");

  const result = await enqueueOfflineCardCapture({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    capture: input.capture,
  });

  if (input.orderId) {
    await linkOfflineCardCaptureToOrder({
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      offlineSaleId: input.capture.offlineSaleId,
      orderId: input.orderId,
    });
  }

  return { id: result.id };
}

export async function getPendingOfflineCardCaptures(input: {
  userId: string;
  workspaceId?: string | null;
}) {
  const { listOfflineCardCaptures } = await import("@/services/pos/offline-card-service");
  return listOfflineCardCaptures({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    status: "queued",
  });
}

export async function linkOfflineCardQueueToOrder(input: {
  userId: string;
  workspaceId?: string | null;
  offlineSaleId: string;
  orderId: string;
}): Promise<boolean> {
  const { linkOfflineCardCaptureToOrder } = await import("@/services/pos/offline-card-service");
  return linkOfflineCardCaptureToOrder(input);
}

export async function syncOfflineCardQueue(input: {
  userId: string;
  workspaceId?: string | null;
  online?: boolean;
}) {
  const { syncOfflineCardCaptures } = await import("@/services/pos/offline-card-service");
  return syncOfflineCardCaptures({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    online: input.online ?? true,
  });
}

/** List queued orders for an owner workspace (pending by default). */
export async function getQueue(input: {
  userId: string;
  workspaceId?: string | null;
  includeSynced?: boolean;
}): Promise<OfflinePosQueuedOrder[]> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const list = queues.get(key) ?? [];
  if (input.includeSynced) {
    return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  return list
    .filter((entry) => entry.status === "pending")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getPendingReceipts(input: {
  userId: string;
  workspaceId?: string | null;
}): Promise<OfflinePosQueuedReceipt[]> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  return (receiptQueues.get(key) ?? []).filter((r) => r.status === "pending");
}

export async function getPendingPreAuthorizations(input: {
  userId: string;
  workspaceId?: string | null;
}): Promise<OfflinePosPreAuthorization[]> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  return (preAuthQueues.get(key) ?? []).filter((p) => p.status === "pending");
}

export type SyncQueueResult = {
  attempted: number;
  synced: number;
  failed: number;
  conflicts: number;
  receiptsPrinted: number;
  preAuthsCaptured: number;
  cardsCaptured: number;
  cardsFailed: number;
  tableConflicts: OfflinePosTableConflict[];
  syncedMessage: string;
  errors: Array<{ id: string; error: string }>;
};

export type PosCheckoutHandler = (
  userId: string,
  performedByUserId: string,
  payload: PosCheckoutInput,
) => Promise<{ ok: true; orderId: string; transactionId: string; receiptNumber: string } | { ok: false; error: string }>;

async function flushReceiptQueue(input: {
  userId: string;
  workspaceId?: string | null;
}): Promise<number> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const list = receiptQueues.get(key) ?? [];
  let printed = 0;
  for (const receipt of list) {
    if (receipt.status !== "pending") continue;
    receipt.status = "printed";
    printed += 1;
  }
  return printed;
}

async function capturePendingPreAuthorizations(input: {
  userId: string;
  workspaceId?: string | null;
  online: boolean;
}): Promise<{ staged: number; failed: number }> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const list = preAuthQueues.get(key) ?? [];
  let staged = 0;
  let failed = 0;

  for (const preAuth of list) {
    if (preAuth.status !== "pending") continue;
    if (!input.online) continue;

    if (!preAuth.last4 || !preAuth.cardBrand) {
      preAuth.status = "failed";
      preAuth.lastError =
        "Card capture requires PCI-safe last4/brand metadata — reconnect and sync offline card queue.";
      failed += 1;
      continue;
    }

    await queueOfflineCardCapture({
      userId: preAuth.userId,
      workspaceId: preAuth.workspaceId,
      capture: {
        offlineSaleId: preAuth.offlineSaleId,
        registerId: preAuth.registerId,
        amountCents: preAuth.amountCents,
        currency: preAuth.currency,
        cardBrand: preAuth.cardBrand,
        last4: preAuth.last4,
        paymentIntentId: preAuth.paymentIntentId ?? undefined,
        tableId: preAuth.tableId,
        deviceId: preAuth.deviceId,
      },
      orderId: preAuth.orderId,
    });
    preAuth.status = "captured";
    staged += 1;
  }

  return { staged, failed };
}

function markTableConflicts(orders: OfflinePosQueuedOrder[]): number {
  const conflicts = detectOfflineTableConflicts(orders);
  let marked = 0;
  for (const conflict of conflicts) {
    for (const orderId of conflict.orderIds) {
      const entry = orders.find((o) => o.id === orderId);
      if (!entry || entry.status !== "pending") continue;
      entry.status = "conflict";
      entry.lastError = `Table ${conflict.tableId} modified offline on multiple devices`;
      marked += 1;
    }
  }
  return marked;
}

/** Replay pending queued checkouts through the canonical POS checkout path. */
export async function syncQueue(input: {
  userId: string;
  workspaceId?: string | null;
  performedByUserId?: string;
  online?: boolean;
  checkoutHandler?: PosCheckoutHandler;
}): Promise<SyncQueueResult> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const list = queues.get(key) ?? [];
  const tableConflictCount = markTableConflicts(list);
  const pending = list.filter((entry) => entry.status === "pending");
  const checkout = input.checkoutHandler ?? checkoutPosSale;
  const result: SyncQueueResult = {
    attempted: pending.length,
    synced: 0,
    failed: 0,
    conflicts: tableConflictCount,
    receiptsPrinted: 0,
    preAuthsCaptured: 0,
    cardsCaptured: 0,
    cardsFailed: 0,
    tableConflicts: detectOfflineTableConflicts(list),
    syncedMessage: "No offline orders to sync.",
    errors: [],
  };

  const performer = input.performedByUserId ?? input.userId;

  for (const entry of pending) {
    const checkoutResult = await checkout(input.userId, performer, entry.payload);
    if (checkoutResult.ok) {
      entry.status = "synced";
      entry.lastError = undefined;
      result.synced += 1;

      const offlineSaleId = entry.payload.offlineSaleId?.trim();
      if (offlineSaleId && entry.payload.paymentMode === "OFFLINE_CARD_QUEUED") {
        await linkOfflineCardQueueToOrder({
          userId: input.userId,
          workspaceId: input.workspaceId ?? null,
          offlineSaleId,
          orderId: checkoutResult.orderId,
        }).catch(() => false);
      }
      continue;
    }

    entry.status = "failed";
    entry.lastError = checkoutResult.error;
    result.failed += 1;
    result.errors.push({ id: entry.id, error: checkoutResult.error });
  }

  result.receiptsPrinted = await flushReceiptQueue(input);
  const preAuthResult = await capturePendingPreAuthorizations({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    online: input.online ?? true,
  });
  if (preAuthResult.failed > 0) {
    result.failed += preAuthResult.failed;
  }

  const cardSync = await syncOfflineCardQueue({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    online: input.online ?? true,
  });
  result.cardsCaptured = cardSync.captured;
  result.cardsFailed = cardSync.failed;
  result.preAuthsCaptured = preAuthResult.staged + cardSync.captured;
  if (cardSync.failed > 0) {
    result.failed += cardSync.failed;
    for (const err of cardSync.errors) {
      result.errors.push(err);
    }
  }

  result.syncedMessage = formatOfflineSyncSuccessMessage(result.synced);
  const stats = syncStats.get(key) ?? { syncedTotal: 0, lastSyncedAtIso: null };
  stats.syncedTotal += result.synced;
  stats.lastSyncedAtIso = result.synced > 0 ? new Date().toISOString() : stats.lastSyncedAtIso;
  syncStats.set(key, stats);

  return result;
}

/** Stress test: queue N offline orders and replay through injectable checkout handler. */
export async function stressTestOfflineQueue(input: {
  userId: string;
  workspaceId?: string | null;
  orderCount?: number;
  checkoutHandler?: PosCheckoutHandler;
}): Promise<SyncQueueResult & { queued: number; durationMs: number }> {
  const orderCount = input.orderCount ?? 100;
  const started = Date.now();
  const basePayload: PosCheckoutInput = {
    registerId: randomUUID(),
    shiftId: null,
    staffMemberId: null,
    locationId: null,
    brandId: null,
    customerId: null,
    fulfillmentDetail: "PICKUP",
    paymentMode: "CASH",
    lines: [{ title: "Stress item", quantity: 1, unitPrice: 9.99 }],
  };

  for (let i = 0; i < orderCount; i += 1) {
    await queueOrder({
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      payload: { ...basePayload, offlineSaleId: `stress-${i}` },
      metadata: { deviceId: i % 2 === 0 ? "device-a" : "device-b", tableId: i % 10 === 0 ? "table-1" : null },
    });
  }

  const mockCheckout: PosCheckoutHandler =
    input.checkoutHandler ??
    (async () => ({
      ok: true as const,
      orderId: randomUUID(),
      transactionId: randomUUID(),
      receiptNumber: `POS-STRESS-${Date.now()}`,
    }));

  const syncResult = await syncQueue({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    checkoutHandler: mockCheckout,
    online: true,
  });

  return {
    ...syncResult,
    queued: orderCount,
    durationMs: Date.now() - started,
  };
}

/** Test-only reset — clears in-memory queues. */
export function resetOfflinePosQueuesForTests(): void {
  queues.clear();
  receiptQueues.clear();
  preAuthQueues.clear();
  syncStats.clear();
  resetOfflineCardCapturesForTests();
}
