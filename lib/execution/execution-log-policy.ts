/**
 * FINAL-24 — Execution log cycle continuity policy (task-218).
 */

export const EXECUTION_LOG_POLICY_ID = "final-24-execution-log-v1" as const;

export const EXECUTION_LOG_ARTIFACT = "artifacts/execution-log.txt" as const;

export const EXECUTION_LOG_CONTINUITY_SUMMARY_ARTIFACT =
  "artifacts/execution-log-continuity-summary.json" as const;

export const EXECUTION_LOG_CONTINUITY_SUMMARY_VERSION =
  "final-24-execution-log-v1" as const;

export const EXECUTION_LOG_RUNNER_SCRIPT =
  "scripts/ops/run-execution-log-continuity-audit.ts" as const;

export const EXECUTION_LOG_VITEST_SPEC =
  "tests/unit/execution-log-continuity.test.ts" as const;

/** Header marker prepended once for FINAL-24 gate discovery. */
export const EXECUTION_LOG_HEADER_MARKER =
  "# Execution log continuity (FINAL-24) — 220-task cyclic executor" as const;

/** Required fields per modern cycle block (FINAL orchestrator era). */
export const EXECUTION_LOG_CYCLE_REQUIRED_FIELDS = [
  "Cycle:",
  "Task:",
  "Role:",
  "Priority:",
  "Result:",
  "Vault:",
] as const;

/** Minimum cycle number expected after FINAL-23 (honest continuity floor). */
export const EXECUTION_LOG_MIN_LAST_CYCLE = 213 as const;
