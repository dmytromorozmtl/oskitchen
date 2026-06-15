/**
 * Blueprint P2-118 — Marketplace commission model.
 *
 * @see docs/marketplace-commission-model.md
 * @see app/dashboard/marketplace/commission-model/page.tsx
 */

export const MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID =
  "marketplace-commission-model-p2-118-v1" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_DOC =
  "docs/marketplace-commission-model.md" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_ANALYTICS =
  "services/marketplace/platform-marketplace-analytics-service.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_FEATURED =
  "services/marketplace/featured-service.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_CHECKOUT =
  "services/marketplace/checkout-service.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_STRIPE =
  "services/marketplace/stripe-connect-service.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_BILLING_TYPES =
  "lib/marketplace/billing-integration-types.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_FINANCE =
  "services/marketplace/vendor-finance-service.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_SETTINGS =
  "lib/marketplace/vendor-settings-types.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_PAGE =
  "app/platform/marketplace/analytics/page.tsx" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_CONTENT_PATH =
  "lib/marketplace/marketplace-commission-model-p2-118-content.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATIONS_PATH =
  "lib/marketplace/marketplace-commission-model-p2-118-operations.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_SERVICE_PATH =
  "services/marketplace/marketplace-commission-model-p2-118-service.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_COMPONENT =
  "components/marketplace/marketplace-commission-model-panel.tsx" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_PAGE =
  "app/dashboard/marketplace/commission-model/page.tsx" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE =
  "/dashboard/marketplace/commission-model" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_PLATFORM_ANALYTICS_ROUTE =
  "/platform/marketplace/analytics" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_VENDOR_ROUTE = "/vendor" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT = 4 as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_TEST_IDS = [
  "marketplace-commission-model",
  "marketplace-commission-vendor",
  "marketplace-commission-featured",
  "marketplace-commission-lead-fee",
  "marketplace-commission-transaction",
] as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_AUDIT_SCRIPT =
  "scripts/audit-marketplace-commission-model-p2-118.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_NPM_SCRIPT =
  "audit:marketplace-commission-model-p2-118" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_UNIT_TEST =
  "tests/unit/marketplace-commission-model-p2-118.test.ts" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MARKETPLACE_COMMISSION_MODEL_P2_118_WIRING_PATHS = [
  MARKETPLACE_COMMISSION_MODEL_P2_118_DOC,
  MARKETPLACE_COMMISSION_MODEL_P2_118_CONTENT_PATH,
  MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATIONS_PATH,
  MARKETPLACE_COMMISSION_MODEL_P2_118_SERVICE_PATH,
  MARKETPLACE_COMMISSION_MODEL_P2_118_COMPONENT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_PAGE,
  "lib/marketplace/marketplace-commission-model-p2-118-policy.ts",
  "lib/marketplace/marketplace-commission-model-p2-118-audit.ts",
  MARKETPLACE_COMMISSION_MODEL_P2_118_UNIT_TEST,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_ANALYTICS,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_FEATURED,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_CHECKOUT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_STRIPE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_BILLING_TYPES,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_FINANCE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_SETTINGS,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_PAGE,
] as const;
