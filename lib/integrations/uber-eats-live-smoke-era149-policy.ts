/**
 * Era 149 — Uber Eats LIVE integration wiring cert (Phase 1 Round 2 #1).
 *
 * Full path: OAuth → signed orders webhook → KDS import → status sync → registry LIVE.
 */

import {
  UBER_EATS_LIVE_SMOKE_ERA76_INTEGRATION_HEALTH_PATH,
  UBER_EATS_LIVE_SMOKE_ERA76_OPS_DOC,
  UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT,
  UBER_EATS_LIVE_SMOKE_ERA76_WIRING_PATHS,
} from "@/lib/integrations/uber-eats-live-smoke-era76-policy";

export const UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID = "era149-uber-eats-live-v1" as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_SUMMARY_ARTIFACT =
  "artifacts/uber-eats-live-smoke-era149-smoke-summary.json" as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_NPM_SCRIPT = "smoke:uber-eats-live-era149" as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-uber-eats-live-era149.ts" as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_OPS_DOC = "docs/uber-eats-live-smoke-era149-setup.md" as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_CANONICAL_OPS_DOC = UBER_EATS_LIVE_SMOKE_ERA76_OPS_DOC;

export const UBER_EATS_LIVE_SMOKE_ERA149_CANONICAL_SUMMARY_ARTIFACT =
  UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT;

export const UBER_EATS_LIVE_SMOKE_ERA149_WIRING_PATHS = UBER_EATS_LIVE_SMOKE_ERA76_WIRING_PATHS;

export const UBER_EATS_LIVE_SMOKE_ERA149_CYCLE_RUNBOOK_STEPS = [
  "Provision Uber Eats partner sandbox store UUID (real UUID, not smoke-test placeholder).",
  "Complete OAuth in Dashboard → Integrations → Uber Eats; register orders webhook.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:uber-eats-live — live OAuth → webhook → KDS → status sync.",
  "Run npm run smoke:uber-eats-live-era76 — era76 wiring cert PASSED.",
  "Run npm run smoke:uber-eats-live-era149 — artifact overall PASSED.",
] as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_CI_SCRIPTS = [
  "test:ci:uber-eats-live-smoke-era149",
  "test:ci:uber-eats-live-smoke-era149:cert",
] as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_UNIT_TESTS = [
  "tests/unit/uber-eats-live-smoke-era149.test.ts",
  "tests/unit/uber-eats-live-smoke-era76.test.ts",
  "tests/unit/smoke-uber-eats-live.test.ts",
] as const;

export const UBER_EATS_LIVE_SMOKE_ERA149_CANONICAL_POLICY_ID = UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID;

export const UBER_EATS_LIVE_SMOKE_ERA149_INTEGRATION_HEALTH_PATH =
  UBER_EATS_LIVE_SMOKE_ERA76_INTEGRATION_HEALTH_PATH;

export const UBER_EATS_LIVE_SMOKE_ERA149_CAPABILITIES = [
  "oauth",
  "webhook",
  "kds_import",
  "status_sync",
] as const;
