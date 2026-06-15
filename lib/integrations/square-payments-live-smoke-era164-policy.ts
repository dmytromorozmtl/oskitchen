/**
 * Era 164 — Square Payments LIVE integration wiring cert (Phase 1 Round 2 #16).
 *
 * Full path: OAuth token → payment processing → refund sync → registry LIVE.
 */

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_INTEGRATION_HEALTH_PATH,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_OPS_DOC,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_WIRING_PATHS,
} from "@/lib/integrations/square-payments-live-smoke-era87-policy";

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_POLICY_ID =
  "era164-square-payments-live-v1" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_SUMMARY_ARTIFACT =
  "artifacts/square-payments-live-smoke-era164-smoke-summary.json" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_NPM_SCRIPT =
  "smoke:square-payments-live-era164" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-square-payments-live-era164.ts" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_OPS_DOC =
  "docs/square-payments-live-smoke-era164-setup.md" as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CANONICAL_OPS_DOC =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_OPS_DOC;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CANONICAL_SUMMARY_ARTIFACT =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_WIRING_PATHS =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_WIRING_PATHS;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CYCLE_RUNBOOK_STEPS = [
  "Provision Square sandbox merchant + location (real token, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → Square Payments.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:square-payments-live — live OAuth → payment processing → refund sync.",
  "Run npm run smoke:square-payments-live-era164 — artifact overall PASSED.",
] as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CI_SCRIPTS = [
  "test:ci:square-payments-live-smoke-era164",
  "test:ci:square-payments-live-smoke-era164:cert",
] as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_UNIT_TESTS = [
  "tests/unit/square-payments-live-smoke-era164.test.ts",
  "tests/unit/square-payments-live-smoke-era87.test.ts",
  "tests/unit/smoke-square-payments-live.test.ts",
] as const;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CANONICAL_POLICY_ID =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_INTEGRATION_HEALTH_PATH =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_INTEGRATION_HEALTH_PATH;

export const SQUARE_PAYMENTS_LIVE_SMOKE_ERA164_CAPABILITIES = [
  "oauth",
  "payment_processing",
  "refund_sync",
] as const;
