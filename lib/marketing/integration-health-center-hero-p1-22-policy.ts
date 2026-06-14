/**
 * P1-22 — Integration Health Center hero on homepage (live counter + dashboard visual).
 *
 * @see docs/integration-health-center-hero-p1-22.md
 */

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_POLICY_ID =
  "integration-health-center-hero-p1-22-v1" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_DOC =
  "docs/integration-health-center-hero-p1-22.md" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_ARTIFACT =
  "artifacts/integration-health-center-hero-p1-22.json" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_HOME_PAGE = "app/page.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_LANDING_COMPONENT =
  "components/marketing/landing-integration-health-moat.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_DASHBOARD_COMPONENT =
  "components/marketing/sync-health-dashboard-marketing.tsx" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_CHANNEL_CONTENT =
  "lib/marketing/sync-health-dashboard-marketing-content.ts" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_TEST_ID =
  "integration-health-center-hero-p1-22" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_COUNTER_TEST_ID =
  "integration-health-live-counter-p1-22" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_DASHBOARD_TEST_ID =
  "sync-health-dashboard-marketing" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_IHC_ROUTE =
  "/integration-health-center" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_CHECK_NPM_SCRIPT =
  "check:integration-health-center-hero-p1-22" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_CI_NPM_SCRIPT =
  "test:ci:integration-health-center-hero-p1-22" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_UNIT_TEST =
  "tests/unit/integration-health-center-hero-p1-22.test.ts" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const INTEGRATION_HEALTH_CENTER_HERO_P1_22_WIRING_PATHS = [
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_DOC,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_HOME_PAGE,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_LANDING_COMPONENT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_DASHBOARD_COMPONENT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_CHANNEL_CONTENT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_UNIT_TEST,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_ARTIFACT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_CI_WORKFLOW,
] as const;
