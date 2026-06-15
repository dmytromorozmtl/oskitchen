/**
 * Absolute Final Task 52 — POS offline mode E2E (network disconnect, queue, sync).
 *
 * Reuses QA-31 IndexedDB contract from offline-mode-queue-sync-e2e-policy.
 *
 * @see e2e/pos-offline-mode.spec.ts
 * @see e2e/helpers/offline-mode-queue-sync-flow.ts
 * @see docs/POS_OFFLINE_MODE.md
 */

import {
  OFFLINE_CONNECTIVITY_LABEL,
  OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID,
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_INDEXED_DB_STORE,
  OFFLINE_QUEUED_STATUS_PATTERN,
  OFFLINE_SYNC_SUCCESS_PATTERN,
  ONLINE_CONNECTIVITY_LABEL,
  POS_CHECKOUT_STATUS_TESTID,
  POS_COMPLETE_SALE_TESTID,
  POS_PRODUCT_TILE_TESTID,
  POS_TERMINAL_PATH,
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";

export const POS_OFFLINE_MODE_E2E_POLICY_ID =
  "pos-offline-mode-e2e-absolute-final-v1" as const;

export const POS_OFFLINE_MODE_E2E_SPEC_PATH = "e2e/pos-offline-mode.spec.ts" as const;

export const POS_OFFLINE_MODE_E2E_HELPER_PATH = "e2e/helpers/pos-offline-mode.ts" as const;

export const POS_OFFLINE_MODE_E2E_WORKFLOW_PATH =
  ".github/workflows/e2e-pos-offline-mode.yml" as const;

export const POS_OFFLINE_MODE_E2E_CI_SCRIPTS = [
  "test:ci:pos-offline-mode",
  "test:e2e:pos-offline-mode",
] as const;

export type PosOfflineModeE2ePhase = {
  id: "network_disconnect" | "queue_persist" | "sync_drain";
  label: string;
  description: string;
};

/** Three Playwright phases exercised against the POS terminal. */
export const POS_OFFLINE_MODE_E2E_PHASES: readonly PosOfflineModeE2ePhase[] = [
  {
    id: "network_disconnect",
    label: "Network disconnect",
    description: "context.setOffline(true) surfaces Offline / degraded connectivity label",
  },
  {
    id: "queue_persist",
    label: "Queue persist",
    description: "Cash sale while offline queues in IndexedDB checkout_queue store",
  },
  {
    id: "sync_drain",
    label: "Sync drain",
    description: "context.setOffline(false) replays queue and drains IndexedDB to zero",
  },
] as const;

export const POS_OFFLINE_MODE_E2E_PHASE_COUNT = POS_OFFLINE_MODE_E2E_PHASES.length;

export const POS_OFFLINE_MODE_E2E_CONTRACT = {
  upstreamPolicyId: OFFLINE_MODE_QUEUE_SYNC_E2E_POLICY_ID,
  indexedDbName: OFFLINE_POS_INDEXED_DB_NAME,
  indexedDbStore: OFFLINE_POS_INDEXED_DB_STORE,
  terminalPath: POS_TERMINAL_PATH,
  connectivity: {
    offline: OFFLINE_CONNECTIVITY_LABEL,
    online: ONLINE_CONNECTIVITY_LABEL,
  },
  testIds: {
    productTile: POS_PRODUCT_TILE_TESTID,
    completeSale: POS_COMPLETE_SALE_TESTID,
    checkoutStatus: POS_CHECKOUT_STATUS_TESTID,
  },
  statusPatterns: {
    queued: OFFLINE_QUEUED_STATUS_PATTERN,
    syncSuccess: OFFLINE_SYNC_SUCCESS_PATTERN,
  },
} as const;

export function posOfflineModePhaseIds(): string[] {
  return POS_OFFLINE_MODE_E2E_PHASES.map((phase) => phase.id);
}
