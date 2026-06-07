/**
 * Absolute Final Task 83 — sync health dashboard marketing angle (per channel).
 *
 * @see app/sync-health/page.tsx
 * @see lib/marketing/integration-health-center-marketing-content.ts
 */

export const SYNC_HEALTH_DASHBOARD_MARKETING_ABSOLUTE_FINAL_POLICY_ID =
  "sync-health-dashboard-marketing-absolute-final-v1" as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_ROUTE = "/sync-health" as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_PAGE_PATH = "app/sync-health/page.tsx" as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_COMPONENT_PATH =
  "components/marketing/sync-health-dashboard-marketing.tsx" as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_CONTENT_PATH =
  "lib/marketing/sync-health-dashboard-marketing-content.ts" as const;

export const SYNC_HEALTH_IHC_MARKETING_LANDING_PATH =
  "components/marketing/integration-health-center-marketing-landing.tsx" as const;

export const SYNC_HEALTH_INTEGRATION_HEALTH_DASHBOARD =
  "/dashboard/integration-health" as const;

export const SYNC_HEALTH_REQUIRED_MARKERS = [
  'data-testid="sync-health-dashboard-marketing"',
  "SyncHealthDashboardMarketing",
] as const;

export const SYNC_HEALTH_HONESTY_MARKERS = [
  "SKIPPED",
  "BETA",
  "Illustrative",
  "not fake green",
  "partner-gated",
] as const;

export const SYNC_HEALTH_WIRING_PATHS = [
  SYNC_HEALTH_DASHBOARD_MARKETING_PAGE_PATH,
  SYNC_HEALTH_DASHBOARD_MARKETING_COMPONENT_PATH,
  SYNC_HEALTH_DASHBOARD_MARKETING_CONTENT_PATH,
  SYNC_HEALTH_IHC_MARKETING_LANDING_PATH,
  "lib/marketing/sync-health-dashboard-marketing-absolute-final-policy.ts",
  "lib/marketing/sync-health-dashboard-marketing-audit.ts",
  "tests/unit/sync-health-dashboard-marketing-absolute-final.test.ts",
] as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_UNIT_TEST =
  "tests/unit/sync-health-dashboard-marketing-absolute-final.test.ts" as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_CI_SCRIPTS = [
  "test:ci:sync-health-dashboard-marketing",
  "test:ci:sync-health-dashboard-marketing:cert",
] as const;

export const SYNC_HEALTH_UPSTREAM_POLICIES = [
  "integration-health-center-marketing-absolute-final-v1",
  "final-18-integration-health-v1",
] as const;
