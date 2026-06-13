/**
 * Blueprint P3-63 — /restaurant-integration-health landing page.
 *
 * @see app/restaurant-integration-health/page.tsx
 * @see docs/restaurant-integration-health-landing-p3-63.md
 */

import {
  RESTAURANT_INTEGRATION_HEALTH_LANDING_META,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH,
} from "@/lib/marketing/restaurant-integration-health-landing-content";

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_POLICY_ID =
  "restaurant-integration-health-landing-p3-63-v1" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC =
  "docs/restaurant-integration-health-landing-p3-63.md" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_ARTIFACT =
  "artifacts/restaurant-integration-health-landing-p3-63-registry.json" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_AUDIT_SCRIPT =
  "scripts/audit-restaurant-integration-health-landing-p3-63.ts" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPT =
  "audit:restaurant-integration-health-landing-p3-63" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CHECK_NPM_SCRIPT =
  "check:restaurant-integration-health-landing-p3-63" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_UNIT_TEST =
  "tests/unit/restaurant-integration-health-landing-p3-63.test.ts" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_UPSTREAM_TEST =
  "tests/unit/integration-health-center-marketing-absolute-final.test.ts" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH =
  RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_PRIMARY_KEYWORD =
  "restaurant integration health" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_SALES_PAGE =
  "/integration-health-center" as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPTS = [
  "test:ci:restaurant-integration-health-landing",
  "test:ci:restaurant-integration-health-landing:cert",
] as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_WIRING_PATHS = [
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC,
  "app/restaurant-integration-health/page.tsx",
  "components/marketing/restaurant-integration-health-landing.tsx",
  "lib/marketing/restaurant-integration-health-landing-content.ts",
  "lib/marketing/restaurant-integration-health-landing-audit.ts",
  "lib/marketing/restaurant-integration-health-landing-p3-63-measurement.ts",
  "lib/marketing/restaurant-integration-health-landing-p3-63-audit.ts",
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_UNIT_TEST,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_ARTIFACT,
] as const;

export function restaurantIntegrationHealthLandingCanonicalPath(): string {
  return RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH;
}

export function restaurantIntegrationHealthLandingPathsAligned(): boolean {
  return (
    RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH ===
      RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH &&
    RESTAURANT_INTEGRATION_HEALTH_LANDING_META.utmCampaign === "restaurant_integration_health_seo"
  );
}
