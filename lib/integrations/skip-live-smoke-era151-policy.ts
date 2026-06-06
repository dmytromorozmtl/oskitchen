/**
 * Era 151 — Skip/Just Eat LIVE integration wiring cert (Phase 1 Round 2 #3).
 *
 * Full path: OAuth → webhook → KDS import → status sync → registry PLACEHOLDER→LIVE.
 */

import {
  SKIP_LIVE_SMOKE_ERA79_INTEGRATION_HEALTH_PATH,
  SKIP_LIVE_SMOKE_ERA79_OPS_DOC,
  SKIP_LIVE_SMOKE_ERA79_POLICY_ID,
  SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT,
  SKIP_LIVE_SMOKE_ERA79_WIRING_PATHS,
} from "@/lib/integrations/skip-live-smoke-era79-policy";

export const SKIP_LIVE_SMOKE_ERA151_POLICY_ID = "era151-skip-live-v1" as const;

export const SKIP_LIVE_SMOKE_ERA151_SUMMARY_ARTIFACT =
  "artifacts/skip-live-smoke-era151-smoke-summary.json" as const;

export const SKIP_LIVE_SMOKE_ERA151_NPM_SCRIPT = "smoke:skip-live-era151" as const;

export const SKIP_LIVE_SMOKE_ERA151_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-skip-live-era151.ts" as const;

export const SKIP_LIVE_SMOKE_ERA151_OPS_DOC = "docs/skip-live-smoke-era151-setup.md" as const;

export const SKIP_LIVE_SMOKE_ERA151_CANONICAL_OPS_DOC = SKIP_LIVE_SMOKE_ERA79_OPS_DOC;

export const SKIP_LIVE_SMOKE_ERA151_CANONICAL_SUMMARY_ARTIFACT =
  SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT;

export const SKIP_LIVE_SMOKE_ERA151_WIRING_PATHS = SKIP_LIVE_SMOKE_ERA79_WIRING_PATHS;

export const SKIP_LIVE_SMOKE_ERA151_CYCLE_RUNBOOK_STEPS = [
  "Provision Skip/Just Eat partner sandbox restaurant ID (real ID, not smoke-test placeholder).",
  "Complete OAuth in Dashboard → Integrations → Skip; register orders webhook.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:skip-live — live OAuth → webhook → KDS → status sync.",
  "Run npm run smoke:skip-live-era79 — era79 wiring cert PASSED.",
  "Run npm run smoke:skip-live-era151 — artifact overall PASSED.",
] as const;

export const SKIP_LIVE_SMOKE_ERA151_CI_SCRIPTS = [
  "test:ci:skip-live-smoke-era151",
  "test:ci:skip-live-smoke-era151:cert",
] as const;

export const SKIP_LIVE_SMOKE_ERA151_UNIT_TESTS = [
  "tests/unit/skip-live-smoke-era151.test.ts",
  "tests/unit/skip-live-smoke-era79.test.ts",
  "tests/unit/smoke-skip-live.test.ts",
] as const;

export const SKIP_LIVE_SMOKE_ERA151_CANONICAL_POLICY_ID = SKIP_LIVE_SMOKE_ERA79_POLICY_ID;

export const SKIP_LIVE_SMOKE_ERA151_INTEGRATION_HEALTH_PATH =
  SKIP_LIVE_SMOKE_ERA79_INTEGRATION_HEALTH_PATH;

export const SKIP_LIVE_SMOKE_ERA151_CAPABILITIES = [
  "oauth",
  "webhook",
  "kds_import",
  "status_sync",
] as const;
