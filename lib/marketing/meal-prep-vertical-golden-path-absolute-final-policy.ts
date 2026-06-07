/**
 * Absolute Final Task 69 — meal prep vertical golden path (product brief, ICP, demo, pricing).
 *
 * @see docs/meal-prep-vertical-golden-path.md
 * @see docs/icp-definition-final.md
 */

export const MEAL_PREP_VERTICAL_GOLDEN_PATH_ABSOLUTE_FINAL_POLICY_ID =
  "meal-prep-vertical-golden-path-absolute-final-v1" as const;

export const MEAL_PREP_VERTICAL_GOLDEN_PATH_DOC =
  "docs/meal-prep-vertical-golden-path.md" as const;

export const MEAL_PREP_VERTICAL_ICP_DOC = "docs/icp-definition-final.md" as const;

export const MEAL_PREP_VERTICAL_PRICING_DOC = "docs/transparent-pricing-sales-guide.md" as const;

export const MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID = "meal-prep-weekly" as const;

export const MEAL_PREP_VERTICAL_DASHBOARD_PATH = "/dashboard/meal-prep" as const;

export const MEAL_PREP_VERTICAL_LANDING_PATH = "/landing/meal-prep" as const;

export const MEAL_PREP_VERTICAL_SEO_LANDING_PATH = "/meal-prep-software" as const;

export const MEAL_PREP_VERTICAL_RECOMMENDED_PLAN = "PRO" as const;

export const MEAL_PREP_VERTICAL_RECOMMENDED_PRICE_USD = 79 as const;

export const MEAL_PREP_VERTICAL_REQUIRED_SECTIONS = [
  "## Product brief",
  "## ICP",
  "## Demo",
  "## Pricing",
  "## Operator golden path",
] as const;

export const MEAL_PREP_VERTICAL_REQUIRED_HEADINGS = [
  "Product brief",
  "Problem",
  "OS Kitchen wedge",
  "Ideal operator profile",
  "Golden demo scenario",
  "20-minute founder demo script",
  "Recommended plan for meal prep",
  "Operator golden path",
] as const;

export const MEAL_PREP_VERTICAL_HONESTY_MARKERS = [
  "Honesty rule",
  "BETA",
  "SKIPPED",
  "do not claim",
  "0 signed LOIs",
] as const;

export const MEAL_PREP_VERTICAL_WIRING_PATHS = [
  MEAL_PREP_VERTICAL_GOLDEN_PATH_DOC,
  MEAL_PREP_VERTICAL_ICP_DOC,
  MEAL_PREP_VERTICAL_PRICING_DOC,
  "lib/marketing/meal-prep-vertical-golden-path-absolute-final-policy.ts",
  "lib/marketing/meal-prep-vertical-golden-path-audit.ts",
  "lib/demo/golden-demo-scenarios.ts",
  "services/meal-prep/meal-prep-os-service.ts",
  "app/landing/meal-prep/page.tsx",
  "app/meal-prep-software/page.tsx",
  "tests/unit/meal-prep-vertical-golden-path-absolute-final.test.ts",
] as const;

export const MEAL_PREP_VERTICAL_UNIT_TEST =
  "tests/unit/meal-prep-vertical-golden-path-absolute-final.test.ts" as const;

export const MEAL_PREP_VERTICAL_CI_SCRIPTS = [
  "test:ci:meal-prep-vertical-golden-path",
  "test:ci:meal-prep-vertical-golden-path:cert",
] as const;

export const MEAL_PREP_VERTICAL_UPSTREAM_POLICIES = [
  "meal-prep-os-v1",
  "era17-pilot-icp-contract-v1",
] as const;
