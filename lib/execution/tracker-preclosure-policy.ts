/**
 * FINAL-25 — Pre-closure tracker snapshot policy (task-219).
 */

export const TRACKER_PRECLOSURE_POLICY_ID = "final-25-tracker-219-v1" as const;

export const TRACKER_PRECLOSURE_SNAPSHOT_ARTIFACT =
  "artifacts/execution-tracker-preclosure-snapshot.json" as const;

export const TRACKER_PRECLOSURE_SUMMARY_ARTIFACT =
  "artifacts/execution-tracker-preclosure-summary.json" as const;

export const TRACKER_PRECLOSURE_SUMMARY_VERSION = "final-25-tracker-219-v1" as const;

export const TRACKER_PRECLOSURE_RUNNER_SCRIPT =
  "scripts/ops/run-tracker-preclosure-snapshot.ts" as const;

export const TRACKER_PRECLOSURE_VITEST_SPEC =
  "tests/unit/tracker-preclosure-snapshot.test.ts" as const;

export const TRACKER_ARTIFACT = "artifacts/execution-tracker-final.json" as const;

/** Expected open canonical slots immediately before FINAL-26 closure. */
export const TRACKER_PRECLOSURE_EXPECTED_REMAINING_SLOTS = [219, 220] as const;

export const CANONICAL_TASK_SLOT_COUNT = 220 as const;
