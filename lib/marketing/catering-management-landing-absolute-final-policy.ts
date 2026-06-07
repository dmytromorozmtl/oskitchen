/**
 * Absolute Final Task 78 — /catering-management SEO landing page.
 *
 * @see app/catering-management/page.tsx
 * @see docs/icp-definition-final.md
 */

export const CATERING_MANAGEMENT_LANDING_ABSOLUTE_FINAL_POLICY_ID =
  "catering-management-landing-absolute-final-v1" as const;

export const CATERING_MANAGEMENT_LANDING_ROUTE = "/catering-management" as const;

export const CATERING_MANAGEMENT_LANDING_PAGE_PATH =
  "app/catering-management/page.tsx" as const;

export const CATERING_MANAGEMENT_LANDING_COMPONENT_PATH =
  "components/marketing/catering-management-landing.tsx" as const;

export const CATERING_MANAGEMENT_LANDING_CONTENT_PATH =
  "lib/marketing/catering-management-landing-content.ts" as const;

export const CATERING_MANAGEMENT_ICP_DOC = "docs/icp-definition-final.md" as const;

export const CATERING_MANAGEMENT_PRIMARY_KEYWORD = "catering management software" as const;

export const CATERING_MANAGEMENT_REQUIRED_SECTIONS = [
  "data-testid=\"catering-management-landing\"",
  "data-testid=\"catering-management-pain\"",
  "data-testid=\"catering-management-features\"",
  "Honest limitations",
] as const;

export const CATERING_MANAGEMENT_HONESTY_MARKERS = [
  "Honest limitations",
  "BETA",
  "SKIPPED",
  "placeholder",
  "free trial",
] as const;

export const CATERING_MANAGEMENT_WIRING_PATHS = [
  CATERING_MANAGEMENT_LANDING_PAGE_PATH,
  CATERING_MANAGEMENT_LANDING_COMPONENT_PATH,
  CATERING_MANAGEMENT_LANDING_CONTENT_PATH,
  CATERING_MANAGEMENT_ICP_DOC,
  "lib/marketing/catering-management-landing-absolute-final-policy.ts",
  "lib/marketing/catering-management-landing-audit.ts",
  "tests/unit/catering-management-landing-absolute-final.test.ts",
] as const;

export const CATERING_MANAGEMENT_LANDING_UNIT_TEST =
  "tests/unit/catering-management-landing-absolute-final.test.ts" as const;

export const CATERING_MANAGEMENT_LANDING_CI_SCRIPTS = [
  "test:ci:catering-management-landing",
  "test:ci:catering-management-landing:cert",
] as const;

export const CATERING_MANAGEMENT_UPSTREAM_POLICIES = [
  "seo-10-icp-keywords-mkt20-v1",
  "era17-pilot-icp-contract-v1",
] as const;
