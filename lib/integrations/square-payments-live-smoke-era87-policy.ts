/**
 * Era 87 — Square Payments LIVE smoke PASS (Phase 1 extension #87).
 *
 * Full path: OAuth token → payment processing → refund sync wiring.
 */

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID =
  "era87-square-payments-live-smoke-v1" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT =
  "artifacts/square-payments-live-smoke-summary.json" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_NPM_SCRIPT = "smoke:square-payments-live" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-square-payments-live-era87.ts" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_OPS_DOC =
  "docs/square-payments-live-smoke-setup.md" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_WIRING_PATHS = [
  "scripts/smoke-square-payments-live.ts",
  "services/integrations/square-payments/payment-processing.service.ts",
  "services/integrations/square-payments/refund-sync.service.ts",
  "services/integrations/square-payments/square-payments-api.ts",
  "services/integrations/square-payments/square-payments-live-service.ts",
  "app/api/integrations/square-payments/oauth/callback/route.ts",
  "app/api/integrations/square-payments/process-payment/route.ts",
  "app/api/integrations/square-payments/sync-refunds/route.ts",
] as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_CYCLE_RUNBOOK_STEPS = [
  "Provision Square sandbox merchant + location (not smoke-test placeholder token).",
  "Complete OAuth in Dashboard → Integrations → Square Payments.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct SQUARE_PAYMENTS_* env).",
  "Run npm run smoke:square-payments-live-era87 — artifact overall PASSED.",
  "Verify steps: OAuth token → payment processing → refund sync wiring.",
] as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_CI_SCRIPTS = [
  "test:ci:square-payments-live-smoke-era87",
  "test:ci:square-payments-live-smoke-era87:cert",
] as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_UNIT_TESTS = [
  "tests/unit/square-payments-live-smoke-era87.test.ts",
  "tests/unit/smoke-square-payments-live.test.ts",
  "tests/unit/square-payments-live-oauth.test.ts",
] as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
