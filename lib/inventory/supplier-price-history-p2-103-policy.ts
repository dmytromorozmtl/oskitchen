/**
 * Blueprint P2-103 — Supplier price history (per ingredient graph).
 *
 * @see docs/supplier-price-history.md
 * @see app/dashboard/inventory/supplier-price-history/page.tsx
 */

export const SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID =
  "supplier-price-history-p2-103-v1" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_DOC = "docs/supplier-price-history.md" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_POLICY =
  "services/purchasing/supplier-price-history-service.ts" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_CHART =
  "components/purchasing/supplier-price-chart.tsx" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_CONTENT_PATH =
  "lib/inventory/supplier-price-history-p2-103-content.ts" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_OPERATIONS_PATH =
  "lib/inventory/supplier-price-history-p2-103-operations.ts" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_SERVICE_PATH =
  "services/inventory/supplier-price-history-p2-103-service.ts" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_COMPONENT =
  "components/inventory/supplier-price-history-panel.tsx" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_PAGE =
  "app/dashboard/inventory/supplier-price-history/page.tsx" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_ROUTE =
  "/dashboard/inventory/supplier-price-history" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_PURCHASING_ROUTE = "/dashboard/purchasing" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT = 3 as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_TEST_IDS = [
  "supplier-price-history",
  "supplier-price-ingredient-graph",
  "supplier-price-multi-supplier",
  "supplier-price-change-summary",
] as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_AUDIT_SCRIPT =
  "scripts/audit-supplier-price-history-p2-103.ts" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_NPM_SCRIPT = "audit:supplier-price-history-p2-103" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_UNIT_TEST =
  "tests/unit/supplier-price-history-p2-103.test.ts" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SUPPLIER_PRICE_HISTORY_P2_103_WIRING_PATHS = [
  SUPPLIER_PRICE_HISTORY_P2_103_DOC,
  SUPPLIER_PRICE_HISTORY_P2_103_CONTENT_PATH,
  SUPPLIER_PRICE_HISTORY_P2_103_OPERATIONS_PATH,
  SUPPLIER_PRICE_HISTORY_P2_103_SERVICE_PATH,
  SUPPLIER_PRICE_HISTORY_P2_103_COMPONENT,
  SUPPLIER_PRICE_HISTORY_P2_103_PAGE,
  "lib/inventory/supplier-price-history-p2-103-policy.ts",
  "lib/inventory/supplier-price-history-p2-103-audit.ts",
  SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_CHART,
  SUPPLIER_PRICE_HISTORY_P2_103_UNIT_TEST,
  SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_POLICY,
] as const;
