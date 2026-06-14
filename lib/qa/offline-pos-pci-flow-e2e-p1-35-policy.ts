/**
 * P1-35 — Offline POS PCI flow E2E: offline → AES-GCM → network → sync.
 *
 * @see docs/offline-pos-pci-flow-e2e-p1-35.md
 * @see e2e/offline-pos-pci-flow.spec.ts
 */

export {
  OFFLINE_POS_PCI_AES_GCM_ALGORITHM,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
  OFFLINE_POS_PCI_FLOW_E2E_SPEC,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_HELPER,
  OFFLINE_POS_PCI_FLOW_E2E_READY_HELPER,
  OFFLINE_POS_PCI_FLOW_E2E_AUDIT_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST,
  POS_TERMINAL_PATH,
  hasOfflinePosPciFlowE2ECredentials,
  isOfflinePosPciFlowE2EEnabled,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID =
  "offline-pos-pci-flow-e2e-p1-35-v1" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_DOC =
  "docs/offline-pos-pci-flow-e2e-p1-35.md" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_ARTIFACT =
  "artifacts/offline-pos-pci-flow-e2e-p1-35.json" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_AUDIT_MODULE =
  "lib/qa/offline-pos-pci-flow-e2e-p1-35-audit.ts" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHECK_NPM_SCRIPT =
  "check:offline-pos-pci-flow-p1-35" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_CI_NPM_SCRIPT =
  "test:ci:offline-pos-pci-flow-p1-35" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_UNIT_TEST =
  "tests/unit/offline-pos-pci-flow-e2e-p1-35.test.ts" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_E2E_NPM_SCRIPT =
  "test:e2e:offline-pos-pci-flow" as const;

/** Gap-closure chain: network off → seal card metadata → queue → reconnect → sync. */
export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHAIN = [
  "offline",
  "aes_gcm",
  "network",
  "sync",
] as const;

export const OFFLINE_POS_PCI_FLOW_E2E_P1_35_WIRING_PATHS = [
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_DOC,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_AUDIT_MODULE,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_UNIT_TEST,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_ARTIFACT,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_CI_WORKFLOW,
  "lib/qa/offline-pos-pci-flow-e2e-policy.ts",
  "lib/qa/offline-pos-pci-flow-e2e-scoring.ts",
  "e2e/offline-pos-pci-flow.spec.ts",
  "e2e/helpers/offline-pos-pci-flow-flow.ts",
  "lib/pos/offline-pci-local-encryption.ts",
] as const;
