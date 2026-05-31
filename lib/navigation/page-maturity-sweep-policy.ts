/**
 * Page maturity sweep policy — Evolution Era 4 Cycle 12.
 *
 * Extends nav maturity rules with mandatory in-page honesty for preview/placeholder routes.
 */

export const PAGE_MATURITY_SWEEP_POLICY_ID = "era4-page-maturity-sweep-v1" as const;

/** Routes that render their own PlaceholderBanner — skip layout duplicate. */
export const PAGE_MATURITY_INLINE_PLACEHOLDER_ROUTES = [
  "/dashboard/integrations/grubhub",
  "/dashboard/routes/uber-direct",
] as const;

/** Routes with certified in-page pilot/preview copy — skip layout duplicate (Era 17). */
export const PAGE_MATURITY_INLINE_HONESTY_ROUTES = [
  "/dashboard/settings/security/sso",
  "/dashboard/inventory/pos-impacts",
  "/dashboard/integrations/doordash",
  "/dashboard/integrations/uber-eats",
] as const;

export const PAGE_MATURITY_SWEEP_CI_SCRIPTS = [
  "test:ci:page-maturity-sweep",
  "test:ci:page-maturity-sweep:cert",
] as const;

export const PAGE_MATURITY_SWEEP_UNIT_TESTS = [
  "tests/unit/page-maturity-honesty.test.ts",
  "tests/unit/page-maturity-sweep-policy.test.ts",
] as const;
