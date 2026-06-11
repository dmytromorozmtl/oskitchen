/**
 * Absolute Final Task 77 — /commissary-software SEO landing page.
 *
 * @see app/commissary-software/page.tsx
 * @see docs/icp-definition-final.md
 */

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID =
  "commissary-kitchen-software-landing-absolute-final-v1" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE = "/commissary-software" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_PAGE_PATH =
  "app/commissary-software/page.tsx" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_COMPONENT_PATH =
  "components/marketing/commissary-kitchen-software-landing.tsx" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_CONTENT_PATH =
  "lib/marketing/commissary-kitchen-software-landing-content.ts" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_ICP_DOC = "docs/icp-definition-final.md" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_PRIMARY_KEYWORD = "commissary kitchen software" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_REQUIRED_SECTIONS = [
  "data-testid=\"commissary-kitchen-software-landing\"",
  "data-testid=\"commissary-kitchen-software-pain\"",
  "data-testid=\"commissary-kitchen-software-features\"",
  "Honest limitations",
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_HONESTY_MARKERS = [
  "Honest limitations",
  "BETA",
  "SKIPPED",
  "placeholder",
  "free trial",
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_WIRING_PATHS = [
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_PAGE_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_COMPONENT_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_CONTENT_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_ICP_DOC,
  "lib/marketing/commissary-kitchen-software-landing-absolute-final-policy.ts",
  "lib/marketing/commissary-kitchen-software-landing-audit.ts",
  "tests/unit/commissary-kitchen-software-landing-absolute-final.test.ts",
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_UNIT_TEST =
  "tests/unit/commissary-kitchen-software-landing-absolute-final.test.ts" as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_CI_SCRIPTS = [
  "test:ci:commissary-kitchen-software-landing",
  "test:ci:commissary-kitchen-software-landing:cert",
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_UPSTREAM_POLICIES = [
  "seo-10-icp-keywords-mkt20-v1",
  "era17-pilot-icp-contract-v1",
] as const;
