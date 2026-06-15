import type { PosConflictResolutionStrategy } from "@/lib/pos/pos-settings";

export type OfflineSyncState = "idle" | "syncing" | "conflict" | "error";

export type OfflineSyncConflictReason =
  | "duplicate_sale"
  | "inventory_shortage"
  | "product_unavailable"
  | "shift_closed"
  | "plan_blocked"
  | "unknown";

export type OfflineSyncConflict = {
  offlineSaleId: string;
  reason: OfflineSyncConflictReason;
  message: string;
};

export type OfflineSyncResolution = "remove" | "keep_conflict" | "retry_later";

export function classifyOfflineCheckoutError(error: string): OfflineSyncConflictReason {
  const e = error.toLowerCase();
  if (e.includes("already") || e.includes("duplicate")) return "duplicate_sale";
  if (e.includes("inventory") || e.includes("stock") || e.includes("deplet")) return "inventory_shortage";
  if (e.includes("shift")) return "shift_closed";
  if (e.includes("plan") || e.includes("not available on your current plan")) return "plan_blocked";
  if (e.includes("not found") || e.includes("unavailable") || e.includes("invalid")) {
    return "product_unavailable";
  }
  return "unknown";
}

export function resolveOfflineSyncConflict(input: {
  conflict: OfflineSyncConflict;
  strategy: PosConflictResolutionStrategy;
}): OfflineSyncResolution {
  if (input.conflict.reason === "duplicate_sale") return "remove";
  if (input.strategy === "server_wins") return "remove";
  if (input.conflict.reason === "plan_blocked") return "keep_conflict";
  return "keep_conflict";
}

export function offlineSyncStatusLabel(input: {
  online: boolean;
  queuedCount: number;
  conflictCount: number;
  syncState: OfflineSyncState;
}): string {
  if (input.syncState === "syncing") return "Syncing offline sales…";
  if (input.conflictCount > 0) {
    return `${input.conflictCount} offline sale conflict(s) need review`;
  }
  if (!input.online && input.queuedCount > 0) {
    return `Offline — ${input.queuedCount} sale(s) queued for sync`;
  }
  if (!input.online) return "Offline — cash sales queue automatically when enabled";
  if (input.queuedCount > 0) return `${input.queuedCount} sale(s) waiting to sync`;
  return "Online — offline queue ready";
}

export function formatOfflineSyncSuccessMessage(syncedCount: number): string {
  if (syncedCount <= 0) return "No offline orders to sync.";
  const noun = syncedCount === 1 ? "order" : "orders";
  return `${syncedCount} ${noun} synced when back online`;
}

export function offlinePaymentReference(offlineSaleId: string): string {
  return `offline:${offlineSaleId}`;
}
