/**
 * FINAL-18 — Integration Health moat surfaces policy (task-212).
 */

export const INTEGRATION_HEALTH_MOAT_POLICY_ID = "final-18-integration-health-v1" as const;

export const INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT =
  "artifacts/integration-health-moat-summary.json" as const;

export const INTEGRATION_HEALTH_MOAT_SUMMARY_VERSION = "final-18-integration-health-v1" as const;

export const INTEGRATION_HEALTH_STRIP_COMPONENT =
  "components/dashboard/integration-health-strip.tsx" as const;

export const INTEGRATION_HEALTH_LANDING_COMPONENT =
  "components/marketing/landing-integration-health-moat.tsx" as const;

export const INTEGRATION_HEALTH_HOME_PAGE = "app/page.tsx" as const;

export const INTEGRATION_HEALTH_DASHBOARD_PAGE =
  "app/dashboard/integration-health/page.tsx" as const;

export const INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT =
  "scripts/ops/run-integration-health-moat-audit.ts" as const;

export const INTEGRATION_HEALTH_MOAT_VITEST_SPEC =
  "tests/unit/integration-health-moat-surfaces.test.ts" as const;

/** Contract markers — strip + landing + dashboard moat surfaces. */
export const INTEGRATION_HEALTH_STRIP_MARKERS = [
  "Integration Health moat",
  "Channel health score",
  "pilot-integration-health-strip",
  "/dashboard/integration-health",
] as const;

export const INTEGRATION_HEALTH_LANDING_MARKERS = [
  "Integration Health moat",
  "PASS, SKIPPED, or FAILED",
  "Main differentiator",
] as const;

export const INTEGRATION_HEALTH_HOME_MARKERS = [
  "LandingIntegrationHealthMoat",
  "Integration Health",
] as const;

export const INTEGRATION_HEALTH_DASHBOARD_PAGE_MARKERS = [
  "IntegrationHealthAttentionStrip",
  "integration-health",
] as const;
