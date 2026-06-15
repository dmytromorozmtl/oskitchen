/**
 * Channel golden path Era 12 recertification — Evolution Era 12 Cycle 1.
 *
 * Re-validates Era 4 Woo/Shopify golden path after Era 11; closes the documented
 * `order_hub_visibility` stage with wiring tests (no live store API).
 */

export const CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID =
  "era12-channel-golden-path-recert-v1" as const;

export const CHANNEL_GOLDEN_PATH_ERA12_EXTENDS_POLICY_ID =
  "era4-channel-golden-path-v1" as const;

/** Order hub reads `externalOrder` rows scoped to workspace owner — golden-path terminal visibility. */
export const CHANNEL_GOLDEN_PATH_ERA12_ORDER_HUB_MODULES = [
  "services/order-hub/order-hub-service.ts",
  "lib/scope/workspace-channel-scope.ts",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_ORDER_HUB_SERVICE_MARKERS = [
  "externalOrderListWhereForOwner",
  "prisma.externalOrder.findMany",
  "loadOrderHubPageData",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_WORKSPACE_SCOPE_MARKERS = [
  "externalOrderListWhereForOwner",
  "resolveOwnerScopedWhere",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_CI_SCRIPTS = [
  "test:ci:channel-golden-path-era12",
  "test:ci:channel-golden-path-era12:cert",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_UNIT_TESTS = [
  "tests/unit/channel-golden-path-era12-policy.test.ts",
  "tests/unit/channel-golden-path-era12-cert-live.test.ts",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_CANONICAL_DOC_PATHS = [
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_CANONICAL_MARKERS = [
  CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_EXTENDS_POLICY_ID,
  "order_hub_visibility",
] as const;
