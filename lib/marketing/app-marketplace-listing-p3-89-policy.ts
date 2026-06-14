/**
 * P3-89 — Remove empty /app-marketplace from primary navigation.
 *
 * The public catalog page may remain for direct URL / SEO, but it must not
 * appear in marketing header, footer, mobile nav, or dashboard nav CTAs.
 *
 * @see docs/app-marketplace-listing-p3-89.md
 * @see app/app-marketplace/page.tsx
 */

export const APP_MARKETPLACE_LISTING_P3_89_POLICY_ID =
  "app-marketplace-listing-p3-89-v1" as const;

export const APP_MARKETPLACE_LISTING_P3_89_DOC =
  "docs/app-marketplace-listing-p3-89.md" as const;

export const APP_MARKETPLACE_LISTING_P3_89_ARTIFACT =
  "artifacts/app-marketplace-listing-p3-89.json" as const;

export const APP_MARKETPLACE_LISTING_P3_89_AUDIT_MODULE =
  "lib/marketing/app-marketplace-listing-p3-89-audit.ts" as const;

export const APP_MARKETPLACE_LISTING_P3_89_CHECK_NPM_SCRIPT =
  "check:app-marketplace-listing-p3-89" as const;

export const APP_MARKETPLACE_LISTING_P3_89_UNIT_TEST =
  "tests/unit/app-marketplace-listing-p3-89.test.ts" as const;

export const APP_MARKETPLACE_LISTING_P3_89_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

/** Route kept for direct access — banned from nav surfaces only. */
export const APP_MARKETPLACE_LISTING_P3_89_ROUTE = "/app-marketplace" as const;

/** Where operators should go instead of the empty public catalog. */
export const APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF = "/partners" as const;

export const APP_MARKETPLACE_LISTING_P3_89_NAV_SCAN_PATHS = [
  "lib/marketing/site-nav.ts",
  "components/marketing/site-header-client.tsx",
  "components/marketing/site-footer.tsx",
  "components/marketing/site-mobile-nav.tsx",
  "components/marketing/product-nav-dropdown.tsx",
  "components/marketing/resources-nav-dropdown.tsx",
  "components/marketing/solutions-nav-dropdown.tsx",
  "app/dashboard/integrations/extensions/page.tsx",
  "components/dashboard/extensions/app-marketplace-third-party-strip.tsx",
] as const;

export const APP_MARKETPLACE_LISTING_P3_89_NAV_BANNED_PATTERNS = [
  'href="/app-marketplace"',
  "href='/app-marketplace'",
  "href={\"/app-marketplace\"}",
  "href={'/app-marketplace'}",
  "APP_MARKETPLACE_THIRD_PARTY_ROUTE",
] as const;

export const APP_MARKETPLACE_LISTING_P3_89_WIRING_PATHS = [
  APP_MARKETPLACE_LISTING_P3_89_DOC,
  APP_MARKETPLACE_LISTING_P3_89_ARTIFACT,
  APP_MARKETPLACE_LISTING_P3_89_AUDIT_MODULE,
  APP_MARKETPLACE_LISTING_P3_89_UNIT_TEST,
  APP_MARKETPLACE_LISTING_P3_89_CI_WORKFLOW,
  "app/app-marketplace/page.tsx",
  APP_MARKETPLACE_LISTING_P3_89_NAV_SCAN_PATHS[0],
] as const;
