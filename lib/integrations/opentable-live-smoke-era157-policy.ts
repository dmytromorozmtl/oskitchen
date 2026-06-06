/**
 * Era 157 — OpenTable LIVE integration wiring cert (Phase 1 Round 2 #9).
 *
 * Full path: OAuth token → reservation webhook → table availability → registry PLACEHOLDER→LIVE.
 */

import {
  OPENTABLE_LIVE_SMOKE_ERA89_INTEGRATION_HEALTH_PATH,
  OPENTABLE_LIVE_SMOKE_ERA89_OPS_DOC,
  OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT,
  OPENTABLE_LIVE_SMOKE_ERA89_WIRING_PATHS,
} from "@/lib/integrations/opentable-live-smoke-era89-policy";

export const OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID = "era157-opentable-live-v1" as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_SUMMARY_ARTIFACT =
  "artifacts/opentable-live-smoke-era157-smoke-summary.json" as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_NPM_SCRIPT = "smoke:opentable-live-era157" as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-opentable-live-era157.ts" as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_OPS_DOC =
  "docs/opentable-live-smoke-era157-setup.md" as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_CANONICAL_OPS_DOC =
  OPENTABLE_LIVE_SMOKE_ERA89_OPS_DOC;

export const OPENTABLE_LIVE_SMOKE_ERA157_CANONICAL_SUMMARY_ARTIFACT =
  OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT;

export const OPENTABLE_LIVE_SMOKE_ERA157_WIRING_PATHS =
  OPENTABLE_LIVE_SMOKE_ERA89_WIRING_PATHS;

export const OPENTABLE_LIVE_SMOKE_ERA157_CYCLE_RUNBOOK_STEPS = [
  "Provision OpenTable sandbox restaurant (real credentials, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → OpenTable; link storefront + webhook URL.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:opentable-live — live OAuth → reservation webhook → table availability.",
  "Run npm run smoke:opentable-live-era157 — artifact overall PASSED.",
] as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_CI_SCRIPTS = [
  "test:ci:opentable-live-smoke-era157",
  "test:ci:opentable-live-smoke-era157:cert",
] as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_UNIT_TESTS = [
  "tests/unit/opentable-live-smoke-era157.test.ts",
  "tests/unit/opentable-live-smoke-era89.test.ts",
  "tests/unit/smoke-opentable-live.test.ts",
] as const;

export const OPENTABLE_LIVE_SMOKE_ERA157_CANONICAL_POLICY_ID =
  OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID;

export const OPENTABLE_LIVE_SMOKE_ERA157_INTEGRATION_HEALTH_PATH =
  OPENTABLE_LIVE_SMOKE_ERA89_INTEGRATION_HEALTH_PATH;

export const OPENTABLE_LIVE_SMOKE_ERA157_CAPABILITIES = [
  "oauth",
  "reservation_webhook",
  "table_availability",
] as const;
