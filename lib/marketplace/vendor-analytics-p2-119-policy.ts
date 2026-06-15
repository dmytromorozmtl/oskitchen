/**
 * Blueprint P2-119 — Vendor analytics (top products, repeat buyers, lost carts, price competitiveness).
 *
 * @see docs/vendor-analytics-marketplace.md
 * @see app/dashboard/marketplace/vendor-analytics/page.tsx
 */

export const VENDOR_ANALYTICS_P2_119_POLICY_ID = "vendor-analytics-p2-119-v1" as const;

export const VENDOR_ANALYTICS_P2_119_DOC = "docs/vendor-analytics-marketplace.md" as const;

export const VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS =
  "services/marketplace/vendor-analytics-service.ts" as const;

export const VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_PAGE =
  "app/vendor/(cabinet)/analytics/page.tsx" as const;

export const VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_CLIENT =
  "components/marketplace/vendor-analytics-client.tsx" as const;

export const VENDOR_ANALYTICS_P2_119_LEGACY_CART =
  "services/marketplace/cart-service.ts" as const;

export const VENDOR_ANALYTICS_P2_119_LEGACY_COMPARE =
  "services/marketplace/marketplace-compare-service.ts" as const;

export const VENDOR_ANALYTICS_P2_119_LEGACY_PRICE_INTEL =
  "services/marketplace/price-intelligence.ts" as const;

export const VENDOR_ANALYTICS_P2_119_CONTENT_PATH =
  "lib/marketplace/vendor-analytics-p2-119-content.ts" as const;

export const VENDOR_ANALYTICS_P2_119_OPERATIONS_PATH =
  "lib/marketplace/vendor-analytics-p2-119-operations.ts" as const;

export const VENDOR_ANALYTICS_P2_119_SERVICE_PATH =
  "services/marketplace/vendor-analytics-p2-119-service.ts" as const;

export const VENDOR_ANALYTICS_P2_119_COMPONENT =
  "components/marketplace/vendor-analytics-panel.tsx" as const;

export const VENDOR_ANALYTICS_P2_119_PAGE =
  "app/dashboard/marketplace/vendor-analytics/page.tsx" as const;

export const VENDOR_ANALYTICS_P2_119_ROUTE = "/dashboard/marketplace/vendor-analytics" as const;

export const VENDOR_ANALYTICS_P2_119_VENDOR_ANALYTICS_ROUTE = "/vendor/analytics" as const;

export const VENDOR_ANALYTICS_P2_119_COMPARE_ROUTE = "/dashboard/marketplace/compare" as const;

export const VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT = 4 as const;

export const VENDOR_ANALYTICS_P2_119_TEST_IDS = [
  "vendor-analytics",
  "vendor-analytics-top-products",
  "vendor-analytics-repeat-buyers",
  "vendor-analytics-lost-carts",
  "vendor-analytics-price-competitiveness",
] as const;

export const VENDOR_ANALYTICS_P2_119_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const VENDOR_ANALYTICS_P2_119_AUDIT_SCRIPT =
  "scripts/audit-vendor-analytics-p2-119.ts" as const;

export const VENDOR_ANALYTICS_P2_119_NPM_SCRIPT = "audit:vendor-analytics-p2-119" as const;

export const VENDOR_ANALYTICS_P2_119_UNIT_TEST =
  "tests/unit/vendor-analytics-p2-119.test.ts" as const;

export const VENDOR_ANALYTICS_P2_119_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const VENDOR_ANALYTICS_P2_119_WIRING_PATHS = [
  VENDOR_ANALYTICS_P2_119_DOC,
  VENDOR_ANALYTICS_P2_119_CONTENT_PATH,
  VENDOR_ANALYTICS_P2_119_OPERATIONS_PATH,
  VENDOR_ANALYTICS_P2_119_SERVICE_PATH,
  VENDOR_ANALYTICS_P2_119_COMPONENT,
  VENDOR_ANALYTICS_P2_119_PAGE,
  "lib/marketplace/vendor-analytics-p2-119-policy.ts",
  "lib/marketplace/vendor-analytics-p2-119-audit.ts",
  VENDOR_ANALYTICS_P2_119_UNIT_TEST,
  VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS,
  VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_PAGE,
  VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_CLIENT,
  VENDOR_ANALYTICS_P2_119_LEGACY_CART,
  VENDOR_ANALYTICS_P2_119_LEGACY_COMPARE,
  VENDOR_ANALYTICS_P2_119_LEGACY_PRICE_INTEL,
] as const;
