/**
 * Era 158 — Resy LIVE integration wiring cert (Phase 1 Round 2 #10).
 *
 * Full path: OAuth token → reservation sync → waitlist → registry PLACEHOLDER→LIVE.
 */

import {
  RESY_LIVE_SMOKE_ERA90_INTEGRATION_HEALTH_PATH,
  RESY_LIVE_SMOKE_ERA90_OPS_DOC,
  RESY_LIVE_SMOKE_ERA90_POLICY_ID,
  RESY_LIVE_SMOKE_ERA90_SUMMARY_ARTIFACT,
  RESY_LIVE_SMOKE_ERA90_WIRING_PATHS,
} from "@/lib/integrations/resy-live-smoke-era90-policy";

export const RESY_LIVE_SMOKE_ERA158_POLICY_ID = "era158-resy-live-v1" as const;

export const RESY_LIVE_SMOKE_ERA158_SUMMARY_ARTIFACT =
  "artifacts/resy-live-smoke-era158-smoke-summary.json" as const;

export const RESY_LIVE_SMOKE_ERA158_NPM_SCRIPT = "smoke:resy-live-era158" as const;

export const RESY_LIVE_SMOKE_ERA158_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-resy-live-era158.ts" as const;

export const RESY_LIVE_SMOKE_ERA158_OPS_DOC = "docs/resy-live-smoke-era158-setup.md" as const;

export const RESY_LIVE_SMOKE_ERA158_CANONICAL_OPS_DOC = RESY_LIVE_SMOKE_ERA90_OPS_DOC;

export const RESY_LIVE_SMOKE_ERA158_CANONICAL_SUMMARY_ARTIFACT =
  RESY_LIVE_SMOKE_ERA90_SUMMARY_ARTIFACT;

export const RESY_LIVE_SMOKE_ERA158_WIRING_PATHS = RESY_LIVE_SMOKE_ERA90_WIRING_PATHS;

export const RESY_LIVE_SMOKE_ERA158_CYCLE_RUNBOOK_STEPS = [
  "Provision Resy sandbox venue (real credentials, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → Resy; link storefront + webhook URL.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:resy-live — live OAuth → reservation sync → waitlist.",
  "Run npm run smoke:resy-live-era158 — artifact overall PASSED.",
] as const;

export const RESY_LIVE_SMOKE_ERA158_CI_SCRIPTS = [
  "test:ci:resy-live-smoke-era158",
  "test:ci:resy-live-smoke-era158:cert",
] as const;

export const RESY_LIVE_SMOKE_ERA158_UNIT_TESTS = [
  "tests/unit/resy-live-smoke-era158.test.ts",
  "tests/unit/resy-live-smoke-era90.test.ts",
  "tests/unit/smoke-resy-live.test.ts",
] as const;

export const RESY_LIVE_SMOKE_ERA158_CANONICAL_POLICY_ID = RESY_LIVE_SMOKE_ERA90_POLICY_ID;

export const RESY_LIVE_SMOKE_ERA158_INTEGRATION_HEALTH_PATH =
  RESY_LIVE_SMOKE_ERA90_INTEGRATION_HEALTH_PATH;

export const RESY_LIVE_SMOKE_ERA158_CAPABILITIES = [
  "oauth",
  "reservation_sync",
  "waitlist",
] as const;
