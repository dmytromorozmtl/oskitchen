/**
 * Era 160 — Homebase LIVE integration wiring cert (Phase 1 Round 2 #12).
 *
 * Full path: OAuth token → time clock sync → schedule import/export → registry LIVE.
 */

import {
  HOMEBASE_LIVE_SMOKE_ERA83_INTEGRATION_HEALTH_PATH,
  HOMEBASE_LIVE_SMOKE_ERA83_OPS_DOC,
  HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT,
  HOMEBASE_LIVE_SMOKE_ERA83_WIRING_PATHS,
} from "@/lib/integrations/homebase-live-smoke-era83-policy";

export const HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID = "era160-homebase-live-v1" as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_SUMMARY_ARTIFACT =
  "artifacts/homebase-live-smoke-era160-smoke-summary.json" as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_NPM_SCRIPT = "smoke:homebase-live-era160" as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-homebase-live-era160.ts" as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_OPS_DOC = "docs/homebase-live-smoke-era160-setup.md" as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_CANONICAL_OPS_DOC = HOMEBASE_LIVE_SMOKE_ERA83_OPS_DOC;

export const HOMEBASE_LIVE_SMOKE_ERA160_CANONICAL_SUMMARY_ARTIFACT =
  HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT;

export const HOMEBASE_LIVE_SMOKE_ERA160_WIRING_PATHS = HOMEBASE_LIVE_SMOKE_ERA83_WIRING_PATHS;

export const HOMEBASE_LIVE_SMOKE_ERA160_CYCLE_RUNBOOK_STEPS = [
  "Provision Homebase demo location (real location ID, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → Homebase; map staff to Homebase employee IDs.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:homebase-live — live OAuth → time clock → schedule sync.",
  "Run npm run smoke:homebase-live-era160 — artifact overall PASSED.",
] as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_CI_SCRIPTS = [
  "test:ci:homebase-live-smoke-era160",
  "test:ci:homebase-live-smoke-era160:cert",
] as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_UNIT_TESTS = [
  "tests/unit/homebase-live-smoke-era160.test.ts",
  "tests/unit/homebase-live-smoke-era83.test.ts",
  "tests/unit/smoke-homebase-live.test.ts",
] as const;

export const HOMEBASE_LIVE_SMOKE_ERA160_CANONICAL_POLICY_ID = HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID;

export const HOMEBASE_LIVE_SMOKE_ERA160_INTEGRATION_HEALTH_PATH =
  HOMEBASE_LIVE_SMOKE_ERA83_INTEGRATION_HEALTH_PATH;

export const HOMEBASE_LIVE_SMOKE_ERA160_CAPABILITIES = [
  "oauth",
  "time_clock",
  "schedule",
] as const;
