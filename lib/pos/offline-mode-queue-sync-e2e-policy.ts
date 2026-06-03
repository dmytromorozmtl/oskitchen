/**
 * Offline POS queue + sync E2E policy (QA-31).
 *
 * Client IndexedDB queue → online replay via `posCheckoutAction` / server `syncQueue`.
 *
 * @see e2e/offline-mode-queue-sync.spec.ts
 * @see lib/pos/offline-pos-queue.ts
 * @see services/pos-offline-queue.ts
 */

export const OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID = "offline-mode-queue-sync-e2e-v1" as const;

export const OFFLINE_MODE_QUEUE_SYNC_SLI_ID = "pos.offline_queue_sync_drain" as const;

/** Client-side IndexedDB (browser). */
export const OFFLINE_POS_INDEXED_DB_NAME = "kitchenos-offline-pos" as const;
export const OFFLINE_POS_INDEXED_DB_STORE = "checkout_queue" as const;

export const POS_TERMINAL_PATH = "/dashboard/pos/terminal" as const;

export const POS_PRODUCT_TILE_TESTID = "pos-product-tile" as const;
export const POS_COMPLETE_SALE_TESTID = "pos-complete-sale" as const;
export const POS_CHECKOUT_STATUS_TESTID = "pos-checkout-status" as const;

export const OFFLINE_CONNECTIVITY_LABEL = "Offline / degraded" as const;
export const ONLINE_CONNECTIVITY_LABEL = "Online" as const;

export const OFFLINE_QUEUED_STATUS_PATTERN =
  /offline.*queued|queued.*sync/i as const;

export const OFFLINE_SYNC_SUCCESS_PATTERN =
  /Synced \d+ offline sale\(s\)|sale complete|not available on your current plan/i as const;

export const OFFLINE_PLAN_BLOCKED_PATTERN =
  /not available on your current plan|POS is not available/i as const;

export type OfflineQueueSyncPhase =
  | "idle"
  | "offline_queued"
  | "online_syncing"
  | "drained"
  | "plan_blocked";

export type OfflineQueueSyncContract = {
  queuedBeforeSync: number;
  queuedAfterSync: number;
  syncedCount: number;
  tableConflictCount: number;
};

export function isOfflineQueueDrained(contract: Pick<OfflineQueueSyncContract, "queuedAfterSync">): boolean {
  return contract.queuedAfterSync === 0;
}

export function offlineQueueSyncSucceeded(contract: OfflineQueueSyncContract): boolean {
  return (
    contract.queuedBeforeSync > 0 &&
    contract.syncedCount > 0 &&
    isOfflineQueueDrained(contract)
  );
}

export function hasOfflineTableConflicts(tableConflictCount: number): boolean {
  return tableConflictCount > 0;
}

export function resolveOfflineQueueSyncPhase(input: {
  online: boolean;
  queuedCount: number;
  planBlocked: boolean;
}): OfflineQueueSyncPhase {
  if (input.planBlocked) return "plan_blocked";
  if (!input.online && input.queuedCount > 0) return "offline_queued";
  if (input.online && input.queuedCount > 0) return "online_syncing";
  if (input.online && input.queuedCount === 0) return "drained";
  return "idle";
}
