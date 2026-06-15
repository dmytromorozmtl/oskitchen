/**
 * Era 152 — Grubhub LIVE integration wiring cert (Phase 1 Round 2 #4).
 *
 * Full path: OAuth → webhook → menu sync → KDS import → status sync → registry BETA→LIVE.
 */

import {
  GRUBHUB_LIVE_SMOKE_ERA78_INTEGRATION_HEALTH_PATH,
  GRUBHUB_LIVE_SMOKE_ERA78_OPS_DOC,
  GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT,
  GRUBHUB_LIVE_SMOKE_ERA78_WIRING_PATHS,
} from "@/lib/integrations/grubhub-live-smoke-era78-policy";

export const GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID = "era152-grubhub-live-v1" as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_SUMMARY_ARTIFACT =
  "artifacts/grubhub-live-smoke-era152-smoke-summary.json" as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_NPM_SCRIPT = "smoke:grubhub-live-era152" as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-grubhub-live-era152.ts" as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_OPS_DOC = "docs/grubhub-live-smoke-era152-setup.md" as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_CANONICAL_OPS_DOC = GRUBHUB_LIVE_SMOKE_ERA78_OPS_DOC;

export const GRUBHUB_LIVE_SMOKE_ERA152_CANONICAL_SUMMARY_ARTIFACT =
  GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT;

export const GRUBHUB_LIVE_SMOKE_ERA152_WIRING_PATHS = GRUBHUB_LIVE_SMOKE_ERA78_WIRING_PATHS;

export const GRUBHUB_LIVE_SMOKE_ERA152_CYCLE_RUNBOOK_STEPS = [
  "Provision Grubhub partner sandbox merchant ID (real ID, not smoke-test placeholder).",
  "Save API key or complete OAuth in Dashboard → Integrations → Grubhub; register orders webhook.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:grubhub-live — live OAuth → webhook → menu sync → KDS → status sync.",
  "Run npm run smoke:grubhub-live-era78 — era78 wiring cert PASSED.",
  "Run npm run smoke:grubhub-live-era152 — artifact overall PASSED.",
] as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_CI_SCRIPTS = [
  "test:ci:grubhub-live-smoke-era152",
  "test:ci:grubhub-live-smoke-era152:cert",
] as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_UNIT_TESTS = [
  "tests/unit/grubhub-live-smoke-era152.test.ts",
  "tests/unit/grubhub-live-smoke-era78.test.ts",
  "tests/unit/smoke-grubhub-live.test.ts",
] as const;

export const GRUBHUB_LIVE_SMOKE_ERA152_CANONICAL_POLICY_ID = GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID;

export const GRUBHUB_LIVE_SMOKE_ERA152_INTEGRATION_HEALTH_PATH =
  GRUBHUB_LIVE_SMOKE_ERA78_INTEGRATION_HEALTH_PATH;

export const GRUBHUB_LIVE_SMOKE_ERA152_CAPABILITIES = [
  "oauth",
  "webhook",
  "menu_sync",
  "kds_import",
  "status_sync",
] as const;
