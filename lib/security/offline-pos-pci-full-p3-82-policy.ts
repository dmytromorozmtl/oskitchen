/**
 * P3-82 — Offline POS PCI full review — AES-GCM path + QSA sign-off artifact.
 *
 * @see docs/offline-pos-pci-full-p3-82.md
 * @see docs/offline-pos-pci-review.md
 */

export const OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID =
  "offline-pos-pci-full-p3-82-v1" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_DOC =
  "docs/offline-pos-pci-full-p3-82.md" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_ARTIFACT =
  "artifacts/offline-pos-pci-full-p3-82.json" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_AUDIT_MODULE =
  "lib/security/offline-pos-pci-full-p3-82-audit.ts" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_SCORING_MODULE =
  "lib/security/offline-pos-pci-full-p3-82-scoring.ts" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_SCENARIO_COUNT = 6 as const;

export const OFFLINE_POS_PCI_FULL_P3_82_CHECK_NPM_SCRIPT =
  "check:offline-pos-pci-full-p3-82" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_UNIT_TEST =
  "tests/unit/offline-pos-pci-full-p3-82.test.ts" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_ENCRYPTION_MODULE =
  "lib/pos/offline-pci-local-encryption.ts" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_AES_GCM_ALGORITHM = "aes-gcm-v1" as const;

/** Engineering pre-QSA pass; external counsel sign-off tracked via P3-81. */
export const OFFLINE_POS_PCI_FULL_P3_82_SIGNOFF_STATUS =
  "engineering_ready_pending_external_qsa" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_QSA_INTRO = "2026-06-24" as const;

export const OFFLINE_POS_PCI_FULL_P3_82_QSA_CHECKLIST = [
  "aes-gcm-v1-non-empty-seal",
  "12-byte-random-iv",
  "32-byte-device-local-key",
  "indexeddb-key-isolation",
  "no-plaintext-fallback",
  "noop-v1-empty-only-upstream-p2-44",
  "e2e-offline-aes-gcm-sync-upstream-p1-35",
  "production-card-claims-blocked-until-external-qsa",
] as const;

export const OFFLINE_POS_PCI_FULL_P3_82_UPSTREAM = [
  "docs/offline-pos-pci-review.md",
  "docs/offline-pos-pci-noop-v1-p2-44.md",
  "docs/offline-pos-pci-flow-e2e-p1-35.md",
  "artifacts/offline-pos-pci-noop-v1-p2-44.json",
  "artifacts/offline-pos-pci-flow-e2e-p1-35.json",
  "artifacts/pen-test-scheduling-p3-81.json",
  "lib/pos/offline-pci-local-encryption.ts",
  "lib/pos/offline-card-pci.ts",
  "tests/unit/offline-pos-pci-encryption.test.ts",
] as const;

export const OFFLINE_POS_PCI_FULL_P3_82_WIRING_PATHS = [
  OFFLINE_POS_PCI_FULL_P3_82_DOC,
  OFFLINE_POS_PCI_FULL_P3_82_ARTIFACT,
  OFFLINE_POS_PCI_FULL_P3_82_AUDIT_MODULE,
  OFFLINE_POS_PCI_FULL_P3_82_SCORING_MODULE,
  OFFLINE_POS_PCI_FULL_P3_82_UNIT_TEST,
  OFFLINE_POS_PCI_FULL_P3_82_CI_WORKFLOW,
  ...OFFLINE_POS_PCI_FULL_P3_82_UPSTREAM,
] as const;
