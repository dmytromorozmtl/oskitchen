/**
 * Blueprint P3-140 — 90-day sprint board (W1–W12, 2-week sprints).
 *
 * @see docs/ninety-day-sprint-board-pm.md
 */

export const NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID =
  "ninety-day-sprint-board-p3-140-v1" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_DOC = "docs/ninety-day-sprint-board-pm.md" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_ARTIFACT =
  "artifacts/ninety-day-sprint-board-pm-registry.json" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_AUDIT_SCRIPT =
  "scripts/audit-ninety-day-sprint-board-p3-140.ts" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_NPM_SCRIPT =
  "audit:ninety-day-sprint-board-p3-140" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_UNIT_TEST =
  "tests/unit/ninety-day-sprint-board-p3-140.test.ts" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_TOTAL_WEEKS = 12 as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS = 2 as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT = 6 as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_WEEK_IDS = [
  "w1",
  "w2",
  "w3",
  "w4",
  "w5",
  "w6",
  "w7",
  "w8",
  "w9",
  "w10",
  "w11",
  "w12",
] as const;

export type NinetyDaySprintBoardWeekId =
  (typeof NINETY_DAY_SPRINT_BOARD_P3_140_WEEK_IDS)[number];

export const NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_IDS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
] as const;

export type NinetyDaySprintBoardSprintId =
  (typeof NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_IDS)[number];

export const NINETY_DAY_SPRINT_BOARD_P3_140_IMPLEMENTATION_REFS = {
  pilotSuccessMetrics: "pilot-success-metrics-p3-131-v1",
  pilotPackage: "pilot-package-p3-129-v1",
  weeklyGoNoGo: "weekly-go-no-go-p3-127-v1",
} as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_METRIC_WEEKS = [1, 4, 8] as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_LIVE_AUDIT_NPM =
  "audit:pilot-success-metrics-p3-131" as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_RELATED_DOCS = [
  "docs/pilot-success-metrics.md",
  "docs/pilot-package-v1.md",
  "docs/weekly-go-no-go-log.md",
  "docs/loi-pipeline.md",
  "docs/icp-targeting-pm.md",
  "lib/pm/pilot-success-metrics-p3-131-policy.ts",
] as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_HONESTY_MARKERS = [
  "0 signed LOIs",
  "planned",
  "baseline",
  "BETA",
  "2-week sprints",
] as const;

export const NINETY_DAY_SPRINT_BOARD_P3_140_WIRING_PATHS = [
  NINETY_DAY_SPRINT_BOARD_P3_140_DOC,
  "lib/pm/ninety-day-sprint-board-p3-140-policy.ts",
  "lib/pm/ninety-day-sprint-board-p3-140-operations.ts",
  "lib/pm/ninety-day-sprint-board-p3-140-audit.ts",
  NINETY_DAY_SPRINT_BOARD_P3_140_ARTIFACT,
  NINETY_DAY_SPRINT_BOARD_P3_140_UNIT_TEST,
] as const;
