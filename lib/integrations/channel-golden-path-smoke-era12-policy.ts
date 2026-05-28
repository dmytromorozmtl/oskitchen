/**
 * Channel golden path staging smoke — Evolution Era 12 Cycle 3.
 *
 * Certifies the optional Woo/Shopify live-store smoke script wiring and honest
 * scope. Does NOT run in default CI; requires DATABASE_URL and tenant connection.
 */

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID =
  "era12-channel-golden-path-smoke-v1" as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_EXTENDS_POLICIES = [
  "era12-channel-golden-path-recert-v1",
  "era4-channel-golden-path-v1",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT =
  "scripts/smoke-woo-shopify-certification.ts" as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_NPM_SCRIPT = "smoke:woo-shopify" as const;

/** Staging/manual only — never implied by default `ci.yml` quality job. */
export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_IN_DEFAULT_CI = false as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_REQUIRES = {
  databaseUrl: true,
  integrationConnection: true,
  liveStoreApiOptional: true,
} as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CLI_FLAGS = [
  "--skip-live",
  "--owner-email",
  "--connection-id",
  "--provider",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_SCRIPT_MARKERS = [
  "runChannelCertification",
  "skipLiveApi",
  "--skip-live",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_HONEST_SCOPE = {
  notInDefaultCi: true,
  notFullMarketplaceLiveOps: true,
  kitchenOrderAutoCreateFromWebhook: false,
  credentialsOnlyWithSkipLive: true,
} as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CI_SCRIPTS = [
  "test:ci:channel-golden-path-smoke-era12",
  "test:ci:channel-golden-path-smoke-era12:cert",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_UNIT_TESTS = [
  "tests/unit/channel-golden-path-smoke-era12-policy.test.ts",
  "tests/unit/channel-golden-path-smoke-era12-cert-live.test.ts",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CANONICAL_DOC_PATHS = [
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/commercial-pilot-runbook.md",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA12_SMOKE_CANONICAL_MARKERS = [
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_NPM_SCRIPT,
  "not in default CI",
] as const;
