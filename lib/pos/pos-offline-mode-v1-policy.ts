/**
 * Blueprint P2-88 — POS offline mode v1.0.
 *
 * @see docs/pos-offline-mode-v1.md
 * @see docs/POS_OFFLINE_MODE.md
 * @see app/dashboard/pos/settings/offline/page.tsx
 */

export const POS_OFFLINE_MODE_V1_POLICY_ID = "pos-offline-mode-v1-p2-88-v1" as const;

export const POS_OFFLINE_MODE_V1_DOC = "docs/pos-offline-mode-v1.md" as const;

export const POS_OFFLINE_MODE_V1_LEGACY_DOC = "docs/POS_OFFLINE_MODE.md" as const;

export const POS_OFFLINE_MODE_V1_CONTENT_PATH = "lib/pos/pos-offline-mode-v1-content.ts" as const;

export const POS_OFFLINE_MODE_V1_LOCAL_CART_PATH = "lib/pos/pos-local-cart.ts" as const;

export const POS_OFFLINE_MODE_V1_COMPONENT =
  "components/pos/pos-offline-mode-v1-panel.tsx" as const;

export const POS_OFFLINE_MODE_V1_PAGE = "app/dashboard/pos/settings/offline/page.tsx" as const;

export const POS_OFFLINE_MODE_V1_ROUTE = "/dashboard/pos/settings/offline" as const;

export const POS_OFFLINE_MODE_V1_CAPABILITY_COUNT = 5 as const;

export const POS_OFFLINE_MODE_V1_TEST_IDS = [
  "pos-offline-mode-v1",
  "pos-offline-local-cart",
  "pos-offline-payment-caveat",
  "pos-offline-sync-queue",
  "pos-offline-conflict-resolution",
  "pos-offline-audit-log",
] as const;

export const POS_OFFLINE_MODE_V1_HONESTY_MARKERS = [
  "offline",
  "verify",
  "placeholder",
  "not certified",
  "cash",
] as const;

export const POS_OFFLINE_MODE_V1_AUDIT_SCRIPT = "scripts/audit-pos-offline-mode-v1.ts" as const;

export const POS_OFFLINE_MODE_V1_NPM_SCRIPT = "audit:pos-offline-mode-v1" as const;

export const POS_OFFLINE_MODE_V1_UNIT_TEST = "tests/unit/pos-offline-mode-v1.test.ts" as const;

export const POS_OFFLINE_MODE_V1_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const POS_OFFLINE_MODE_V1_WIRING_PATHS = [
  POS_OFFLINE_MODE_V1_DOC,
  POS_OFFLINE_MODE_V1_CONTENT_PATH,
  POS_OFFLINE_MODE_V1_LOCAL_CART_PATH,
  POS_OFFLINE_MODE_V1_COMPONENT,
  POS_OFFLINE_MODE_V1_PAGE,
  "lib/pos/pos-offline-mode-v1-policy.ts",
  "lib/pos/pos-offline-mode-v1-audit.ts",
  "lib/pos/offline-pos-queue.ts",
  "lib/pos/offline-sync.ts",
  "services/pos/pos-offline-audit-service.ts",
  POS_OFFLINE_MODE_V1_UNIT_TEST,
  POS_OFFLINE_MODE_V1_LEGACY_DOC,
] as const;
