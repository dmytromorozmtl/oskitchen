/**
 * Absolute Final Task 80 — Integration Health Center standalone marketing page.
 *
 * @see app/integration-health-center/page.tsx
 * @see app/product/integration-health-center/page.tsx
 */

export const INTEGRATION_HEALTH_CENTER_MARKETING_ABSOLUTE_FINAL_POLICY_ID =
  "integration-health-center-marketing-absolute-final-v1" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE = "/integration-health-center" as const;

export const INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE = "/product/integration-health-center" as const;

export const INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE =
  "/dashboard/integration-health" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_PAGE_PATH =
  "app/integration-health-center/page.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_COMPONENT_PATH =
  "components/marketing/integration-health-center-marketing-landing.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_CONTENT_PATH =
  "lib/marketing/integration-health-center-marketing-content.ts" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_MOAT_COMPONENT =
  "components/marketing/landing-integration-health-moat.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_SALES_DOC =
  "docs/integration-health-sales-deck-v2.md" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_REQUIRED_SECTIONS = [
  'data-testid="integration-health-center-marketing-landing"',
  "IntegrationHealthCenterMarketingLanding",
  "Honest limitations",
] as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_HONESTY_MARKERS = [
  "SKIPPED",
  "BETA",
  "not guaranteed uptime",
  "fake green",
  "free trial",
] as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_WIRING_PATHS = [
  INTEGRATION_HEALTH_CENTER_MARKETING_PAGE_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_COMPONENT_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_CONTENT_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_MOAT_COMPONENT,
  "app/product/integration-health-center/page.tsx",
  INTEGRATION_HEALTH_CENTER_MARKETING_SALES_DOC,
  "lib/marketing/integration-health-center-marketing-absolute-final-policy.ts",
  "lib/marketing/integration-health-center-marketing-audit.ts",
  "tests/unit/integration-health-center-marketing-absolute-final.test.ts",
] as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_UNIT_TEST =
  "tests/unit/integration-health-center-marketing-absolute-final.test.ts" as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_CI_SCRIPTS = [
  "test:ci:integration-health-center-marketing",
  "test:ci:integration-health-center-marketing:cert",
] as const;

export const INTEGRATION_HEALTH_CENTER_MARKETING_UPSTREAM_POLICIES = [
  "integration-health-center-product-absolute-final-v1",
  "final-18-integration-health-v1",
] as const;
