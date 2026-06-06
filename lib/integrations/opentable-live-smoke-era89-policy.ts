/**
 * Era 89 — OpenTable LIVE smoke PASS (Phase 1 extension #89).
 *
 * Full path: OAuth token → reservation webhook → table availability wiring.
 */

export const OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID = "era89-opentable-live-smoke-v1" as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT =
  "artifacts/opentable-live-smoke-summary.json" as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_NPM_SCRIPT = "smoke:opentable-live" as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-opentable-live-era89.ts" as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_OPS_DOC = "docs/opentable-live-smoke-setup.md" as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_WIRING_PATHS = [
  "scripts/smoke-opentable-live.ts",
  "services/integrations/opentable/reservation-webhook.service.ts",
  "services/integrations/opentable/table-availability.service.ts",
  "services/integrations/opentable/opentable-api.ts",
  "services/integrations/opentable/opentable-live-service.ts",
  "app/api/webhooks/opentable/reservations/route.ts",
  "app/api/integrations/opentable/oauth/callback/route.ts",
  "app/api/integrations/opentable/availability/route.ts",
] as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_CYCLE_RUNBOOK_STEPS = [
  "Provision OpenTable sandbox restaurant (not smoke-test placeholder credentials).",
  "Complete OAuth in Dashboard → Integrations → OpenTable; link storefront + webhook URL.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct OPENTABLE_* env).",
  "Run npm run smoke:opentable-live-era89 — artifact overall PASSED.",
  "Verify steps: OAuth → reservation webhook → table availability wiring.",
] as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_CI_SCRIPTS = [
  "test:ci:opentable-live-smoke-era89",
  "test:ci:opentable-live-smoke-era89:cert",
] as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_UNIT_TESTS = [
  "tests/unit/opentable-live-smoke-era89.test.ts",
  "tests/unit/smoke-opentable-live.test.ts",
  "tests/unit/opentable-live-oauth.test.ts",
] as const;

export const OPENTABLE_LIVE_SMOKE_ERA89_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
