/**
 * Absolute Final Task 70 — Integration Health Center product page.
 *
 * @see app/product/integration-health-center/page.tsx
 * @see docs/integration-health-sales-deck-v2.md
 */

export const INTEGRATION_HEALTH_CENTER_PRODUCT_ABSOLUTE_FINAL_POLICY_ID =
  "integration-health-center-product-absolute-final-v1" as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE =
  "/product/integration-health-center" as const;

export const INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE =
  "/dashboard/integration-health" as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_PAGE_PATH =
  "app/product/integration-health-center/page.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_COMPONENT_PATH =
  "components/product/integration-health-center-product-page.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_CONTENT_PATH =
  "lib/integrations/integration-health-center-product-content.ts" as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURE_MODULES = [
  "health_score",
  "predictive_alerts",
  "recovery_playbooks",
  "maturity_matrix",
  "live_proof_smoke",
  "hardware_device_fleet",
] as const;

export type IntegrationHealthCenterProductFeatureId =
  (typeof INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURE_MODULES)[number];

export const INTEGRATION_HEALTH_CENTER_PRODUCT_HONESTY_MARKERS = [
  "SKIPPED",
  "BETA",
  "no fake green",
  "not guaranteed uptime",
] as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_WIRING_PATHS = [
  INTEGRATION_HEALTH_CENTER_PRODUCT_PAGE_PATH,
  INTEGRATION_HEALTH_CENTER_PRODUCT_COMPONENT_PATH,
  INTEGRATION_HEALTH_CENTER_PRODUCT_CONTENT_PATH,
  "lib/integrations/integration-health-center-product-absolute-final-policy.ts",
  "lib/integrations/integration-health-center-product-audit.ts",
  "app/dashboard/integration-health/page.tsx",
  "app/product/page.tsx",
  "tests/unit/integration-health-center-product-absolute-final.test.ts",
] as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_UNIT_TEST =
  "tests/unit/integration-health-center-product-absolute-final.test.ts" as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_CI_SCRIPTS = [
  "test:ci:integration-health-center-product",
  "test:ci:integration-health-center-product:cert",
] as const;

export const INTEGRATION_HEALTH_CENTER_UPSTREAM_POLICIES = [
  "hardware-device-fleet-absolute-final-v1",
  "integration-health-live-policy-v1",
] as const;
