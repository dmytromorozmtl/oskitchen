/**
 * Production calendar operator drill — Evolution Era 17 Workstream F Cycle 27.
 *
 * Records staging URL + operator identity + manual checklist attestation for pilot ops.
 * Does NOT claim drag-and-drop, KDS sync, delete-task UI, or rush-hour certification.
 */

import { PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID } from "@/lib/production/production-calendar-operator-depth-era15-policy";

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID =
  "era17-production-calendar-operator-drill-v1" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_EXTENDS_POLICIES = [
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID,
  "era13-production-calendar-operator-depth-v1",
  "era16-operational-signoff-v1",
] as const;

/** Awaiting operator staging drill execution — not manually certified yet. */
export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_PROOF_STATUS =
  "awaiting_staging_operator_drill" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-production-calendar-operator-drill-era17.ts" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_SUMMARY_ARTIFACT =
  "artifacts/production-calendar-operator-drill-summary.json" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_NPM_SCRIPT =
  "smoke:production-calendar-drill" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_LEGACY_SMOKE =
  "smoke:production-calendar" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_OPS_DOC =
  "docs/production-calendar-operator-checklist.md" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_PREREQUISITE_ENV_VARS = [
  "PRODUCTION_CALENDAR_DRILL_STAGING_URL",
  "PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_ATTESTATION_ENV_VARS = [
  "PRODUCTION_CALENDAR_DRILL_MANUAL",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Set PRODUCTION_CALENDAR_DRILL_STAGING_URL to staging host (e.g. https://staging.example.com).",
  "Set PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL to the ops lead performing the drill.",
  "Run npm run smoke:production-calendar-drill — review artifacts/production-calendar-operator-drill-summary.json.",
  "Complete manual checklist in docs/production-calendar-operator-checklist.md on staging.",
  "Re-run with PRODUCTION_CALENDAR_DRILL_MANUAL=passed when all seven manual steps pass.",
  "Do not claim drag-and-drop, KDS sync, delete-task UI, or rush-hour production certification.",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CANONICAL_MARKERS = [
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID,
  "smoke:production-calendar-drill",
  "awaiting_staging_operator_drill",
  "PRODUCTION_CALENDAR_DRILL_STAGING_URL",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_FORBIDDEN_CLAIMS = [
  "production calendar rush-hour certified",
  "drag-and-drop production calendar",
  "kds sync from production calendar",
  "operator drill pass without staging attestation",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CI_SCRIPTS = [
  "test:ci:production-calendar-operator-drill-era17",
  "test:ci:production-calendar-operator-drill-era17:cert",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_UNIT_TESTS = [
  "tests/unit/production-calendar-operator-drill-era17-policy.test.ts",
  "tests/unit/production-calendar-operator-drill-summary.test.ts",
  "tests/unit/production-calendar-operator-drill-era17-cert-live.test.ts",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CANONICAL_DOC_PATHS = [
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_OPS_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_REVIEW_SECTION =
  "Era 17 production calendar operator drill (2026-05-28)" as const;

export const PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_BACKLOG_ID = "KOS-E17-017" as const;
