/**
 * Era 150 — DoorDash LIVE integration wiring cert (Phase 1 Round 2 #2).
 *
 * Full path: OAuth/Drive API → webhook → menu sync → KDS import → status sync → registry LIVE.
 */

import {
  DOORDASH_LIVE_SMOKE_ERA77_INTEGRATION_HEALTH_PATH,
  DOORDASH_LIVE_SMOKE_ERA77_OPS_DOC,
  DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT,
  DOORDASH_LIVE_SMOKE_ERA77_WIRING_PATHS,
} from "@/lib/integrations/doordash-live-smoke-era77-policy";

export const DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID = "era150-doordash-live-v1" as const;

export const DOORDASH_LIVE_SMOKE_ERA150_SUMMARY_ARTIFACT =
  "artifacts/doordash-live-smoke-era150-smoke-summary.json" as const;

export const DOORDASH_LIVE_SMOKE_ERA150_NPM_SCRIPT = "smoke:doordash-live-era150" as const;

export const DOORDASH_LIVE_SMOKE_ERA150_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-doordash-live-era150.ts" as const;

export const DOORDASH_LIVE_SMOKE_ERA150_OPS_DOC = "docs/doordash-live-smoke-era150-setup.md" as const;

export const DOORDASH_LIVE_SMOKE_ERA150_CANONICAL_OPS_DOC = DOORDASH_LIVE_SMOKE_ERA77_OPS_DOC;

export const DOORDASH_LIVE_SMOKE_ERA150_CANONICAL_SUMMARY_ARTIFACT =
  DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT;

export const DOORDASH_LIVE_SMOKE_ERA150_WIRING_PATHS = DOORDASH_LIVE_SMOKE_ERA77_WIRING_PATHS;

export const DOORDASH_LIVE_SMOKE_ERA150_CYCLE_RUNBOOK_STEPS = [
  "Provision DoorDash partner sandbox merchant ID (real ID, not smoke-test placeholder).",
  "Save API key or complete OAuth in Dashboard → Integrations → DoorDash; register orders webhook.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:doordash-live — live Drive API → webhook → menu sync → KDS → status sync.",
  "Run npm run smoke:doordash-live-era77 — era77 wiring cert PASSED.",
  "Run npm run smoke:doordash-live-era150 — artifact overall PASSED.",
] as const;

export const DOORDASH_LIVE_SMOKE_ERA150_CI_SCRIPTS = [
  "test:ci:doordash-live-smoke-era150",
  "test:ci:doordash-live-smoke-era150:cert",
] as const;

export const DOORDASH_LIVE_SMOKE_ERA150_UNIT_TESTS = [
  "tests/unit/doordash-live-smoke-era150.test.ts",
  "tests/unit/doordash-live-smoke-era77.test.ts",
  "tests/unit/smoke-doordash-live.test.ts",
] as const;

export const DOORDASH_LIVE_SMOKE_ERA150_CANONICAL_POLICY_ID = DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID;

export const DOORDASH_LIVE_SMOKE_ERA150_INTEGRATION_HEALTH_PATH =
  DOORDASH_LIVE_SMOKE_ERA77_INTEGRATION_HEALTH_PATH;

export const DOORDASH_LIVE_SMOKE_ERA150_CAPABILITIES = [
  "oauth",
  "drive_api",
  "webhook",
  "menu_sync",
  "kds_import",
  "status_sync",
] as const;
