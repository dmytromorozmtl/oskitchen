/**
 * Era 83 — Homebase LIVE smoke PASS (Phase 1 extension #83).
 *
 * Full path: OAuth token → schedule import → time clock sync wiring.
 */

export const HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID = "era83-homebase-live-smoke-v1" as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT =
  "artifacts/homebase-live-smoke-summary.json" as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_NPM_SCRIPT = "smoke:homebase-live" as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-homebase-live-era83.ts" as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_OPS_DOC = "docs/homebase-live-smoke-setup.md" as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_WIRING_PATHS = [
  "scripts/smoke-homebase-live.ts",
  "services/integrations/homebase/schedule-import.service.ts",
  "services/integrations/homebase/schedule-export.service.ts",
  "services/integrations/homebase/time-clock.service.ts",
  "services/integrations/homebase/homebase-api.ts",
  "app/api/integrations/homebase/oauth/callback/route.ts",
  "app/api/integrations/homebase/sync-schedule/route.ts",
  "app/api/integrations/homebase/sync-timeclock/route.ts",
] as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_CYCLE_RUNBOOK_STEPS = [
  "Provision Homebase demo location (not smoke-test placeholder location ID).",
  "Complete OAuth in Dashboard → Integrations → Homebase; map staff to Homebase employee IDs.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct HOMEBASE_* env).",
  "Run npm run smoke:homebase-live-era83 — artifact overall PASSED.",
  "Verify steps: OAuth token → schedule import → time clock sync wiring.",
] as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_CI_SCRIPTS = [
  "test:ci:homebase-live-smoke-era83",
  "test:ci:homebase-live-smoke-era83:cert",
] as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_UNIT_TESTS = [
  "tests/unit/homebase-live-smoke-era83.test.ts",
  "tests/unit/smoke-homebase-live.test.ts",
  "tests/unit/homebase-time-clock.test.ts",
] as const;

export const HOMEBASE_LIVE_SMOKE_ERA83_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
