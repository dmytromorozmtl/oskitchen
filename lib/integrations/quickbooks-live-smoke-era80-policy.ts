/**
 * Era 80 — QuickBooks LIVE smoke PASS (Phase 1 extension #80).
 *
 * Full path: OAuth token → chart of accounts sync → daily sales journal export wiring.
 */

export const QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID = "era80-quickbooks-live-smoke-v1" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT =
  "artifacts/quickbooks-live-smoke-summary.json" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_NPM_SCRIPT = "smoke:quickbooks-live" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-quickbooks-live-era80.ts" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_OPS_DOC = "docs/quickbooks-live-smoke-setup.md" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_WIRING_PATHS = [
  "scripts/smoke-quickbooks-live.ts",
  "services/integrations/quickbooks/daily-sales-journal.service.ts",
  "services/integrations/quickbooks/chart-of-accounts.service.ts",
  "services/integrations/quickbooks/quickbooks-api.ts",
  "app/api/integrations/quickbooks/oauth/callback/route.ts",
  "app/api/integrations/quickbooks/sync-journal/route.ts",
  "app/api/integrations/quickbooks/accounts/route.ts",
] as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_CYCLE_RUNBOOK_STEPS = [
  "Provision Intuit QuickBooks sandbox company (not smoke-test placeholder realm).",
  "Complete OAuth in Dashboard → Integrations → QuickBooks; map sales + deposit accounts.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct QUICKBOOKS_* env).",
  "Run npm run smoke:quickbooks-live-era80 — artifact overall PASSED.",
  "Verify steps: OAuth token → chart of accounts query → daily journal wiring.",
] as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_CI_SCRIPTS = [
  "test:ci:quickbooks-live-smoke-era80",
  "test:ci:quickbooks-live-smoke-era80:cert",
] as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_UNIT_TESTS = [
  "tests/unit/quickbooks-live-smoke-era80.test.ts",
  "tests/unit/smoke-quickbooks-live.test.ts",
  "tests/unit/quickbooks-daily-sales-journal.test.ts",
] as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA80_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
