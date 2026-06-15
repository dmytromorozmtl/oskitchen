/**
 * Era 84 — Klaviyo LIVE smoke PASS (Phase 1 extension #84).
 *
 * Full path: API key verify → segment export → campaign trigger wiring.
 */

export const KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID = "era84-klaviyo-live-smoke-v1" as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT =
  "artifacts/klaviyo-live-smoke-summary.json" as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_NPM_SCRIPT = "smoke:klaviyo-live" as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-klaviyo-live-era84.ts" as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_OPS_DOC = "docs/klaviyo-live-smoke-setup.md" as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_WIRING_PATHS = [
  "scripts/smoke-klaviyo-live.ts",
  "services/integrations/klaviyo/campaign-triggers.service.ts",
  "services/integrations/klaviyo/segment-export.service.ts",
  "services/integrations/klaviyo/klaviyo-api.ts",
  "services/integrations/klaviyo/klaviyo-live-service.ts",
  "app/api/integrations/klaviyo/connect/route.ts",
  "app/api/integrations/klaviyo/export-segment/route.ts",
  "app/api/integrations/klaviyo/trigger-campaign/route.ts",
] as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_CYCLE_RUNBOOK_STEPS = [
  "Provision Klaviyo private API key (not smoke-test placeholder key).",
  "Connect in Dashboard → Integrations → Klaviyo; note a segment ID for export smoke.",
  "Set KLAVIYO_API_KEY (+ optional KLAVIYO_SEGMENT_ID) in .env.smoke.local.",
  "Run npm run smoke:klaviyo-live-era84 — artifact overall PASSED.",
  "Verify steps: API key → segment list/export → campaign trigger dry-run wiring.",
] as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_CI_SCRIPTS = [
  "test:ci:klaviyo-live-smoke-era84",
  "test:ci:klaviyo-live-smoke-era84:cert",
] as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_UNIT_TESTS = [
  "tests/unit/klaviyo-live-smoke-era84.test.ts",
  "tests/unit/smoke-klaviyo-live.test.ts",
  "tests/unit/klaviyo-segment-export.test.ts",
] as const;

export const KLAVIYO_LIVE_SMOKE_ERA84_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
