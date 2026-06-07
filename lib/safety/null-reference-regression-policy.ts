/**
 * Absolute Final Task 17 — documented null-reference regression cases (fullreport6june §2.4).
 */

export const NULL_REFERENCE_REGRESSION_POLICY_ID = "absolute-final-null-reference-v1" as const;

export const NULL_REFERENCE_REGRESSION_CASES = [
  {
    id: "today-profile-created-at",
    file: "app/dashboard/today/page.tsx",
    scenario: "profile?.createdAt may be null when loading getting-started status",
    guard: "resolveOperatorSinceDate",
  },
  {
    id: "playbook-today-strip-top-pick",
    file: "components/dashboard/playbooks/playbook-today-strip.tsx",
    scenario: "recommended[0] undefined when list empty — strip must not render",
    guard: "shouldRenderPlaybookTodayStrip",
  },
  {
    id: "meal-prep-customer-name",
    file: "services/meal-prep/meal-prep-os-service.ts",
    scenario: "customer displayName and name may both be null",
    guard: "resolveMealPrepCustomerName",
  },
  {
    id: "marketplace-po-line-item-model",
    file: "services/marketplace/supplier-marketplace-service.ts",
    scenario: "Prisma delegate must be marketplacePOLineItem (not legacy typo)",
    guard: "MARKETPLACE_PO_LINE_ITEM_PRISMA_DELEGATE",
  },
  {
    id: "brand-analytics-brand-id",
    file: "services/brand/brand-analytics.ts",
    scenario: "brand rows missing id must be filtered before groupBy queries",
    guard: "filterRecordsWithId",
  },
  {
    id: "order-hub-tab-count-settlement",
    file: "services/order-hub/order-hub-exact-counts-service.ts",
    scenario: "parallel tab counts may reject — aggregate via settled fallback zeros",
    guard: "resolveSettledOrderHubTabCounts",
  },
] as const;

export const NULL_REFERENCE_REGRESSION_EXPECTED_COUNT =
  NULL_REFERENCE_REGRESSION_CASES.length;

export const NULL_REFERENCE_REGRESSION_UNIT_TESTS = [
  "tests/unit/null-reference-regression.test.ts",
] as const;

export const NULL_REFERENCE_REGRESSION_CI_SCRIPTS = [
  "test:ci:null-reference-regression",
] as const;

export const NULL_REFERENCE_REGRESSION_GUARDS_MODULE =
  "lib/safety/null-reference-guards.ts" as const;
