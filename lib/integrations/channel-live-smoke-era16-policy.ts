/**
 * Channel live Woo/Shopify smoke — Evolution Era 16 Cycle 5.
 *
 * Orchestrates synthetic golden-path cert + optional live tenant certification.
 * Missing credentials → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */

export const CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID = "era16-channel-live-smoke-v1" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_EXTENDS_POLICIES = [
  "era14-channel-golden-path-recert-v1",
  "era12-channel-golden-path-smoke-v1",
  "era4-channel-golden-path-v1",
] as const;

export const CHANNEL_LIVE_SMOKE_ERA16_DECISION_DATE = "2026-05-28" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT = "smoke:woo-shopify-live" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-woo-shopify-live-era16.ts" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_TENANT_SCRIPT =
  "scripts/smoke-woo-shopify-certification.ts" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_LEGACY_NPM_SCRIPT = "smoke:woo-shopify" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_WORKFLOW =
  ".github/workflows/woo-shopify-staging-smoke.yml" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT =
  "artifacts/channel-live-smoke-summary.json" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_ENV_VARS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "CHANNEL_SMOKE_OWNER_EMAIL",
  "CHANNEL_SMOKE_CONNECTION_ID",
] as const;

export const CHANNEL_LIVE_SMOKE_ERA16_IN_DEFAULT_CI = false as const;

export const CHANNEL_LIVE_SMOKE_ERA16_HONEST_SCOPE = {
  notInDefaultCi: true,
  notFullMarketplaceLiveOps: true,
  kitchenOrderAutoCreateFromWebhook: false,
  missingCredentialsExplicitSkip: true,
  realCredentialFailureIsFailed: true,
} as const;

export const CHANNEL_LIVE_SMOKE_ERA16_PILOT_RUNBOOK_STEPS = [
  "Run npm run test:ci:channel-golden-path:cert (synthetic webhook→externalOrder→hub path).",
  "Configure Woo/Shopify connection in dashboard with ENCRYPTION_KEY set.",
  "Run npm run smoke:woo-shopify-live — writes artifacts/channel-live-smoke-summary.json.",
  "Missing DATABASE_URL or tenant selector → SKIPPED WITH REASON (exit 0).",
  "Live REST/webhook cert failure → FAILED (exit 1).",
  "Optional GitHub Actions: workflow_dispatch woo-shopify-staging-smoke.yml.",
  "Do not claim full marketplace live ops — BETA / pilot_ready only.",
] as const;

export const CHANNEL_LIVE_SMOKE_ERA16_REVIEW_SECTION =
  "Era 16 channel live Woo/Shopify smoke (2026-05-28)" as const;

export const CHANNEL_LIVE_SMOKE_ERA16_CANONICAL_MARKERS = [
  CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID,
  CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT,
  "SKIPPED WITH REASON",
  "channel-live-smoke-summary",
  "not in default CI",
] as const;

export const CHANNEL_LIVE_SMOKE_ERA16_FORBIDDEN_CLAIMS = [
  "full marketplace integration live",
  "production-certified marketplace",
  "automatic kitchen order creation from webhooks",
] as const;

export const CHANNEL_LIVE_SMOKE_ERA16_CI_SCRIPTS = [
  "test:ci:channel-live-smoke-era16",
  "test:ci:channel-live-smoke-era16:cert",
] as const;

export const CHANNEL_LIVE_SMOKE_ERA16_UNIT_TESTS = [
  "tests/unit/channel-live-smoke-era16-policy.test.ts",
  "tests/unit/channel-live-smoke-era16-cert-live.test.ts",
  "tests/unit/channel-live-smoke-summary.test.ts",
] as const;

export const CHANNEL_LIVE_SMOKE_ERA16_CANONICAL_DOC_PATHS = [
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
] as const;
