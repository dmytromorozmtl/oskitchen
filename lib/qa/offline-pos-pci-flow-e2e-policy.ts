/**
 * Blueprint P1-21 — Offline POS PCI flow E2E.
 *
 * network off → transaction → network on → sync + noop-v1 PCI contract.
 *
 * @see e2e/offline-pos-pci-flow.spec.ts
 * @see lib/pos/offline-pci-local-encryption.ts
 * @see e2e/helpers/offline-pos-reconnect-sync-flow.ts
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
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";

export const OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID = "offline-pos-pci-flow-e2e-p1-21-v1" as const;

export const OFFLINE_POS_PCI_NOOP_V1_ALGORITHM = "noop-v1" as const;
export const OFFLINE_POS_PCI_AES_GCM_ALGORITHM = "aes-gcm-v1" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_SPEC = "e2e/offline-pos-pci-flow.spec.ts" as const;
export const OFFLINE_POS_PCI_FLOW_E2E_FLOW_HELPER =
  "e2e/helpers/offline-pos-pci-flow-flow.ts" as const;
export const OFFLINE_POS_PCI_FLOW_E2E_READY_HELPER =
  "e2e/helpers/offline-pos-pci-flow-ready.ts" as const;
export const OFFLINE_POS_PCI_FLOW_E2E_AUDIT_SCRIPT =
  "scripts/audit-offline-pos-pci-flow-e2e.ts" as const;
export const OFFLINE_POS_PCI_FLOW_E2E_NPM_SCRIPT = "audit:offline-pos-pci-flow-e2e" as const;
export const OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST =
  "tests/unit/offline-pos-pci-flow-e2e.test.ts" as const;
export const OFFLINE_POS_PCI_FLOW_E2E_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_VISIBLE_MS = 60_000 as const;

export const OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS = [
  "go_offline",
  "aes_gcm_seal",
  "queue_transaction",
  "reconnect_online",
  "sync_drain",
] as const;

export type OfflinePosPciFlowE2EFlowStep =
  (typeof OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS)[number];

export function hasOfflinePosPciFlowE2ECredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isOfflinePosPciFlowE2EEnabled(): boolean {
  return process.env.E2E_OFFLINE_POS_PCI_FLOW?.trim() === "true";
}

export function isNoopV1EmptyOnly(algorithm: string, sealed: string, plaintext: string): boolean {
  if (plaintext.trim().length > 0) {
    return algorithm !== OFFLINE_POS_PCI_NOOP_V1_ALGORITHM;
  }
  return algorithm === OFFLINE_POS_PCI_NOOP_V1_ALGORITHM && sealed === "";
}
