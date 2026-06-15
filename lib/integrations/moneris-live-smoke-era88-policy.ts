/**
 * Era 88 — Moneris LIVE smoke PASS (Phase 1 extension #88).
 *
 * Full path: OAuth token → gateway verify → payment processing wiring.
 */

export const MONERIS_LIVE_SMOKE_ERA88_POLICY_ID = "era88-moneris-live-smoke-v1" as const;

export const MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT =
  "artifacts/moneris-live-smoke-summary.json" as const;

export const MONERIS_LIVE_SMOKE_ERA88_NPM_SCRIPT = "smoke:moneris-live" as const;

export const MONERIS_LIVE_SMOKE_ERA88_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-moneris-live-era88.ts" as const;

export const MONERIS_LIVE_SMOKE_ERA88_OPS_DOC = "docs/moneris-live-smoke-setup.md" as const;

export const MONERIS_LIVE_SMOKE_ERA88_WIRING_PATHS = [
  "scripts/smoke-moneris-live.ts",
  "services/integrations/moneris/payment-gateway.service.ts",
  "services/integrations/moneris/moneris-api.ts",
  "services/integrations/moneris/moneris-live-service.ts",
  "app/api/integrations/moneris/oauth/callback/route.ts",
  "app/api/integrations/moneris/process-payment/route.ts",
] as const;

export const MONERIS_LIVE_SMOKE_ERA88_CYCLE_RUNBOOK_STEPS = [
  "Provision Moneris sandbox store (not smoke-test placeholder credentials).",
  "Complete OAuth in Dashboard → Integrations → Moneris; set store ID.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct MONERIS_* env).",
  "Run npm run smoke:moneris-live-era88 — artifact overall PASSED.",
  "Verify steps: OAuth/gateway verify → payment gateway wiring.",
] as const;

export const MONERIS_LIVE_SMOKE_ERA88_CI_SCRIPTS = [
  "test:ci:moneris-live-smoke-era88",
  "test:ci:moneris-live-smoke-era88:cert",
] as const;

export const MONERIS_LIVE_SMOKE_ERA88_UNIT_TESTS = [
  "tests/unit/moneris-live-smoke-era88.test.ts",
  "tests/unit/smoke-moneris-live.test.ts",
  "tests/unit/moneris-live-oauth.test.ts",
] as const;

export const MONERIS_LIVE_SMOKE_ERA88_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
