/**
 * KDS staging / operational smoke policy — Evolution Era 4 Cycle 10.
 *
 * Certifies one honest operational path for daily-service KDS v1:
 * automated queue→bump in CI + optional DB smoke script + manual staging UI checklist.
 *
 * Does NOT certify rush-hour, multi-station, realtime Playwright, or hardware KDS.
 */

export const KDS_STAGING_SMOKE_POLICY_ID = "era4-kds-staging-smoke-v1" as const;

/** Automated stages covered without a live browser. */
export const KDS_STAGING_SMOKE_AUTOMATED_STAGES = [
  "rbac_fetch_bump_recall",
  "queue_ticket_visible",
  "bump_to_ready",
  "allergen_conflict_flag",
] as const;

export type KdsStagingSmokeAutomatedStage =
  (typeof KDS_STAGING_SMOKE_AUTOMATED_STAGES)[number];

/** Manual staging steps — see docs/kds-staging-smoke-checklist.md */
export const KDS_STAGING_SMOKE_MANUAL_STAGES = [
  "kitchen_page_load",
  "ticket_render_and_timer",
  "bump_recall_ui",
  "realtime_or_poll_refresh",
] as const;

export const KDS_STAGING_SMOKE_HONEST_SCOPE = {
  dailyServiceQueueCertified: true,
  stagingChecklistDocumented: true,
  stagingDbSmokeScript: "scripts/smoke-kds-daily-service.ts",
  stagingChecklistDoc: "docs/kds-staging-smoke-checklist.md",
  rushHourCertified: false,
  multiStationCertified: false,
  realtimePlaywrightCertified: false,
  hardwareKdsCertified: false,
} as const;

export const KDS_STAGING_SMOKE_FORBIDDEN_CLAIMS = [
  /rush[- ]?hour\s+(certified|ready)/i,
  /multi[- ]?station\s+(certified|routing)/i,
  /realtime\s+E2E\s+certified/i,
  /Toast[- ]class\s+KDS/i,
  /production_certified.*KDS/i,
] as const;

/** Prerequisite KDS v1 CI (governance bundles — not re-run by staging-smoke bundle). */
export const KDS_V1_CI_PREREQUISITES = [
  "test:ci:kds-v1:unit",
  "test:ci:kds-v1:integration",
  "test:ci:kds-v1:cert",
] as const;

export const KDS_STAGING_SMOKE_CI_SCRIPTS = [
  "test:ci:kds-staging-smoke",
  "test:ci:kds-staging-smoke:cert",
] as const;

export const KDS_STAGING_SMOKE_UNIT_TESTS = [
  "tests/unit/kds-staging-smoke-policy.test.ts",
  "tests/unit/kds-staging-smoke-wiring.test.ts",
] as const;

export const KDS_STAGING_SMOKE_ENTRY_ROUTES = [
  "/dashboard/kitchen",
  "/dashboard/kitchen?fullscreen=1",
  "/dashboard/kitchen/tablet",
] as const;
