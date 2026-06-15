/**
 * Blueprint P2-117 — Restaurant purchasing marketplace.
 *
 * @see docs/restaurant-purchasing-marketplace.md
 * @see app/dashboard/marketplace/restaurant-purchasing/page.tsx
 */

export const RESTAURANT_PURCHASING_P2_117_POLICY_ID =
  "restaurant-purchasing-p2-117-v1" as const;

export const RESTAURANT_PURCHASING_P2_117_DOC =
  "docs/restaurant-purchasing-marketplace.md" as const;

export const RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE =
  "services/marketplace/marketplace-compare-service.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_LEGACY_RECURRING =
  "services/marketplace/recurring-orders-service.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE_PAGE =
  "app/dashboard/marketplace/compare/page.tsx" as const;

export const RESTAURANT_PURCHASING_P2_117_LEGACY_DISPUTES =
  "services/marketplace/platform-dispute-resolution-service.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_LEGACY_DASHBOARD =
  "services/marketplace/marketplace-dashboard-service.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_LEGACY_SUPPLIER =
  "services/marketplace/supplier-marketplace-service.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_CONTENT_PATH =
  "lib/marketplace/restaurant-purchasing-p2-117-content.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_OPERATIONS_PATH =
  "lib/marketplace/restaurant-purchasing-p2-117-operations.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_SERVICE_PATH =
  "services/marketplace/restaurant-purchasing-p2-117-service.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_COMPONENT =
  "components/marketplace/restaurant-purchasing-panel.tsx" as const;

export const RESTAURANT_PURCHASING_P2_117_PAGE =
  "app/dashboard/marketplace/restaurant-purchasing/page.tsx" as const;

export const RESTAURANT_PURCHASING_P2_117_ROUTE =
  "/dashboard/marketplace/restaurant-purchasing" as const;

export const RESTAURANT_PURCHASING_P2_117_COMPARE_ROUTE =
  "/dashboard/marketplace/compare" as const;

export const RESTAURANT_PURCHASING_P2_117_ORDERS_ROUTE =
  "/dashboard/marketplace/orders" as const;

export const RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT = 5 as const;

export const RESTAURANT_PURCHASING_P2_117_TEST_IDS = [
  "restaurant-purchasing",
  "restaurant-purchasing-compare",
  "restaurant-purchasing-recurring",
  "restaurant-purchasing-substitutions",
  "restaurant-purchasing-delivery",
  "restaurant-purchasing-disputes",
] as const;

export const RESTAURANT_PURCHASING_P2_117_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const RESTAURANT_PURCHASING_P2_117_AUDIT_SCRIPT =
  "scripts/audit-restaurant-purchasing-p2-117.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_NPM_SCRIPT =
  "audit:restaurant-purchasing-p2-117" as const;

export const RESTAURANT_PURCHASING_P2_117_UNIT_TEST =
  "tests/unit/restaurant-purchasing-p2-117.test.ts" as const;

export const RESTAURANT_PURCHASING_P2_117_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const RESTAURANT_PURCHASING_P2_117_WIRING_PATHS = [
  RESTAURANT_PURCHASING_P2_117_DOC,
  RESTAURANT_PURCHASING_P2_117_CONTENT_PATH,
  RESTAURANT_PURCHASING_P2_117_OPERATIONS_PATH,
  RESTAURANT_PURCHASING_P2_117_SERVICE_PATH,
  RESTAURANT_PURCHASING_P2_117_COMPONENT,
  RESTAURANT_PURCHASING_P2_117_PAGE,
  "lib/marketplace/restaurant-purchasing-p2-117-policy.ts",
  "lib/marketplace/restaurant-purchasing-p2-117-audit.ts",
  RESTAURANT_PURCHASING_P2_117_UNIT_TEST,
  RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE,
  RESTAURANT_PURCHASING_P2_117_LEGACY_RECURRING,
  RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE_PAGE,
  RESTAURANT_PURCHASING_P2_117_LEGACY_DISPUTES,
  RESTAURANT_PURCHASING_P2_117_LEGACY_DASHBOARD,
  RESTAURANT_PURCHASING_P2_117_LEGACY_SUPPLIER,
] as const;
