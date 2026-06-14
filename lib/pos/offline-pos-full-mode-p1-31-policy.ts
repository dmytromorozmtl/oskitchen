/**
 * P1-31 — Offline POS full mode (Toast parity) + PCI noop-v1 fallback review.
 *
 * @see docs/offline-pos-full-mode-p1-31.md
 */

export const OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID =
  "offline-pos-full-mode-p1-31-v1" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_DOC =
  "docs/offline-pos-full-mode-p1-31.md" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_ARTIFACT =
  "artifacts/offline-pos-full-mode-p1-31.json" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_CONTENT =
  "lib/pos/offline-pos-full-mode-p1-31-content.ts" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_COMPONENT =
  "components/pos/pos-offline-full-mode-panel.tsx" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_PAGE =
  "app/dashboard/pos/settings/offline/page.tsx" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_ROUTE = "/dashboard/pos/settings/offline" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_MENU_CACHE =
  "lib/pos/pos-offline-menu-cache.ts" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_NOOP_REVIEW =
  "lib/pos/offline-pci-noop-v1-review.ts" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_ENCRYPTION =
  "lib/pos/offline-pci-local-encryption.ts" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_TERMINAL_CLIENT =
  "components/dashboard/pos-terminal-client.tsx" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_TEST_ID = "pos-offline-full-mode-p1-31" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_CHECK_NPM_SCRIPT =
  "check:offline-pos-full-mode-p1-31" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_CI_NPM_SCRIPT =
  "test:ci:offline-pos-full-mode-p1-31" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_UNIT_TEST =
  "tests/unit/offline-pos-full-mode-p1-31.test.ts" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const OFFLINE_POS_FULL_MODE_P1_31_FLOW_STEPS = [
  "menu-cache",
  "local-cart",
  "cash-offline",
  "pci-aes-gcm",
  "sync-queue",
  "conflict-resolution",
  "noop-v1-review",
] as const;

export const OFFLINE_POS_FULL_MODE_P1_31_WIRING_PATHS = [
  OFFLINE_POS_FULL_MODE_P1_31_DOC,
  OFFLINE_POS_FULL_MODE_P1_31_CONTENT,
  OFFLINE_POS_FULL_MODE_P1_31_COMPONENT,
  OFFLINE_POS_FULL_MODE_P1_31_PAGE,
  OFFLINE_POS_FULL_MODE_P1_31_MENU_CACHE,
  OFFLINE_POS_FULL_MODE_P1_31_NOOP_REVIEW,
  OFFLINE_POS_FULL_MODE_P1_31_ENCRYPTION,
  OFFLINE_POS_FULL_MODE_P1_31_TERMINAL_CLIENT,
  OFFLINE_POS_FULL_MODE_P1_31_UNIT_TEST,
  OFFLINE_POS_FULL_MODE_P1_31_ARTIFACT,
  OFFLINE_POS_FULL_MODE_P1_31_CI_WORKFLOW,
] as const;
