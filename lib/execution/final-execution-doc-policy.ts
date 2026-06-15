/**
 * FINAL-23 — Final execution markdown report sync policy (task-217).
 */

export const FINAL_EXECUTION_DOC_POLICY_ID = "final-23-final-execution-doc-v1" as const;

export const FINAL_EXECUTION_DOC_PATH = "docs/final-execution-report.md" as const;

export const FINAL_EXECUTION_DOC_SYNC_SUMMARY_ARTIFACT =
  "artifacts/final-execution-doc-sync-summary.json" as const;

export const FINAL_EXECUTION_DOC_SYNC_SUMMARY_VERSION =
  "final-23-final-execution-doc-v1" as const;

export const FINAL_EXECUTION_DOC_RUNNER_SCRIPT =
  "scripts/ops/run-final-execution-doc-sync.ts" as const;

export const FINAL_EXECUTION_DOC_VITEST_SPEC =
  "tests/unit/final-execution-doc-sync.test.ts" as const;

/** Contract markers — markdown must mirror JSON snapshot fields. */
export const FINAL_EXECUTION_DOC_MARKERS = [
  "Final execution report (FINAL-23)",
  "final-22-final-execution-json-v1",
  "artifacts/final-execution-report.json",
  "trackerSync",
  "goDecision",
  "Gate artifacts (FINAL-13",
] as const;
