/**
 * Blueprint P2-123 — Marketplace empty states (no vendors, orders, products).
 *
 * @see docs/marketplace-empty-states-p2-123.md
 * @see app/dashboard/marketplace/empty-states/page.tsx
 */

export const MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID =
  "marketplace-empty-states-p2-123-v1" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_DOC =
  "docs/marketplace-empty-states-p2-123.md" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_POLICY =
  "lib/marketplace/marketplace-empty-states-policy.ts" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_DESIGN_POLICY =
  "lib/design/marketplace-empty-states-design-policy.ts" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_UI =
  "components/marketplace/marketplace-empty-state.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_ILLUSTRATION =
  "components/marketplace/marketplace-empty-state-illustration.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_PAGE =
  "app/dashboard/marketplace/catalog/page.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_PAGE =
  "app/dashboard/marketplace/orders/page.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_MODULE =
  "components/marketplace/marketplace-vendors-list-client.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_CONTENT_PATH =
  "lib/marketplace/marketplace-empty-states-p2-123-content.ts" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_OPERATIONS_PATH =
  "lib/marketplace/marketplace-empty-states-p2-123-operations.ts" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_SERVICE_PATH =
  "services/marketplace/marketplace-empty-states-p2-123-service.ts" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_COMPONENT =
  "components/marketplace/marketplace-empty-states-p2-123-panel.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_PAGE =
  "app/dashboard/marketplace/empty-states/page.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_ROUTE =
  "/dashboard/marketplace/empty-states" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_ROUTE =
  "/dashboard/marketplace/catalog" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_ROUTE =
  "/dashboard/marketplace/orders" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_ROUTE =
  "/dashboard/marketplace/vendors" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT = 3 as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_SCENARIOS = [
  "catalog_empty",
  "orders_empty",
  "vendors_empty",
] as const;

export type MarketplaceEmptyStatesP2_123Scenario =
  (typeof MARKETPLACE_EMPTY_STATES_P2_123_SCENARIOS)[number];

export const MARKETPLACE_EMPTY_STATES_P2_123_TEST_IDS = [
  "marketplace-empty-states-p2-123",
  "marketplace-empty-states-no-products",
  "marketplace-empty-states-no-orders",
  "marketplace-empty-states-no-vendors",
] as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_AUDIT_SCRIPT =
  "scripts/audit-marketplace-empty-states-p2-123.ts" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_NPM_SCRIPT =
  "audit:marketplace-empty-states-p2-123" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_UNIT_TEST =
  "tests/unit/marketplace-empty-states-p2-123.test.ts" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MARKETPLACE_EMPTY_STATES_P2_123_WIRING_PATHS = [
  MARKETPLACE_EMPTY_STATES_P2_123_DOC,
  MARKETPLACE_EMPTY_STATES_P2_123_CONTENT_PATH,
  MARKETPLACE_EMPTY_STATES_P2_123_OPERATIONS_PATH,
  MARKETPLACE_EMPTY_STATES_P2_123_SERVICE_PATH,
  MARKETPLACE_EMPTY_STATES_P2_123_COMPONENT,
  MARKETPLACE_EMPTY_STATES_P2_123_PAGE,
  "lib/marketplace/marketplace-empty-states-p2-123-policy.ts",
  "lib/marketplace/marketplace-empty-states-p2-123-audit.ts",
  MARKETPLACE_EMPTY_STATES_P2_123_UNIT_TEST,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_POLICY,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_DESIGN_POLICY,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_UI,
  MARKETPLACE_EMPTY_STATES_P2_123_LEGACY_ILLUSTRATION,
  MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_PAGE,
  MARKETPLACE_EMPTY_STATES_P2_123_ORDERS_PAGE,
  MARKETPLACE_EMPTY_STATES_P2_123_VENDORS_MODULE,
] as const;
