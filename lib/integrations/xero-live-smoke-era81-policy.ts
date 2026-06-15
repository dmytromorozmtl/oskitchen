/**
 * Era 81 — Xero LIVE smoke PASS (Phase 1 extension #81).
 *
 * Full path: OAuth token → invoice sync → bank reconciliation wiring.
 */

export const XERO_LIVE_SMOKE_ERA81_POLICY_ID = "era81-xero-live-smoke-v1" as const;

export const XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT =
  "artifacts/xero-live-smoke-summary.json" as const;

export const XERO_LIVE_SMOKE_ERA81_NPM_SCRIPT = "smoke:xero-live" as const;

export const XERO_LIVE_SMOKE_ERA81_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-xero-live-era81.ts" as const;

export const XERO_LIVE_SMOKE_ERA81_OPS_DOC = "docs/xero-live-smoke-setup.md" as const;

export const XERO_LIVE_SMOKE_ERA81_WIRING_PATHS = [
  "scripts/smoke-xero-live.ts",
  "services/integrations/xero/invoice-sync.service.ts",
  "services/integrations/xero/bank-reconciliation.service.ts",
  "services/integrations/xero/xero-api.ts",
  "app/api/integrations/xero/oauth/callback/route.ts",
  "app/api/integrations/xero/sync-invoices/route.ts",
  "app/api/integrations/xero/reconcile-bank/route.ts",
] as const;

export const XERO_LIVE_SMOKE_ERA81_CYCLE_RUNBOOK_STEPS = [
  "Provision Xero demo organisation (not smoke-test placeholder tenant).",
  "Complete OAuth in Dashboard → Integrations → Xero; configure expense account code.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct XERO_* env).",
  "Run npm run smoke:xero-live-era81 — artifact overall PASSED.",
  "Verify steps: OAuth token → invoice sync → bank reconciliation wiring.",
] as const;

export const XERO_LIVE_SMOKE_ERA81_CI_SCRIPTS = [
  "test:ci:xero-live-smoke-era81",
  "test:ci:xero-live-smoke-era81:cert",
] as const;

export const XERO_LIVE_SMOKE_ERA81_UNIT_TESTS = [
  "tests/unit/xero-live-smoke-era81.test.ts",
  "tests/unit/smoke-xero-live.test.ts",
  "tests/unit/xero-invoice-sync.test.ts",
] as const;

export const XERO_LIVE_SMOKE_ERA81_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
