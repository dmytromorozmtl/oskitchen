/**
 * Era 161 — Klaviyo LIVE integration wiring cert (Phase 1 Round 2 #13).
 *
 * Full path: API key verify → campaign triggers → segment export → registry LIVE.
 */

import {
  KLAVIYO_LIVE_SMOKE_ERA84_INTEGRATION_HEALTH_PATH,
  KLAVIYO_LIVE_SMOKE_ERA84_OPS_DOC,
  KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT,
  KLAVIYO_LIVE_SMOKE_ERA84_WIRING_PATHS,
} from "@/lib/integrations/klaviyo-live-smoke-era84-policy";

export const KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID = "era161-klaviyo-live-v1" as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_SUMMARY_ARTIFACT =
  "artifacts/klaviyo-live-smoke-era161-smoke-summary.json" as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_NPM_SCRIPT = "smoke:klaviyo-live-era161" as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-klaviyo-live-era161.ts" as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_OPS_DOC = "docs/klaviyo-live-smoke-era161-setup.md" as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_CANONICAL_OPS_DOC = KLAVIYO_LIVE_SMOKE_ERA84_OPS_DOC;

export const KLAVIYO_LIVE_SMOKE_ERA161_CANONICAL_SUMMARY_ARTIFACT =
  KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT;

export const KLAVIYO_LIVE_SMOKE_ERA161_WIRING_PATHS = KLAVIYO_LIVE_SMOKE_ERA84_WIRING_PATHS;

export const KLAVIYO_LIVE_SMOKE_ERA161_CYCLE_RUNBOOK_STEPS = [
  "Provision Klaviyo private API key (real key, not placeholder).",
  "Connect in Dashboard → Integrations → Klaviyo; note a segment ID for export smoke.",
  "Set KLAVIYO_API_KEY (+ optional KLAVIYO_SEGMENT_ID) in .env.smoke.local.",
  "Run npm run smoke:klaviyo-live — live API key → segment export → campaign trigger.",
  "Run npm run smoke:klaviyo-live-era161 — artifact overall PASSED.",
] as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_CI_SCRIPTS = [
  "test:ci:klaviyo-live-smoke-era161",
  "test:ci:klaviyo-live-smoke-era161:cert",
] as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_UNIT_TESTS = [
  "tests/unit/klaviyo-live-smoke-era161.test.ts",
  "tests/unit/klaviyo-live-smoke-era84.test.ts",
  "tests/unit/smoke-klaviyo-live.test.ts",
] as const;

export const KLAVIYO_LIVE_SMOKE_ERA161_CANONICAL_POLICY_ID = KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID;

export const KLAVIYO_LIVE_SMOKE_ERA161_INTEGRATION_HEALTH_PATH =
  KLAVIYO_LIVE_SMOKE_ERA84_INTEGRATION_HEALTH_PATH;

export const KLAVIYO_LIVE_SMOKE_ERA161_CAPABILITIES = [
  "api_key",
  "campaign_triggers",
  "segment_export",
] as const;
