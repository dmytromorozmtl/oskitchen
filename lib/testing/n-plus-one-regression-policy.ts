/**
 * Absolute Final Task 53 — N+1 regression tests with query count assertions.
 *
 * Guards the eight P0 batched-query fixes from Task 6.
 *
 * @see tests/unit/n-plus-one-regression.test.ts
 * @see tests/unit/n-plus-one-p0-fixes.test.ts
 */

export const N_PLUS_ONE_REGRESSION_POLICY_ID =
  "n-plus-one-regression-absolute-final-v1" as const;

export const N_PLUS_ONE_REGRESSION_SPEC_PATH =
  "tests/unit/n-plus-one-regression.test.ts" as const;

export const N_PLUS_ONE_REGRESSION_HARNESS_PATH =
  "lib/testing/prisma-query-count-harness.ts" as const;

export const N_PLUS_ONE_REGRESSION_P0_SPEC_PATH =
  "tests/unit/n-plus-one-p0-fixes.test.ts" as const;

export const N_PLUS_ONE_REGRESSION_CI_SCRIPTS = [
  "test:ci:n-plus-one-regression",
] as const;

export type NPlusOneRegressionTarget = {
  id: string;
  module: string;
  entrypoint: string;
  batchMarker: string;
  maxQueries: number;
  scaleInvariant?: boolean;
};

/** Eight Task-6 services guarded by query-count regression tests. */
export const N_PLUS_ONE_REGRESSION_TARGETS: readonly NPlusOneRegressionTarget[] = [
  {
    id: "brand_analytics_group_by",
    module: "services/brand/brand-analytics.ts",
    entrypoint: "getBrandsOverview",
    batchMarker: "groupBy",
    maxQueries: 6,
    scaleInvariant: true,
  },
  {
    id: "order_hub_all_settled",
    module: "services/order-hub/order-hub-exact-counts-service.ts",
    entrypoint: "loadOrderHubExactTabCounts",
    batchMarker: "Promise.allSettled",
    maxQueries: 0,
  },
  {
    id: "pos_shift_batch_txn",
    module: "services/pos/pos-shift-service.ts",
    entrypoint: "listOpenShiftCloseoutPreviews",
    batchMarker: "shiftId: { in: shiftIds }",
    maxQueries: 4,
    scaleInvariant: true,
  },
  {
    id: "beta_cohort_batch",
    module: "services/beta/beta-service.ts",
    entrypoint: "getBetaProgramDashboard",
    batchMarker: "findMany",
    maxQueries: 0,
  },
  {
    id: "export_concurrency_five",
    module: "services/data/export-service.ts",
    entrypoint: "loadDataPortabilitySnapshot",
    batchMarker: "mapWithConcurrency",
    maxQueries: 0,
  },
  {
    id: "partner_oauth_batch_apps",
    module: "services/platform/partner-oauth-app-registry-service.ts",
    entrypoint: "getMergedPartnerOAuthAppsByClientIds",
    batchMarker: "clientId: { in: uniqueIds }",
    maxQueries: 1,
    scaleInvariant: true,
  },
  {
    id: "cron_sla_bulk_load",
    module: "services/support/sla-service.ts",
    entrypoint: "loadActiveSlaPolicyRows",
    batchMarker: "findMany",
    maxQueries: 1,
  },
  {
    id: "vendor_webhook_batch",
    module: "services/marketplace/vendor-api-service.ts",
    entrypoint: "dispatchVendorWebhookEvent",
    batchMarker: "mapWithConcurrency",
    maxQueries: 2,
  },
] as const;

export const N_PLUS_ONE_REGRESSION_TARGET_COUNT = N_PLUS_ONE_REGRESSION_TARGETS.length;

export const N_PLUS_ONE_EXPORT_CONCURRENCY = 5 as const;

export const N_PLUS_ONE_VENDOR_WEBHOOK_CONCURRENCY = 5 as const;

export function nPlusOneRegressionTargetIds(): string[] {
  return N_PLUS_ONE_REGRESSION_TARGETS.map((target) => target.id);
}

export function nPlusOneRegressionScaleInvariantTargets(): readonly NPlusOneRegressionTarget[] {
  return N_PLUS_ONE_REGRESSION_TARGETS.filter((target) => target.scaleInvariant);
}
