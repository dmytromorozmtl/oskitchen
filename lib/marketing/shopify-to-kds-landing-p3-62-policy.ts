/**
 * Blueprint P3-62 — /shopify-to-kds landing page.
 *
 * @see app/shopify-to-kds/page.tsx
 * @see docs/shopify-to-kds-landing-p3-62.md
 */

import {
  SHOPIFY_TO_KDS_LANDING_META,
  SHOPIFY_TO_KDS_LANDING_PATH,
} from "@/lib/marketing/shopify-to-kds-landing-content";

export const SHOPIFY_TO_KDS_LANDING_P3_62_POLICY_ID = "shopify-to-kds-landing-p3-62-v1" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_DOC = "docs/shopify-to-kds-landing-p3-62.md" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_ARTIFACT =
  "artifacts/shopify-to-kds-landing-p3-62-registry.json" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_AUDIT_SCRIPT =
  "scripts/audit-shopify-to-kds-landing-p3-62.ts" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPT = "audit:shopify-to-kds-landing-p3-62" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_CHECK_NPM_SCRIPT =
  "check:shopify-to-kds-landing-p3-62" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_UNIT_TEST =
  "tests/unit/shopify-to-kds-landing-p3-62.test.ts" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH = SHOPIFY_TO_KDS_LANDING_PATH;

export const SHOPIFY_TO_KDS_LANDING_P3_62_PRIMARY_KEYWORD = "shopify to kds" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_PAGE = "app/shopify-to-kds/page.tsx" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_COMPONENT =
  "components/marketing/shopify-to-kds-landing.tsx" as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_NPM_SCRIPTS = [
  "test:ci:shopify-to-kds-landing",
  "test:ci:shopify-to-kds-landing:cert",
] as const;

export const SHOPIFY_TO_KDS_LANDING_P3_62_WIRING_PATHS = [
  SHOPIFY_TO_KDS_LANDING_P3_62_DOC,
  SHOPIFY_TO_KDS_LANDING_P3_62_PAGE,
  SHOPIFY_TO_KDS_LANDING_P3_62_COMPONENT,
  "lib/marketing/shopify-to-kds-landing-content.ts",
  "lib/marketing/shopify-to-kds-landing-audit.ts",
  "lib/marketing/shopify-to-kds-landing-p3-62-measurement.ts",
  "lib/marketing/shopify-to-kds-landing-p3-62-audit.ts",
  SHOPIFY_TO_KDS_LANDING_P3_62_UNIT_TEST,
  SHOPIFY_TO_KDS_LANDING_P3_62_ARTIFACT,
] as const;

export function shopifyToKdsLandingCanonicalPath(): string {
  return SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH;
}

export function shopifyToKdsLandingPathsAligned(): boolean {
  return (
    SHOPIFY_TO_KDS_LANDING_PATH === SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH &&
    SHOPIFY_TO_KDS_LANDING_META.utmCampaign === "shopify_to_kds_seo"
  );
}
