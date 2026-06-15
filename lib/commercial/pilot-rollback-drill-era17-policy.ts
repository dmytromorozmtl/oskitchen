/**
 * Pilot rollback drill + retrospective — Evolution Era 17 Cycle 20 (Workstream D).
 *
 * Exercises commercial pilot rollback steps once (tabletop or staging).
 * Does NOT claim production pilot termination without operator evidence.
 */

import { COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID } from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";
import { PILOT_GONOGO_ERA17_POLICY_ID } from "@/lib/commercial/pilot-gono-go-era17-policy";
import { PILOT_METRICS_BASELINE_ERA17_POLICY_ID } from "@/lib/commercial/pilot-metrics-baseline-era17-policy";

export const PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID = "era17-pilot-rollback-drill-v1" as const;

export const PILOT_ROLLBACK_DRILL_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_ROLLBACK_DRILL_ERA17_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  PILOT_GONOGO_ERA17_POLICY_ID,
  PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
] as const;

/** Rollback drill not executed on staging/tabletop — template only. */
export const PILOT_ROLLBACK_DRILL_ERA17_PROOF_STATUS = "awaiting_rollback_drill_execution" as const;

export const PILOT_ROLLBACK_DRILL_ERA17_DOC = "docs/pilot-rollback-drill-era17.md" as const;

export const PILOT_ROLLBACK_DRILL_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-rollback-drill-era17.ts" as const;

export const PILOT_ROLLBACK_DRILL_ERA17_NPM_SCRIPT = "smoke:pilot-rollback-drill" as const;

export const PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pilot-rollback-drill-summary.json" as const;

export const PILOT_ROLLBACK_DRILL_ERA17_DRILL_MODES = ["tabletop", "staging"] as const;

export const PILOT_ROLLBACK_DRILL_ERA17_ENV_VARS = [
  "PILOT_ROLLBACK_DRILL_MODE",
  "PILOT_ROLLBACK_DRILL_STAGING_URL",
  "PILOT_ROLLBACK_DRILL_OPERATOR_EMAIL",
  "PILOT_ROLLBACK_DRILL_REASON",
  "PILOT_ROLLBACK_DRILL_COMMIT_SHA",
  "PILOT_RETROSPECTIVE_OUTCOME",
  "PILOT_RETROSPECTIVE_LESSONS",
] as const;

export const PILOT_ROLLBACK_DRILL_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Schedule rollback tabletop or staging drill with owner + support admin.",
  "Follow docs/pilot-rollback-drill-era17.md — six steps from era16 evidence pack.",
  "Set PILOT_ROLLBACK_STEP_<N>_STATUS=PASSED|FAILED per completed step.",
  "Record PILOT_RETROSPECTIVE_OUTCOME + PILOT_RETROSPECTIVE_LESSONS after drill.",
  "Run npm run smoke:pilot-rollback-drill; review artifacts/pilot-rollback-drill-summary.json.",
  "rollbackProofStatus proof_passed requires all six steps PASSED with operator email recorded.",
] as const;

export const PILOT_ROLLBACK_DRILL_ERA17_CANONICAL_MARKERS = [
  PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID,
  "pilot-rollback-drill",
  "awaiting_rollback_drill_execution",
  "rollbackProofStatus",
] as const;

export const PILOT_ROLLBACK_DRILL_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-rollback-drill-era17",
  "test:ci:pilot-rollback-drill-era17:cert",
] as const;

export const PILOT_ROLLBACK_DRILL_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-rollback-drill-era17-policy.test.ts",
  "tests/unit/pilot-rollback-drill-summary.test.ts",
  "tests/unit/pilot-rollback-drill-era17-cert-live.test.ts",
] as const;

export const PILOT_ROLLBACK_DRILL_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/pilot-rollback-drill-era17.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const PILOT_ROLLBACK_DRILL_ERA17_REVIEW_SECTION =
  "Era 17 pilot rollback drill (2026-05-28)" as const;
