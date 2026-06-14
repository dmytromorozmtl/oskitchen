/**
 * P2-44 — Offline POS PCI noop-v1 QSA/engineering review (retain empty-only sentinel).
 *
 * @see docs/offline-pos-pci-noop-v1-p2-44.md
 * @see lib/pos/offline-pci-noop-v1-review.ts
 */

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID =
  "offline-pos-pci-noop-v1-p2-44-v1" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_DOC =
  "docs/offline-pos-pci-noop-v1-p2-44.md" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_ARTIFACT =
  "artifacts/offline-pos-pci-noop-v1-p2-44.json" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_CHECK_NPM_SCRIPT =
  "check:offline-pos-pci-noop-v1-p2-44" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_CI_NPM_SCRIPT =
  "test:ci:offline-pos-pci-noop-v1-p2-44" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_UNIT_TEST =
  "tests/unit/offline-pos-pci-noop-v1-p2-44.test.ts" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_ENCRYPTION_MODULE =
  "lib/pos/offline-pci-local-encryption.ts" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_REVIEW_MODULE =
  "lib/pos/offline-pci-noop-v1-review.ts" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_PCI_REVIEW_DOC =
  "docs/offline-pos-pci-review.md" as const;

/** Engineering QSA pre-review decision — retain empty-only noop-v1, do not remove algorithm. */
export const OFFLINE_POS_PCI_NOOP_V1_P2_44_DECISION = "retain-empty-only" as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_FORBIDDEN_PATTERNS = [
  "btoa(trimmed)",
] as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_REQUIRED_GATES = [
  "assertOfflinePciEncryptionAvailable",
  "canQueueOfflineCardCapture",
  "OfflinePciEncryptionUnavailableError",
] as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_WIRING_PATHS = [
  OFFLINE_POS_PCI_NOOP_V1_P2_44_DOC,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_ARTIFACT,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_UNIT_TEST,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_ENCRYPTION_MODULE,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_REVIEW_MODULE,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_PCI_REVIEW_DOC,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_CI_WORKFLOW,
  "lib/pos/offline-card-pci.ts",
] as const;

export const OFFLINE_POS_PCI_NOOP_V1_P2_44_QSA_CHECKLIST = [
  "empty-only-noop-v1-seal",
  "no-btoa-plaintext-fallback",
  "web-crypto-gate-for-non-empty",
  "legacy-unseal-migration-read-only",
  "production-card-claims-blocked-until-qsa",
] as const;
