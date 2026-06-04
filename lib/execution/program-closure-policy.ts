/**
 * FINAL-26 — Program closure policy (task-220 / all 220 slots done).
 */

export const PROGRAM_CLOSURE_POLICY_ID = "final-26-all-tasks-done-v1" as const;

export const PROGRAM_CLOSURE_SUMMARY_ARTIFACT =
  "artifacts/program-closure-summary.json" as const;

export const PROGRAM_CLOSURE_SUMMARY_VERSION = PROGRAM_CLOSURE_POLICY_ID;

export const PROGRAM_CLOSURE_RUNNER_SCRIPT =
  "scripts/ops/run-program-closure.ts" as const;

export const PROGRAM_CLOSURE_VITEST_SPEC =
  "tests/unit/program-closure.test.ts" as const;

export const PROGRAM_CLOSURE_TRACKER_ARTIFACT =
  "artifacts/execution-tracker-final.json" as const;

export const PROGRAM_CLOSURE_FINAL_DOC =
  "docs/final-execution-report.md" as const;
