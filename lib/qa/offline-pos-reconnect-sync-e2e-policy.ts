/**
 * Blueprint P1-49 — Offline POS → reconnect → sync E2E (offline mode).
 *
 * @see e2e/offline-pos-reconnect-sync.spec.ts
 * @see e2e/offline-mode-queue-sync.spec.ts
 * @see lib/pos/offline-mode-queue-sync-e2e-policy.ts
 */

export {
  OFFLINE_CONNECTIVITY_LABEL,
  OFFLINE_PLAN_BLOCKED_PATTERN,
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_INDEXED_DB_STORE,
  OFFLINE_QUEUED_STATUS_PATTERN,
  OFFLINE_SYNC_SUCCESS_PATTERN,
  ONLINE_CONNECTIVITY_LABEL,
  POS_CHECKOUT_STATUS_TESTID,
  POS_COMPLETE_SALE_TESTID,
  POS_PRODUCT_TILE_TESTID,
  POS_TERMINAL_PATH,
  isOfflineQueueDrained,
  offlineQueueSyncSucceeded,
  resolveOfflineQueueSyncPhase,
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";

export const OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID =
  "offline-pos-reconnect-sync-e2e-v1" as const;

export const OFFLINE_POS_RECONNECT_SYNC_VISIBLE_MS = 60_000 as const;

export const OFFLINE_POS_RECONNECT_SYNC_E2E_SPEC =
  "e2e/offline-pos-reconnect-sync.spec.ts" as const;
export const OFFLINE_POS_RECONNECT_SYNC_FLOW_HELPER =
  "e2e/helpers/offline-pos-reconnect-sync-flow.ts" as const;
export const OFFLINE_POS_RECONNECT_SYNC_READY_HELPER =
  "e2e/helpers/offline-pos-reconnect-sync-ready.ts" as const;
export const OFFLINE_POS_RECONNECT_SYNC_AUDIT_SCRIPT =
  "scripts/audit-offline-pos-reconnect-sync-e2e.ts" as const;
export const OFFLINE_POS_RECONNECT_SYNC_NPM_SCRIPT =
  "audit:offline-pos-reconnect-sync-e2e" as const;
export const OFFLINE_POS_RECONNECT_SYNC_UNIT_TEST =
  "tests/unit/offline-pos-reconnect-sync-e2e.test.ts" as const;
export const OFFLINE_POS_RECONNECT_SYNC_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS = [
  "go_offline",
  "queue_sale",
  "reconnect_online",
  "sync_drain",
] as const;

export type OfflinePosReconnectSyncFlowStep =
  (typeof OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS)[number];

export function hasOfflinePosReconnectSyncCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isOfflinePosReconnectSyncE2EEnabled(): boolean {
  return process.env.E2E_OFFLINE_POS_E2E?.trim() === "true";
}
