/**
 * Blueprint P2-98 — Purchase suggestions AI (forecast, low stock, menu demand, vendor price).
 *
 * @see docs/purchase-suggestions-ai.md
 * @see app/dashboard/inventory/purchase-suggestions/page.tsx
 */

export const PURCHASE_SUGGESTIONS_P2_98_POLICY_ID = "purchase-suggestions-p2-98-v1" as const;

export const PURCHASE_SUGGESTIONS_P2_98_DOC = "docs/purchase-suggestions-ai.md" as const;

export const PURCHASE_SUGGESTIONS_P2_98_LEGACY_POLICY = "lib/ai/ai-purchasing-builders.ts" as const;

export const PURCHASE_SUGGESTIONS_P2_98_CONTENT_PATH =
  "lib/inventory/purchase-suggestions-p2-98-content.ts" as const;

export const PURCHASE_SUGGESTIONS_P2_98_OPERATIONS_PATH =
  "lib/inventory/purchase-suggestions-p2-98-operations.ts" as const;

export const PURCHASE_SUGGESTIONS_P2_98_SERVICE_PATH =
  "services/inventory/purchase-suggestions-p2-98-service.ts" as const;

export const PURCHASE_SUGGESTIONS_P2_98_COMPONENT =
  "components/inventory/purchase-suggestions-panel.tsx" as const;

export const PURCHASE_SUGGESTIONS_P2_98_PAGE =
  "app/dashboard/inventory/purchase-suggestions/page.tsx" as const;

export const PURCHASE_SUGGESTIONS_P2_98_ROUTE = "/dashboard/inventory/purchase-suggestions" as const;

export const PURCHASE_SUGGESTIONS_P2_98_PURCHASING_AI_ROUTE =
  "/dashboard/inventory/purchasing-ai" as const;

export const PURCHASE_SUGGESTIONS_P2_98_AUTO_ORDERING_ROUTE =
  "/dashboard/inventory/auto-ordering" as const;

export const PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT = 4 as const;

export const PURCHASE_SUGGESTIONS_P2_98_TEST_IDS = [
  "purchase-suggestions",
  "purchase-suggestions-forecast",
  "purchase-suggestions-low-stock",
  "purchase-suggestions-menu-demand",
  "purchase-suggestions-vendor-price",
] as const;

export const PURCHASE_SUGGESTIONS_P2_98_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "AI-assisted",
] as const;

export const PURCHASE_SUGGESTIONS_P2_98_AUDIT_SCRIPT =
  "scripts/audit-purchase-suggestions-p2-98.ts" as const;

export const PURCHASE_SUGGESTIONS_P2_98_NPM_SCRIPT = "audit:purchase-suggestions-p2-98" as const;

export const PURCHASE_SUGGESTIONS_P2_98_UNIT_TEST =
  "tests/unit/purchase-suggestions-p2-98.test.ts" as const;

export const PURCHASE_SUGGESTIONS_P2_98_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const PURCHASE_SUGGESTIONS_P2_98_WIRING_PATHS = [
  PURCHASE_SUGGESTIONS_P2_98_DOC,
  PURCHASE_SUGGESTIONS_P2_98_CONTENT_PATH,
  PURCHASE_SUGGESTIONS_P2_98_OPERATIONS_PATH,
  PURCHASE_SUGGESTIONS_P2_98_SERVICE_PATH,
  PURCHASE_SUGGESTIONS_P2_98_COMPONENT,
  PURCHASE_SUGGESTIONS_P2_98_PAGE,
  "lib/inventory/purchase-suggestions-p2-98-policy.ts",
  "lib/inventory/purchase-suggestions-p2-98-audit.ts",
  "lib/ai/ai-purchasing-types.ts",
  "services/ai/ai-purchasing.ts",
  PURCHASE_SUGGESTIONS_P2_98_UNIT_TEST,
  PURCHASE_SUGGESTIONS_P2_98_LEGACY_POLICY,
] as const;
