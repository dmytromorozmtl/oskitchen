/**
 * Era 98 — POS Cash Management wiring cert (Phase 2 extension #98).
 *
 * Full path: open float → mid-shift count → close with variance → printable report.
 */

export const POS_CASH_MANAGEMENT_ERA98_POLICY_ID = "era98-pos-cash-management-v1" as const;

export const POS_CASH_MANAGEMENT_ERA98_SUMMARY_ARTIFACT =
  "artifacts/pos-cash-management-smoke-summary.json" as const;

export const POS_CASH_MANAGEMENT_ERA98_NPM_SCRIPT = "smoke:pos-cash-management-era98" as const;

export const POS_CASH_MANAGEMENT_ERA98_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-cash-management-era98.ts" as const;

export const POS_CASH_MANAGEMENT_ERA98_OPS_DOC = "docs/pos-cash-management-era98-setup.md" as const;

export const POS_CASH_MANAGEMENT_ERA98_WIRING_PATHS = [
  "app/dashboard/pos/cash/page.tsx",
  "components/pos/pos-cash-management-client.tsx",
  "lib/pos/pos-cash-management.ts",
  "actions/pos/cash.ts",
  "services/pos/pos-cash-management-service.ts",
  "services/pos/pos-cash-count-service.ts",
  "lib/pos/pos-subnav-links.ts",
] as const;

export const POS_CASH_MANAGEMENT_ERA98_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Cash — open drawer with starting float.",
  "Record mid-shift count — verify variance preview without closing shift.",
  "Close shift with final count and variance acknowledgment.",
  "Run npm run smoke:pos-cash-management-era98 — artifact overall PASSED.",
] as const;

export const POS_CASH_MANAGEMENT_ERA98_CI_SCRIPTS = [
  "test:ci:pos-cash-management-era98",
  "test:ci:pos-cash-management-era98:cert",
] as const;

export const POS_CASH_MANAGEMENT_ERA98_UNIT_TESTS = [
  "tests/unit/pos-cash-management-era98.test.ts",
  "tests/unit/pos-cash-management.test.ts",
] as const;

export const POS_CASH_MANAGEMENT_ERA98_ROUTE = "/dashboard/pos/cash" as const;

export const POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS = [
  "open",
  "count",
  "close",
  "report",
] as const;
