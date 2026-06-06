/**
 * Era 82 — 7shifts LIVE smoke PASS (Phase 1 extension #82).
 *
 * Full path: OAuth token → schedule import → labor cost sync wiring.
 */

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID = "era82-seven-shifts-live-smoke-v1" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT =
  "artifacts/seven-shifts-live-smoke-summary.json" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_NPM_SCRIPT = "smoke:seven-shifts-live" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-seven-shifts-live-era82.ts" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_OPS_DOC = "docs/seven-shifts-live-smoke-setup.md" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_WIRING_PATHS = [
  "scripts/smoke-seven-shifts-live.ts",
  "services/integrations/seven-shifts/schedule-import.service.ts",
  "services/integrations/seven-shifts/schedule-export.service.ts",
  "services/integrations/seven-shifts/labor-cost.service.ts",
  "services/integrations/seven-shifts/seven-shifts-api.ts",
  "app/api/integrations/7shifts/oauth/callback/route.ts",
  "app/api/integrations/7shifts/sync-schedule/route.ts",
  "app/api/integrations/7shifts/sync-labor/route.ts",
] as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_CYCLE_RUNBOOK_STEPS = [
  "Provision 7shifts demo company (not smoke-test placeholder company ID).",
  "Complete OAuth in Dashboard → Integrations → 7shifts; map staff to 7shifts user IDs.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct SEVENSHIFTS_* env).",
  "Run npm run smoke:seven-shifts-live-era82 — artifact overall PASSED.",
  "Verify steps: OAuth token → schedule import → labor cost sync wiring.",
] as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_CI_SCRIPTS = [
  "test:ci:seven-shifts-live-smoke-era82",
  "test:ci:seven-shifts-live-smoke-era82:cert",
] as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_UNIT_TESTS = [
  "tests/unit/seven-shifts-live-smoke-era82.test.ts",
  "tests/unit/smoke-seven-shifts-live.test.ts",
  "tests/unit/seven-shifts-labor-cost.test.ts",
] as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA82_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
