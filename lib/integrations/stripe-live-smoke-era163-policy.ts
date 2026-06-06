/**
 * Era 163 — Stripe LIVE integration wiring cert (Phase 1 Round 2 #15).
 *
 * Full path: secret key → PaymentIntent → webhook → payout reconciliation → registry LIVE.
 */

import {
  STRIPE_LIVE_SMOKE_ERA86_INTEGRATION_HEALTH_PATH,
  STRIPE_LIVE_SMOKE_ERA86_OPS_DOC,
  STRIPE_LIVE_SMOKE_ERA86_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT,
  STRIPE_LIVE_SMOKE_ERA86_WIRING_PATHS,
} from "@/lib/integrations/stripe-live-smoke-era86-policy";

export const STRIPE_LIVE_SMOKE_ERA163_POLICY_ID = "era163-stripe-live-v1" as const;

export const STRIPE_LIVE_SMOKE_ERA163_SUMMARY_ARTIFACT =
  "artifacts/stripe-live-smoke-era163-smoke-summary.json" as const;

export const STRIPE_LIVE_SMOKE_ERA163_NPM_SCRIPT = "smoke:stripe-live-era163" as const;

export const STRIPE_LIVE_SMOKE_ERA163_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-stripe-live-era163.ts" as const;

export const STRIPE_LIVE_SMOKE_ERA163_OPS_DOC = "docs/stripe-live-smoke-era163-setup.md" as const;

export const STRIPE_LIVE_SMOKE_ERA163_CANONICAL_OPS_DOC = STRIPE_LIVE_SMOKE_ERA86_OPS_DOC;

export const STRIPE_LIVE_SMOKE_ERA163_CANONICAL_SUMMARY_ARTIFACT =
  STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT;

export const STRIPE_LIVE_SMOKE_ERA163_WIRING_PATHS = STRIPE_LIVE_SMOKE_ERA86_WIRING_PATHS;

export const STRIPE_LIVE_SMOKE_ERA163_CYCLE_RUNBOOK_STEPS = [
  "Provision Stripe test/live secret key (real key, not placeholder).",
  "Configure STRIPE_WEBHOOK_SECRET for integration webhook endpoint.",
  "Set STRIPE_SECRET_KEY + DATABASE_URL + CHANNEL_SMOKE_OWNER_EMAIL in .env.smoke.local.",
  "Run npm run smoke:stripe-live — live PaymentIntent → webhook → payout reconciliation.",
  "Run npm run smoke:stripe-live-era163 — artifact overall PASSED.",
] as const;

export const STRIPE_LIVE_SMOKE_ERA163_CI_SCRIPTS = [
  "test:ci:stripe-live-smoke-era163",
  "test:ci:stripe-live-smoke-era163:cert",
] as const;

export const STRIPE_LIVE_SMOKE_ERA163_UNIT_TESTS = [
  "tests/unit/stripe-live-smoke-era163.test.ts",
  "tests/unit/stripe-live-smoke-era86.test.ts",
  "tests/unit/smoke-stripe-live.test.ts",
] as const;

export const STRIPE_LIVE_SMOKE_ERA163_CANONICAL_POLICY_ID = STRIPE_LIVE_SMOKE_ERA86_POLICY_ID;

export const STRIPE_LIVE_SMOKE_ERA163_INTEGRATION_HEALTH_PATH =
  STRIPE_LIVE_SMOKE_ERA86_INTEGRATION_HEALTH_PATH;

export const STRIPE_LIVE_SMOKE_ERA163_CAPABILITIES = [
  "payment_intent",
  "webhook",
  "payout_reconciliation",
] as const;
