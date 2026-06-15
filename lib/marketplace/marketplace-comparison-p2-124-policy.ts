/**
 * Blueprint P2-124 — Marketplace comparison tool (side-by-side supplier comparison).
 *
 * @see docs/marketplace-comparison-tool.md
 * @see app/dashboard/marketplace/comparison-tool/page.tsx
 */

export const MARKETPLACE_COMPARISON_P2_124_POLICY_ID =
  "marketplace-comparison-p2-124-v1" as const;

export const MARKETPLACE_COMPARISON_P2_124_DOC = "docs/marketplace-comparison-tool.md" as const;

export const MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_SERVICE =
  "services/marketplace/marketplace-compare-service.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_PAGE =
  "app/dashboard/marketplace/compare/page.tsx" as const;

export const MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_CLIENT =
  "components/marketplace/marketplace-compare-client.tsx" as const;

export const MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARISON_TABLE =
  "components/marketplace/product-comparison-table.tsx" as const;

export const MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_FILTERS =
  "lib/marketplace/compare-filters.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_STORAGE =
  "lib/marketplace/marketplace-compare-storage.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_LEGACY_CATALOG_TOOLBAR =
  "components/marketplace/marketplace-catalog-toolbar.tsx" as const;

export const MARKETPLACE_COMPARISON_P2_124_CONTENT_PATH =
  "lib/marketplace/marketplace-comparison-p2-124-content.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_OPERATIONS_PATH =
  "lib/marketplace/marketplace-comparison-p2-124-operations.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_SERVICE_PATH =
  "services/marketplace/marketplace-comparison-p2-124-service.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_COMPONENT =
  "components/marketplace/marketplace-comparison-p2-124-panel.tsx" as const;

export const MARKETPLACE_COMPARISON_P2_124_PAGE =
  "app/dashboard/marketplace/comparison-tool/page.tsx" as const;

export const MARKETPLACE_COMPARISON_P2_124_ROUTE =
  "/dashboard/marketplace/comparison-tool" as const;

export const MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE =
  "/dashboard/marketplace/compare" as const;

export const MARKETPLACE_COMPARISON_P2_124_CATALOG_ROUTE =
  "/dashboard/marketplace/catalog" as const;

export const MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT = 4 as const;

export const MARKETPLACE_COMPARISON_P2_124_TEST_IDS = [
  "marketplace-comparison-tool",
  "marketplace-comparison-side-by-side",
  "marketplace-comparison-search",
  "marketplace-comparison-sort",
  "marketplace-comparison-tray",
] as const;

export const MARKETPLACE_COMPARISON_P2_124_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const MARKETPLACE_COMPARISON_P2_124_AUDIT_SCRIPT =
  "scripts/audit-marketplace-comparison-p2-124.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_NPM_SCRIPT =
  "audit:marketplace-comparison-p2-124" as const;

export const MARKETPLACE_COMPARISON_P2_124_UNIT_TEST =
  "tests/unit/marketplace-comparison-p2-124.test.ts" as const;

export const MARKETPLACE_COMPARISON_P2_124_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MARKETPLACE_COMPARISON_P2_124_WIRING_PATHS = [
  MARKETPLACE_COMPARISON_P2_124_DOC,
  MARKETPLACE_COMPARISON_P2_124_CONTENT_PATH,
  MARKETPLACE_COMPARISON_P2_124_OPERATIONS_PATH,
  MARKETPLACE_COMPARISON_P2_124_SERVICE_PATH,
  MARKETPLACE_COMPARISON_P2_124_COMPONENT,
  MARKETPLACE_COMPARISON_P2_124_PAGE,
  "lib/marketplace/marketplace-comparison-p2-124-policy.ts",
  "lib/marketplace/marketplace-comparison-p2-124-audit.ts",
  MARKETPLACE_COMPARISON_P2_124_UNIT_TEST,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_SERVICE,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_PAGE,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_CLIENT,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARISON_TABLE,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_FILTERS,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_STORAGE,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_CATALOG_TOOLBAR,
] as const;
