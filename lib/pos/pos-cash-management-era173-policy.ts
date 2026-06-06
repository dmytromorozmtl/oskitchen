/**
 * Era 173 — POS Cash Management wiring cert (Phase 2 Round 2 #25).
 *
 * Full path: open float → mid-shift count → close with variance → printable report.
 */

import {
  POS_CASH_MANAGEMENT_ERA98_OPS_DOC,
  POS_CASH_MANAGEMENT_ERA98_POLICY_ID,
  POS_CASH_MANAGEMENT_ERA98_ROUTE,
  POS_CASH_MANAGEMENT_ERA98_SUMMARY_ARTIFACT,
  POS_CASH_MANAGEMENT_ERA98_WIRING_PATHS,
  POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS,
} from "@/lib/pos/pos-cash-management-era98-policy";

export const POS_CASH_MANAGEMENT_ERA173_POLICY_ID = "era173-pos-cash-management-v1" as const;

export const POS_CASH_MANAGEMENT_ERA173_SUMMARY_ARTIFACT =
  "artifacts/pos-cash-management-era173-smoke-summary.json" as const;

export const POS_CASH_MANAGEMENT_ERA173_NPM_SCRIPT = "smoke:pos-cash-management-era173" as const;

export const POS_CASH_MANAGEMENT_ERA173_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-cash-management-era173.ts" as const;

export const POS_CASH_MANAGEMENT_ERA173_OPS_DOC = "docs/pos-cash-management-era173-setup.md" as const;

export const POS_CASH_MANAGEMENT_ERA173_CANONICAL_OPS_DOC = POS_CASH_MANAGEMENT_ERA98_OPS_DOC;

export const POS_CASH_MANAGEMENT_ERA173_CANONICAL_SUMMARY_ARTIFACT =
  POS_CASH_MANAGEMENT_ERA98_SUMMARY_ARTIFACT;

export const POS_CASH_MANAGEMENT_ERA173_WIRING_PATHS = POS_CASH_MANAGEMENT_ERA98_WIRING_PATHS;

export const POS_CASH_MANAGEMENT_ERA173_WORKFLOW_STEPS = POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS;

export const POS_CASH_MANAGEMENT_ERA173_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Cash — open drawer with starting float.",
  "Record mid-shift count — verify variance preview without closing shift.",
  "Close shift with final count and variance acknowledgment.",
  "Run npm run smoke:pos-cash-management-era98 — canonical era98 wiring cert PASSED.",
  "Run npm run smoke:pos-cash-management-era173 — artifact overall PASSED.",
] as const;

export const POS_CASH_MANAGEMENT_ERA173_CI_SCRIPTS = [
  "test:ci:pos-cash-management-era173",
  "test:ci:pos-cash-management-era173:cert",
] as const;

export const POS_CASH_MANAGEMENT_ERA173_UNIT_TESTS = [
  "tests/unit/pos-cash-management-era173.test.ts",
  "tests/unit/pos-cash-management-era98.test.ts",
  "tests/unit/pos-cash-management.test.ts",
] as const;

export const POS_CASH_MANAGEMENT_ERA173_CANONICAL_POLICY_ID = POS_CASH_MANAGEMENT_ERA98_POLICY_ID;

export const POS_CASH_MANAGEMENT_ERA173_ROUTE = POS_CASH_MANAGEMENT_ERA98_ROUTE;

export const POS_CASH_MANAGEMENT_ERA173_CAPABILITIES = [
  "open_float",
  "mid_shift_count",
  "close_variance",
  "close_report",
] as const;
