/**
 * Era 159 — 7shifts LIVE integration wiring cert (Phase 1 Round 2 #11).
 *
 * Full path: OAuth token → schedule import/export → labor cost sync → registry LIVE.
 */

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_INTEGRATION_HEALTH_PATH,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_OPS_DOC,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_WIRING_PATHS,
} from "@/lib/integrations/seven-shifts-live-smoke-era82-policy";

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID = "era159-seven-shifts-live-v1" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SUMMARY_ARTIFACT =
  "artifacts/seven-shifts-live-smoke-era159-smoke-summary.json" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_NPM_SCRIPT = "smoke:seven-shifts-live-era159" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-seven-shifts-live-era159.ts" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_OPS_DOC =
  "docs/seven-shifts-live-smoke-era159-setup.md" as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CANONICAL_OPS_DOC =
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_OPS_DOC;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CANONICAL_SUMMARY_ARTIFACT =
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_WIRING_PATHS =
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_WIRING_PATHS;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CYCLE_RUNBOOK_STEPS = [
  "Provision 7shifts demo company (real company ID, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → 7shifts; map staff to 7shifts user IDs.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:seven-shifts-live — live OAuth → schedule import/export → labor cost.",
  "Run npm run smoke:seven-shifts-live-era159 — artifact overall PASSED.",
] as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CI_SCRIPTS = [
  "test:ci:seven-shifts-live-smoke-era159",
  "test:ci:seven-shifts-live-smoke-era159:cert",
] as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_UNIT_TESTS = [
  "tests/unit/seven-shifts-live-smoke-era159.test.ts",
  "tests/unit/seven-shifts-live-smoke-era82.test.ts",
  "tests/unit/smoke-seven-shifts-live.test.ts",
] as const;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CANONICAL_POLICY_ID =
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_INTEGRATION_HEALTH_PATH =
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_INTEGRATION_HEALTH_PATH;

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CAPABILITIES = [
  "oauth",
  "schedule_import_export",
  "labor_cost",
] as const;
