/**
 * Era 156 — Xero LIVE integration wiring cert (Phase 1 Round 2 #8).
 *
 * Full path: OAuth token → invoice sync → bank reconciliation → registry LIVE.
 */

import {
  XERO_LIVE_SMOKE_ERA81_INTEGRATION_HEALTH_PATH,
  XERO_LIVE_SMOKE_ERA81_OPS_DOC,
  XERO_LIVE_SMOKE_ERA81_POLICY_ID,
  XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT,
  XERO_LIVE_SMOKE_ERA81_WIRING_PATHS,
} from "@/lib/integrations/xero-live-smoke-era81-policy";

export const XERO_LIVE_SMOKE_ERA156_POLICY_ID = "era156-xero-live-v1" as const;

export const XERO_LIVE_SMOKE_ERA156_SUMMARY_ARTIFACT =
  "artifacts/xero-live-smoke-era156-smoke-summary.json" as const;

export const XERO_LIVE_SMOKE_ERA156_NPM_SCRIPT = "smoke:xero-live-era156" as const;

export const XERO_LIVE_SMOKE_ERA156_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-xero-live-era156.ts" as const;

export const XERO_LIVE_SMOKE_ERA156_OPS_DOC = "docs/xero-live-smoke-era156-setup.md" as const;

export const XERO_LIVE_SMOKE_ERA156_CANONICAL_OPS_DOC = XERO_LIVE_SMOKE_ERA81_OPS_DOC;

export const XERO_LIVE_SMOKE_ERA156_CANONICAL_SUMMARY_ARTIFACT =
  XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT;

export const XERO_LIVE_SMOKE_ERA156_WIRING_PATHS = XERO_LIVE_SMOKE_ERA81_WIRING_PATHS;

export const XERO_LIVE_SMOKE_ERA156_CYCLE_RUNBOOK_STEPS = [
  "Provision Xero demo organisation (real tenant ID, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → Xero; configure expense account code.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:xero-live — live OAuth → invoice sync → bank reconciliation.",
  "Run npm run smoke:xero-live-era156 — artifact overall PASSED.",
] as const;

export const XERO_LIVE_SMOKE_ERA156_CI_SCRIPTS = [
  "test:ci:xero-live-smoke-era156",
  "test:ci:xero-live-smoke-era156:cert",
] as const;

export const XERO_LIVE_SMOKE_ERA156_UNIT_TESTS = [
  "tests/unit/xero-live-smoke-era156.test.ts",
  "tests/unit/xero-live-smoke-era81.test.ts",
  "tests/unit/smoke-xero-live.test.ts",
] as const;

export const XERO_LIVE_SMOKE_ERA156_CANONICAL_POLICY_ID = XERO_LIVE_SMOKE_ERA81_POLICY_ID;

export const XERO_LIVE_SMOKE_ERA156_INTEGRATION_HEALTH_PATH =
  XERO_LIVE_SMOKE_ERA81_INTEGRATION_HEALTH_PATH;

export const XERO_LIVE_SMOKE_ERA156_CAPABILITIES = [
  "oauth",
  "invoice_sync",
  "bank_reconciliation",
] as const;
