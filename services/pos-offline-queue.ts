/**
 * Server-side offline POS order queue — staging buffer for replay when connectivity returns.
 * Client IndexedDB queue remains canonical in-browser (`lib/pos/offline-pos-queue.ts`).
 * Does not imply certified hardware offline or card capture while disconnected.
 */
import { randomUUID } from "crypto";

import type { PosCheckoutInput } from "@/services/pos/pos-checkout-service";
import { checkoutPosSale } from "@/services/pos/pos-checkout-service";

export type OfflinePosQueuedOrder = {
  id: string;
  userId: string;
  workspaceId: string | null;
  payload: PosCheckoutInput;
  createdAt: string;
  status: "pending" | "synced" | "failed";
  lastError?: string;
};

const queues = new Map<string, OfflinePosQueuedOrder[]>();

function queueKey(userId: string, workspaceId: string | null): string {
  return `${userId}:${workspaceId ?? "none"}`;
}

/** Stage a POS checkout payload for later sync (e.g. device regained connectivity). */
export async function queueOrder(input: {
  userId: string;
  workspaceId?: string | null;
  payload: PosCheckoutInput;
}): Promise<{ id: string }> {
  const id = randomUUID();
  const entry: OfflinePosQueuedOrder = {
    id,
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    payload: input.payload,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const key = queueKey(input.userId, entry.workspaceId);
  const list = queues.get(key) ?? [];
  list.push(entry);
  queues.set(key, list);
  return { id };
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

export type SyncQueueResult = {
  attempted: number;
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
};

/** Replay pending queued checkouts through the canonical POS checkout path. */
export async function syncQueue(input: {
  userId: string;
  workspaceId?: string | null;
  performedByUserId?: string;
}): Promise<SyncQueueResult> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const list = queues.get(key) ?? [];
  const pending = list.filter((entry) => entry.status === "pending");
  const result: SyncQueueResult = {
    attempted: pending.length,
    synced: 0,
    failed: 0,
    errors: [],
  };

  const performer = input.performedByUserId ?? input.userId;

  for (const entry of pending) {
    const checkout = await checkoutPosSale(input.userId, performer, entry.payload);
    if (checkout.ok) {
      entry.status = "synced";
      entry.lastError = undefined;
      result.synced += 1;
      continue;
    }

    entry.status = "failed";
    entry.lastError = checkout.error;
    result.failed += 1;
    result.errors.push({ id: entry.id, error: checkout.error });
  }

  return result;
}
