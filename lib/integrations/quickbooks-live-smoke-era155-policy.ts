/**
 * Era 155 — QuickBooks LIVE integration wiring cert (Phase 1 Round 2 #7).
 *
 * Full path: OAuth token → chart of accounts sync → daily sales journal → registry LIVE.
 */

import {
  QUICKBOOKS_LIVE_SMOKE_ERA80_INTEGRATION_HEALTH_PATH,
  QUICKBOOKS_LIVE_SMOKE_ERA80_OPS_DOC,
  QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT,
  QUICKBOOKS_LIVE_SMOKE_ERA80_WIRING_PATHS,
} from "@/lib/integrations/quickbooks-live-smoke-era80-policy";

export const QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID = "era155-quickbooks-live-v1" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_SUMMARY_ARTIFACT =
  "artifacts/quickbooks-live-smoke-era155-smoke-summary.json" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_NPM_SCRIPT = "smoke:quickbooks-live-era155" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-quickbooks-live-era155.ts" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_OPS_DOC =
  "docs/quickbooks-live-smoke-era155-setup.md" as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_CANONICAL_OPS_DOC =
  QUICKBOOKS_LIVE_SMOKE_ERA80_OPS_DOC;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_CANONICAL_SUMMARY_ARTIFACT =
  QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_WIRING_PATHS =
  QUICKBOOKS_LIVE_SMOKE_ERA80_WIRING_PATHS;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_CYCLE_RUNBOOK_STEPS = [
  "Provision Intuit QuickBooks sandbox company (real realm ID, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → QuickBooks; map sales + deposit accounts.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:quickbooks-live — live OAuth → chart of accounts → daily journal.",
  "Run npm run smoke:quickbooks-live-era155 — artifact overall PASSED.",
] as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_CI_SCRIPTS = [
  "test:ci:quickbooks-live-smoke-era155",
  "test:ci:quickbooks-live-smoke-era155:cert",
] as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_UNIT_TESTS = [
  "tests/unit/quickbooks-live-smoke-era155.test.ts",
  "tests/unit/quickbooks-live-smoke-era80.test.ts",
  "tests/unit/smoke-quickbooks-live.test.ts",
] as const;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_CANONICAL_POLICY_ID =
  QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_INTEGRATION_HEALTH_PATH =
  QUICKBOOKS_LIVE_SMOKE_ERA80_INTEGRATION_HEALTH_PATH;

export const QUICKBOOKS_LIVE_SMOKE_ERA155_CAPABILITIES = [
  "oauth",
  "daily_sales_journal",
  "chart_of_accounts",
] as const;
