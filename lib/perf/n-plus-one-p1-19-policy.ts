/**
 * P1-19 — Fix 7 remaining N+1 map(async) / per-row query patterns with batch queries.
 *
 * @see docs/n-plus-one-p1-19.md
 */

export const N_PLUS_ONE_P1_19_POLICY_ID = "p1-19-n-plus-one-batch-v1" as const;

export const N_PLUS_ONE_P1_19_DOC = "docs/n-plus-one-p1-19.md" as const;

export const N_PLUS_ONE_P1_19_ARTIFACT = "artifacts/n-plus-one-p1-19.json" as const;

export type NPlusOneP1_19Target = {
  id: string;
  file: string;
  batchMarkers: readonly string[];
};

export const N_PLUS_ONE_P1_19_TARGETS: readonly NPlusOneP1_19Target[] = [
  {
    id: "training_assignments_batch",
    file: "app/dashboard/training/assignments/page.tsx",
    batchMarkers: ["programId: { in: programIds }", "assignmentId: { in: assignmentIds }"],
  },
  {
    id: "customer_success_batch",
    file: "app/dashboard/growth/customer-success/page.tsx",
    batchMarkers: ["computeCustomerHealthBatch", "buildRetentionSummariesBatch"],
  },
  {
    id: "growth_accounts_batch",
    file: "app/dashboard/growth/accounts/page.tsx",
    batchMarkers: ["computeCustomerHealthBatch"],
  },
  {
    id: "developer_flags_batch",
    file: "app/dashboard/developer/flags/page.tsx",
    batchMarkers: ["resolveAllFeaturesForUser"],
  },
  {
    id: "menus_reorder_batch",
    file: "actions/menus.ts",
    batchMarkers: ["id: { in: orderedIds }"],
  },
  {
    id: "bulk_price_batch",
    file: "services/purchasing/bulk-price-service.ts",
    batchMarkers: ["id: { in: itemIds }"],
  },
  {
    id: "franchise_royalties_batch",
    file: "services/franchise/franchise-service.ts",
    batchMarkers: ["order.groupBy"],
  },
] as const;

export const N_PLUS_ONE_P1_19_TARGET_COUNT = N_PLUS_ONE_P1_19_TARGETS.length;

export const N_PLUS_ONE_P1_19_FORBIDDEN_PATTERN = ".map(async";

export const N_PLUS_ONE_P1_19_CHECK_NPM_SCRIPT = "check:n-plus-one-p1-19" as const;

export const N_PLUS_ONE_P1_19_CI_NPM_SCRIPT = "test:ci:n-plus-one-p1-19" as const;

export const N_PLUS_ONE_P1_19_UNIT_TEST = "tests/unit/n-plus-one-p1-19.test.ts" as const;

export const N_PLUS_ONE_P1_19_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const N_PLUS_ONE_P1_19_WIRING_PATHS = [
  N_PLUS_ONE_P1_19_DOC,
  "lib/growth/customer-health.ts",
  "lib/plans/feature-registry.ts",
  N_PLUS_ONE_P1_19_UNIT_TEST,
  N_PLUS_ONE_P1_19_ARTIFACT,
  N_PLUS_ONE_P1_19_CI_WORKFLOW,
  ...N_PLUS_ONE_P1_19_TARGETS.map((target) => target.file),
] as const;
