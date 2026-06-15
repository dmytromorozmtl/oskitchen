/**
 * Blueprint P2-125 — Marketplace SEO landing pages.
 *
 * @see docs/marketplace-seo-pages.md
 */

export const MARKETPLACE_SEO_PAGES_POLICY_ID = "marketplace-seo-pages-p2-125-v1" as const;

export const MARKETPLACE_SEO_PAGES_DOC = "docs/marketplace-seo-pages.md" as const;

export const MARKETPLACE_SEO_PAGES_AUDIT_SCRIPT =
  "scripts/audit-marketplace-seo-pages.ts" as const;

export const MARKETPLACE_SEO_PAGES_NPM_SCRIPT = "audit:marketplace-seo-pages" as const;

export const MARKETPLACE_SEO_PAGES_UNIT_TEST = "tests/unit/marketplace-seo-pages.test.ts" as const;

export const MARKETPLACE_SEO_PAGES_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const RESTAURANT_SUPPLIERS_SEO_PATH = "/restaurant-suppliers" as const;

export const FOOD_DISTRIBUTORS_SEO_PATH = "/food-distributors" as const;

export const RESTAURANT_MARKETPLACE_SEO_PATH = "/restaurant-marketplace" as const;

export const MARKETPLACE_SEO_SLUGS = [
  "restaurant-suppliers",
  "food-distributors",
  "restaurant-marketplace",
] as const;

export type MarketplaceSeoSlug = (typeof MARKETPLACE_SEO_SLUGS)[number];

export const MARKETPLACE_SEO_PAGE_ENTRIES = [
  {
    slug: "restaurant-suppliers" as const,
    path: RESTAURANT_SUPPLIERS_SEO_PATH,
    pagePath: "app/restaurant-suppliers/page.tsx",
    pathConstant: "RESTAURANT_SUPPLIERS_SEO_PATH",
    testId: "restaurant-suppliers-seo-landing",
  },
  {
    slug: "food-distributors" as const,
    path: FOOD_DISTRIBUTORS_SEO_PATH,
    pagePath: "app/food-distributors/page.tsx",
    pathConstant: "FOOD_DISTRIBUTORS_SEO_PATH",
    testId: "food-distributors-seo-landing",
  },
  {
    slug: "restaurant-marketplace" as const,
    path: RESTAURANT_MARKETPLACE_SEO_PATH,
    pagePath: "app/restaurant-marketplace/page.tsx",
    pathConstant: "RESTAURANT_MARKETPLACE_SEO_PATH",
    testId: "restaurant-marketplace-seo-landing",
  },
] as const;

export const MARKETPLACE_SEO_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const MARKETPLACE_SEO_LEGACY_MARKETPLACE_ROUTE = "/dashboard/marketplace" as const;

export const MARKETPLACE_SEO_LEGACY_COMPARE_ROUTE = "/dashboard/marketplace/compare" as const;

export const MARKETPLACE_SEO_PAGES_WIRING_PATHS = [
  MARKETPLACE_SEO_PAGES_DOC,
  "lib/marketing/marketplace-seo-pages-policy.ts",
  "lib/marketing/marketplace-seo-pages-content.ts",
  "lib/marketing/marketplace-seo-pages-audit.ts",
  "components/marketing/marketplace-seo-landing.tsx",
  MARKETPLACE_SEO_PAGES_UNIT_TEST,
  ...MARKETPLACE_SEO_PAGE_ENTRIES.map((entry) => entry.pagePath),
] as const;
