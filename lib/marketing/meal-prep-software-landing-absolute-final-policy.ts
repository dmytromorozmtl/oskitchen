/**
 * Absolute Final Task 76 — /meal-prep-software SEO landing page.
 *
 * @see app/meal-prep-software/page.tsx
 * @see docs/meal-prep-vertical-golden-path.md
 */

export const MEAL_PREP_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID =
  "meal-prep-software-landing-absolute-final-v1" as const;

export const MEAL_PREP_SOFTWARE_LANDING_ROUTE = "/meal-prep-software" as const;

export const MEAL_PREP_SOFTWARE_LANDING_PAGE_PATH = "app/meal-prep-software/page.tsx" as const;

export const MEAL_PREP_SOFTWARE_LANDING_COMPONENT_PATH =
  "components/marketing/meal-prep-software-landing.tsx" as const;

export const MEAL_PREP_SOFTWARE_LANDING_CONTENT_PATH =
  "lib/marketing/meal-prep-software-landing-content.ts" as const;

export const MEAL_PREP_SOFTWARE_GOLDEN_PATH_DOC =
  "docs/meal-prep-vertical-golden-path.md" as const;

export const MEAL_PREP_SOFTWARE_PRIMARY_KEYWORD = "meal prep software" as const;

export const MEAL_PREP_SOFTWARE_REQUIRED_SECTIONS = [
  "data-testid=\"meal-prep-software-landing\"",
  "data-testid=\"meal-prep-software-pain\"",
  "data-testid=\"meal-prep-software-features\"",
  "Honest limitations",
] as const;

export const MEAL_PREP_SOFTWARE_HONESTY_MARKERS = [
  "Honest limitations",
  "BETA",
  "SKIPPED",
  "placeholder",
  "free trial",
] as const;

export const MEAL_PREP_SOFTWARE_WIRING_PATHS = [
  MEAL_PREP_SOFTWARE_LANDING_PAGE_PATH,
  MEAL_PREP_SOFTWARE_LANDING_COMPONENT_PATH,
  MEAL_PREP_SOFTWARE_LANDING_CONTENT_PATH,
  MEAL_PREP_SOFTWARE_GOLDEN_PATH_DOC,
  "lib/marketing/meal-prep-software-landing-absolute-final-policy.ts",
  "lib/marketing/meal-prep-software-landing-audit.ts",
  "tests/unit/meal-prep-software-landing-absolute-final.test.ts",
] as const;

export const MEAL_PREP_SOFTWARE_LANDING_UNIT_TEST =
  "tests/unit/meal-prep-software-landing-absolute-final.test.ts" as const;

export const MEAL_PREP_SOFTWARE_LANDING_CI_SCRIPTS = [
  "test:ci:meal-prep-software-landing",
  "test:ci:meal-prep-software-landing:cert",
] as const;

export const MEAL_PREP_SOFTWARE_UPSTREAM_POLICIES = [
  "meal-prep-vertical-golden-path-absolute-final-v1",
  "seo-10-icp-keywords-mkt20-v1",
] as const;
