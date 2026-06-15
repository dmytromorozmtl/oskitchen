/**
 * Era 147 — Pilot Week 1 report wiring cert (Phase 10 #74).
 *
 * Full path: signed LOI → Week 1 checkpoint report → KPI capture → execution orchestrator.
 */

import {
  PILOT_WEEK1_REPORT_ERA74_CHECKLIST_DOC,
  PILOT_WEEK1_REPORT_ERA74_CUSTOMER,
  PILOT_WEEK1_REPORT_ERA74_DOC,
  PILOT_WEEK1_REPORT_ERA74_DOC_REQUIRED_HEADINGS,
  PILOT_WEEK1_REPORT_ERA74_FORBIDDEN_CLAIMS,
  PILOT_WEEK1_REPORT_ERA74_KPI_TARGETS,
  PILOT_WEEK1_REPORT_ERA74_LOI_DOC,
  PILOT_WEEK1_REPORT_ERA74_POLICY_ID,
  PILOT_WEEK1_REPORT_ERA74_WORKSPACE_SLUG,
} from "@/lib/commercial/pilot-week1-report-era74-policy";

export const PILOT_WEEK1_REPORT_ERA147_POLICY_ID = "era147-pilot-week1-report-v1" as const;

export const PILOT_WEEK1_REPORT_ERA147_SUMMARY_ARTIFACT =
  "artifacts/pilot-week1-report-era147-smoke-summary.json" as const;

export const PILOT_WEEK1_REPORT_ERA147_NPM_SCRIPT = "smoke:pilot-week1-report-era147" as const;

export const PILOT_WEEK1_REPORT_ERA147_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-week1-report-era147.ts" as const;

export const PILOT_WEEK1_REPORT_ERA147_OPS_DOC = "docs/pilot-week1-report-era147-setup.md" as const;

export const PILOT_WEEK1_REPORT_ERA147_CANONICAL_DOC = PILOT_WEEK1_REPORT_ERA74_DOC;

export const PILOT_WEEK1_REPORT_ERA147_WIRING_PATHS = [
  PILOT_WEEK1_REPORT_ERA74_DOC,
  PILOT_WEEK1_REPORT_ERA74_LOI_DOC,
  PILOT_WEEK1_REPORT_ERA74_CHECKLIST_DOC,
  "lib/commercial/pilot-week1-report-era74-policy.ts",
  "lib/ops/pilot-week1-execution-orchestrator.ts",
  "scripts/ops/run-pilot-week1-execution.ts",
  "tests/unit/pilot-week1-report-era74.test.ts",
] as const;

export const PILOT_WEEK1_REPORT_ERA147_CYCLE_RUNBOOK_STEPS = [
  "Confirm LOI-DP-001 signed and staging workspace riverbend-commissary provisioned.",
  "Execute Week 1 per docs/pilot-week1-checklist.md — Days 0–5 golden path.",
  "Capture KPIs in docs/pilot-week1-report.md — CONDITIONAL PASS with honest staging caveat.",
  "Run npm run ops:run-pilot-week1-execution -- --write — execution summary artifact.",
  "CS + COO sign-off recorded in report before external citation.",
  "Run npm run smoke:pilot-week1-report-era147 — artifact overall PASSED.",
] as const;

export const PILOT_WEEK1_REPORT_ERA147_CI_SCRIPTS = [
  "test:ci:pilot-week1-report-era147",
  "test:ci:pilot-week1-report-era147:cert",
] as const;

export const PILOT_WEEK1_REPORT_ERA147_UNIT_TESTS = [
  "tests/unit/pilot-week1-report-era147.test.ts",
  "tests/unit/pilot-week1-report-era74.test.ts",
  "tests/unit/pilot-week1-execution-orchestrator.test.ts",
] as const;

export const PILOT_WEEK1_REPORT_ERA147_CANONICAL_POLICY_ID = PILOT_WEEK1_REPORT_ERA74_POLICY_ID;

export const PILOT_WEEK1_REPORT_ERA147_CUSTOMER = PILOT_WEEK1_REPORT_ERA74_CUSTOMER;

export const PILOT_WEEK1_REPORT_ERA147_WORKSPACE_SLUG = PILOT_WEEK1_REPORT_ERA74_WORKSPACE_SLUG;

export const PILOT_WEEK1_REPORT_ERA147_DOC_REQUIRED_HEADINGS =
  PILOT_WEEK1_REPORT_ERA74_DOC_REQUIRED_HEADINGS;

export const PILOT_WEEK1_REPORT_ERA147_FORBIDDEN_CLAIMS =
  PILOT_WEEK1_REPORT_ERA74_FORBIDDEN_CLAIMS;

export const PILOT_WEEK1_REPORT_ERA147_KPI_TARGETS = PILOT_WEEK1_REPORT_ERA74_KPI_TARGETS;

export const PILOT_WEEK1_REPORT_ERA147_EXECUTION_ARTIFACT =
  "artifacts/pilot-week1-execution-summary.json" as const;

export const PILOT_WEEK1_REPORT_ERA147_CAPABILITIES = [
  "week1_checkpoint_report",
  "kpi_capture",
  "loi_parent_chain",
] as const;
