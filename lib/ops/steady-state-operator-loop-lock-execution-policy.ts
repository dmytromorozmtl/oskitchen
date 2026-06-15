/**
 * Steady-state operator loop lock execution policy — Era 43 Step 15 orchestration layer.
 */
import { PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID } from "@/lib/ops/production-pilot-ready-closure-execution-orchestrator";
import {
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_DOC,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_ORCHESTRATOR_COMMAND,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_STEP16_DOC,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/steady-state-operator-loop-lock-execution-orchestrator";

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_BACKLOG_ID =
  "KOS-E43-001-STEADY-STATE-OPERATOR-LOOP-LOCK-EXECUTION" as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_EXTENDS_POLICIES = [
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID,
  "era24-post-terminus-steady-state-post-engineering-terminus-orchestrator-v1",
  "era38-post-terminus-steady-state-integrity-v1",
  "era58-era25-steady-state-operator-loop-lock-integrity-v1",
] as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_OPS_SCRIPTS = [
  "ops:run-steady-state-operator-loop-lock-execution",
  "ops:run-production-pilot-ready-closure-execution",
  "ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator",
  "ops:validate-steady-state-operator-loop",
  "ops:validate-post-terminus-steady-state-integrity",
  "ops:validate-era25-steady-state-operator-loop-lock-integrity",
  "ops:export-era-charter-readiness-checklist",
  "ops:sync-steady-state-operator-loop-report",
  "smoke:pilot-gono-go",
  "ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator",
  "ops:run-commercial-pilot-path-absolute-end-lock-execution",
] as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_CI_SCRIPTS = [
  "test:ci:steady-state-operator-loop-lock-execution",
  "test:ci:steady-state-operator-loop-lock-execution:cert",
] as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_UNIT_TESTS = [
  "tests/unit/steady-state-operator-loop-lock-execution-orchestrator.test.ts",
  "tests/unit/steady-state-operator-loop-lock-execution-cert-live.test.ts",
] as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_CANONICAL_DOC_PATHS = [
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_DOC,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_STEP16_DOC,
  "docs/next-step-15-steady-state-operator-loop-lock-execution-2026-05-29.md",
  "docs/next-step-14-production-pilot-ready-closure-2026-05-29.md",
] as const;

export const STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/post-terminus-steady-state-ui-era24.ts",
  "lib/commercial/engineering-path-terminus-ui-era24.ts",
  "lib/commercial/maintenance-mode-ui-era24.ts",
  "components/dashboard/maintenance-mode-panel.tsx",
  "lib/commercial/era25-steady-state-operator-loop-lock-ui-era25.ts",
] as const;

export {
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_DOC,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_ORCHESTRATOR_COMMAND,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_STEP16_DOC,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT,
};
