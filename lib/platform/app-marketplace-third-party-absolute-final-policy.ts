/**
 * Absolute Final Task 89 — app marketplace for 3rd party extensions.
 *
 * @see app/app-marketplace/page.tsx
 * @see app/dashboard/integrations/extensions/page.tsx
 */

export const APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID =
  "app-marketplace-third-party-absolute-final-v1" as const;

export const APP_MARKETPLACE_THIRD_PARTY_ROUTE = "/app-marketplace" as const;

export const APP_MARKETPLACE_THIRD_PARTY_PAGE_PATH = "app/app-marketplace/page.tsx" as const;

export const APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH =
  "components/marketing/app-marketplace-third-party.tsx" as const;

export const APP_MARKETPLACE_THIRD_PARTY_CONTENT_PATH =
  "lib/platform/app-marketplace-third-party-content.ts" as const;

export const APP_MARKETPLACE_THIRD_PARTY_STRIP_PATH =
  "components/dashboard/extensions/app-marketplace-third-party-strip.tsx" as const;

export const APP_MARKETPLACE_EXTENSIONS_PAGE =
  "app/dashboard/integrations/extensions/page.tsx" as const;

export const APP_MARKETPLACE_DEVELOPERS_PAGE = "app/dashboard/developers/page.tsx" as const;

export const APP_MARKETPLACE_PARTNER_APPS_CONFIG = "config/commercial/partner-apps.json" as const;

export const APP_MARKETPLACE_THIRD_PARTY_REQUIRED_MARKERS = [
  'data-testid="app-marketplace-third-party"',
  "AppMarketplaceThirdParty",
] as const;

export const APP_MARKETPLACE_THIRD_PARTY_HONESTY_MARKERS = [
  "BETA",
  "ROADMAP",
  "platform review",
  "not a self-serve",
  "Illustrative",
] as const;

export const APP_MARKETPLACE_THIRD_PARTY_WIRING_PATHS = [
  APP_MARKETPLACE_THIRD_PARTY_PAGE_PATH,
  APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH,
  APP_MARKETPLACE_THIRD_PARTY_CONTENT_PATH,
  APP_MARKETPLACE_THIRD_PARTY_STRIP_PATH,
  APP_MARKETPLACE_EXTENSIONS_PAGE,
  APP_MARKETPLACE_PARTNER_APPS_CONFIG,
  "lib/platform/app-marketplace-third-party-absolute-final-policy.ts",
  "lib/platform/app-marketplace-third-party-audit.ts",
  "tests/unit/app-marketplace-third-party-absolute-final.test.ts",
] as const;

export const APP_MARKETPLACE_THIRD_PARTY_UNIT_TEST =
  "tests/unit/app-marketplace-third-party-absolute-final.test.ts" as const;

export const APP_MARKETPLACE_THIRD_PARTY_CI_SCRIPTS = [
  "test:ci:app-marketplace-third-party",
  "test:ci:app-marketplace-third-party:cert",
] as const;

export const APP_MARKETPLACE_THIRD_PARTY_UPSTREAM_POLICIES = [
  "partner-apps-catalog-v1",
  "app-marketplace-oauth-v1",
] as const;
