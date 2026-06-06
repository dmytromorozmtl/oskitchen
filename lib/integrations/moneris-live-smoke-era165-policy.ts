/**
 * Era 165 — Moneris LIVE integration wiring cert (Phase 1 Round 2 #17).
 *
 * Full path: OAuth token → payment gateway → registry LIVE.
 */

import {
  MONERIS_LIVE_SMOKE_ERA88_INTEGRATION_HEALTH_PATH,
  MONERIS_LIVE_SMOKE_ERA88_OPS_DOC,
  MONERIS_LIVE_SMOKE_ERA88_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT,
  MONERIS_LIVE_SMOKE_ERA88_WIRING_PATHS,
} from "@/lib/integrations/moneris-live-smoke-era88-policy";

export const MONERIS_LIVE_SMOKE_ERA165_POLICY_ID = "era165-moneris-live-v1" as const;

export const MONERIS_LIVE_SMOKE_ERA165_SUMMARY_ARTIFACT =
  "artifacts/moneris-live-smoke-era165-smoke-summary.json" as const;

export const MONERIS_LIVE_SMOKE_ERA165_NPM_SCRIPT = "smoke:moneris-live-era165" as const;

export const MONERIS_LIVE_SMOKE_ERA165_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-moneris-live-era165.ts" as const;

export const MONERIS_LIVE_SMOKE_ERA165_OPS_DOC = "docs/moneris-live-smoke-era165-setup.md" as const;

export const MONERIS_LIVE_SMOKE_ERA165_CANONICAL_OPS_DOC = MONERIS_LIVE_SMOKE_ERA88_OPS_DOC;

export const MONERIS_LIVE_SMOKE_ERA165_CANONICAL_SUMMARY_ARTIFACT =
  MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT;

export const MONERIS_LIVE_SMOKE_ERA165_WIRING_PATHS = MONERIS_LIVE_SMOKE_ERA88_WIRING_PATHS;

export const MONERIS_LIVE_SMOKE_ERA165_CYCLE_RUNBOOK_STEPS = [
  "Provision Moneris sandbox store (real credentials, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → Moneris; set store ID.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:moneris-live — live OAuth → gateway verify → payment gateway.",
  "Run npm run smoke:moneris-live-era165 — artifact overall PASSED.",
] as const;

export const MONERIS_LIVE_SMOKE_ERA165_CI_SCRIPTS = [
  "test:ci:moneris-live-smoke-era165",
  "test:ci:moneris-live-smoke-era165:cert",
] as const;

export const MONERIS_LIVE_SMOKE_ERA165_UNIT_TESTS = [
  "tests/unit/moneris-live-smoke-era165.test.ts",
  "tests/unit/moneris-live-smoke-era88.test.ts",
  "tests/unit/smoke-moneris-live.test.ts",
] as const;

export const MONERIS_LIVE_SMOKE_ERA165_CANONICAL_POLICY_ID = MONERIS_LIVE_SMOKE_ERA88_POLICY_ID;

export const MONERIS_LIVE_SMOKE_ERA165_INTEGRATION_HEALTH_PATH =
  MONERIS_LIVE_SMOKE_ERA88_INTEGRATION_HEALTH_PATH;

export const MONERIS_LIVE_SMOKE_ERA165_CAPABILITIES = ["oauth", "payment_gateway"] as const;
