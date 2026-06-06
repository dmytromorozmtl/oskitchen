/**
 * Era 86 — Stripe LIVE smoke PASS (Phase 1 extension #86).
 *
 * Full path: API key → PaymentIntent → webhook → payout reconciliation wiring.
 */

export const STRIPE_LIVE_SMOKE_ERA86_POLICY_ID = "era86-stripe-live-smoke-v1" as const;

export const STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT =
  "artifacts/stripe-live-smoke-summary.json" as const;

export const STRIPE_LIVE_SMOKE_ERA86_NPM_SCRIPT = "smoke:stripe-live" as const;

export const STRIPE_LIVE_SMOKE_ERA86_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-stripe-live-era86.ts" as const;

export const STRIPE_LIVE_SMOKE_ERA86_OPS_DOC = "docs/stripe-live-smoke-setup.md" as const;

export const STRIPE_LIVE_SMOKE_ERA86_WIRING_PATHS = [
  "scripts/smoke-stripe-live.ts",
  "services/integrations/stripe/payment-intent.service.ts",
  "services/integrations/stripe/webhook-handler.service.ts",
  "services/integrations/stripe/payout-reconciliation.service.ts",
  "services/integrations/stripe/stripe-live-service.ts",
  "app/api/integrations/stripe/webhook/route.ts",
  "app/api/integrations/stripe/payment-intent/route.ts",
  "app/api/integrations/stripe/reconcile-payouts/route.ts",
] as const;

export const STRIPE_LIVE_SMOKE_ERA86_CYCLE_RUNBOOK_STEPS = [
  "Provision Stripe test/live secret key (not smoke-test placeholder key).",
  "Configure STRIPE_WEBHOOK_SECRET for integration webhook endpoint.",
  "Set STRIPE_SECRET_KEY + DATABASE_URL + CHANNEL_SMOKE_OWNER_EMAIL in .env.smoke.local.",
  "Run npm run smoke:stripe-live-era86 — artifact overall PASSED.",
  "Verify steps: API ping → PaymentIntent → webhook config → payout reconciliation.",
] as const;

export const STRIPE_LIVE_SMOKE_ERA86_CI_SCRIPTS = [
  "test:ci:stripe-live-smoke-era86",
  "test:ci:stripe-live-smoke-era86:cert",
] as const;

export const STRIPE_LIVE_SMOKE_ERA86_UNIT_TESTS = [
  "tests/unit/stripe-live-smoke-era86.test.ts",
  "tests/unit/smoke-stripe-live.test.ts",
  "tests/unit/stripe-live-payment-intent.test.ts",
] as const;

export const STRIPE_LIVE_SMOKE_ERA86_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
