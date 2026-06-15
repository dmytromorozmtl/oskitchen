/**
 * Era 90 — Resy LIVE smoke PASS (Phase 1 extension #90).
 *
 * Full path: OAuth token → reservation sync → waitlist wiring.
 */

export const RESY_LIVE_SMOKE_ERA90_POLICY_ID = "era90-resy-live-smoke-v1" as const;

export const RESY_LIVE_SMOKE_ERA90_SUMMARY_ARTIFACT =
  "artifacts/resy-live-smoke-summary.json" as const;

export const RESY_LIVE_SMOKE_ERA90_NPM_SCRIPT = "smoke:resy-live" as const;

export const RESY_LIVE_SMOKE_ERA90_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-resy-live-era90.ts" as const;

export const RESY_LIVE_SMOKE_ERA90_OPS_DOC = "docs/resy-live-smoke-setup.md" as const;

export const RESY_LIVE_SMOKE_ERA90_WIRING_PATHS = [
  "scripts/smoke-resy-live.ts",
  "services/integrations/resy/reservation-sync.service.ts",
  "services/integrations/resy/waitlist-sync.service.ts",
  "services/integrations/resy/reservation-webhook.service.ts",
  "services/integrations/resy/resy-api.ts",
  "services/integrations/resy/resy-live-service.ts",
  "app/api/webhooks/resy/reservations/route.ts",
  "app/api/integrations/resy/oauth/callback/route.ts",
  "app/api/integrations/resy/sync-reservations/route.ts",
  "app/api/integrations/resy/sync-waitlist/route.ts",
] as const;

export const RESY_LIVE_SMOKE_ERA90_CYCLE_RUNBOOK_STEPS = [
  "Provision Resy sandbox venue (not smoke-test placeholder credentials).",
  "Complete OAuth in Dashboard → Integrations → Resy; link storefront + webhook URL.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct RESY_* env).",
  "Run npm run smoke:resy-live-era90 — artifact overall PASSED.",
  "Verify steps: OAuth → reservation webhook → waitlist sync wiring.",
] as const;

export const RESY_LIVE_SMOKE_ERA90_CI_SCRIPTS = [
  "test:ci:resy-live-smoke-era90",
  "test:ci:resy-live-smoke-era90:cert",
] as const;

export const RESY_LIVE_SMOKE_ERA90_UNIT_TESTS = [
  "tests/unit/resy-live-smoke-era90.test.ts",
  "tests/unit/smoke-resy-live.test.ts",
  "tests/unit/resy-live-oauth.test.ts",
] as const;

export const RESY_LIVE_SMOKE_ERA90_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
