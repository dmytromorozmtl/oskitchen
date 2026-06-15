/**
 * Blueprint P2-100 — Vendor price intelligence (price history, substitutions, cheaper vendor).
 *
 * @see docs/vendor-price-intelligence.md
 * @see app/dashboard/inventory/vendor-price-intelligence/page.tsx
 */

export const VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID =
  "vendor-price-intelligence-p2-100-v1" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_DOC = "docs/vendor-price-intelligence.md" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_LEGACY_POLICY =
  "services/purchasing/supplier-price-history-service.ts" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_CONTENT_PATH =
  "lib/inventory/vendor-price-intelligence-p2-100-content.ts" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATIONS_PATH =
  "lib/inventory/vendor-price-intelligence-p2-100-operations.ts" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_SERVICE_PATH =
  "services/inventory/vendor-price-intelligence-p2-100-service.ts" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_COMPONENT =
  "components/inventory/vendor-price-intelligence-panel.tsx" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_PAGE =
  "app/dashboard/inventory/vendor-price-intelligence/page.tsx" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE =
  "/dashboard/inventory/vendor-price-intelligence" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_PURCHASING_ROUTE =
  "/dashboard/purchasing" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT = 3 as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_TEST_IDS = [
  "vendor-price-intelligence",
  "vendor-price-history",
  "vendor-price-substitutions",
  "vendor-price-cheaper-vendor",
] as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_AUDIT_SCRIPT =
  "scripts/audit-vendor-price-intelligence-p2-100.ts" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_NPM_SCRIPT =
  "audit:vendor-price-intelligence-p2-100" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_UNIT_TEST =
  "tests/unit/vendor-price-intelligence-p2-100.test.ts" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const VENDOR_PRICE_INTELLIGENCE_P2_100_WIRING_PATHS = [
  VENDOR_PRICE_INTELLIGENCE_P2_100_DOC,
  VENDOR_PRICE_INTELLIGENCE_P2_100_CONTENT_PATH,
  VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATIONS_PATH,
  VENDOR_PRICE_INTELLIGENCE_P2_100_SERVICE_PATH,
  VENDOR_PRICE_INTELLIGENCE_P2_100_COMPONENT,
  VENDOR_PRICE_INTELLIGENCE_P2_100_PAGE,
  "lib/inventory/vendor-price-intelligence-p2-100-policy.ts",
  "lib/inventory/vendor-price-intelligence-p2-100-audit.ts",
  "components/purchasing/supplier-price-chart.tsx",
  "lib/ai/ai-purchasing-builders.ts",
  VENDOR_PRICE_INTELLIGENCE_P2_100_UNIT_TEST,
  VENDOR_PRICE_INTELLIGENCE_P2_100_LEGACY_POLICY,
] as const;
