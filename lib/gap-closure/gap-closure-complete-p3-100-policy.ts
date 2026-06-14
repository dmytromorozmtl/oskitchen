/**
 * P3-100 — Final gap closure: all 100 cyclic executor tasks complete.
 *
 * @see docs/gap-closure-complete.md
 */

export const GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID = "gap-closure-complete-p3-100-v1" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_DOC = "docs/gap-closure-complete.md" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT = "artifacts/gap-closure-complete.json" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_TRACKER = "artifacts/gap-closure-tracker.json" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_EXECUTION_LOG = "artifacts/execution-log.txt" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_AUDIT_MODULE =
  "lib/gap-closure/gap-closure-complete-p3-100-audit.ts" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_CHECK_NPM_SCRIPT = "check:gap-closure-complete-p3-100" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_UNIT_TEST =
  "tests/unit/gap-closure-complete-p3-100.test.ts" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_TASK_ID = "p3-100-final-gap-closure" as const;

export const GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS = 100 as const;

export const GAP_CLOSURE_COMPLETE_P3_100_WIRING_PATHS = [
  GAP_CLOSURE_COMPLETE_P3_100_DOC,
  GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT,
  GAP_CLOSURE_COMPLETE_P3_100_TRACKER,
  GAP_CLOSURE_COMPLETE_P3_100_EXECUTION_LOG,
  GAP_CLOSURE_COMPLETE_P3_100_AUDIT_MODULE,
  GAP_CLOSURE_COMPLETE_P3_100_UNIT_TEST,
  GAP_CLOSURE_COMPLETE_P3_100_CI_WORKFLOW,
] as const;

export const GAP_CLOSURE_COMPLETE_P3_100_PRIORITY_RANGES = {
  p0: { label: "P0 CRITICAL", from: 1, to: 15, count: 15 },
  p1: { label: "P1 THIS WEEK", from: 16, to: 40, count: 25 },
  p2: { label: "P2 THIS MONTH", from: 41, to: 75, count: 35 },
  p3: { label: "P3 FUTURE", from: 76, to: 100, count: 25 },
} as const;
