import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadPilotSuccessMetricsBaseline,
  validatePilotSuccessMetricsBaseline,
} from "@/lib/pm/pilot-success-metrics-p3-131-operations";
import {
  NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_IDS,
  NINETY_DAY_SPRINT_BOARD_P3_140_TOTAL_WEEKS,
  NINETY_DAY_SPRINT_BOARD_P3_140_WEEK_IDS,
} from "@/lib/pm/ninety-day-sprint-board-p3-140-policy";

export type NinetyDaySprintWeekRecord = {
  id: string;
  weekNumber: number;
  sprintId: string;
  theme: string;
  status: string;
};

export type NinetyDaySprintRecord = {
  id: string;
  label: string;
  weekStart: number;
  weekEnd: number;
  durationWeeks: number;
  status: string;
};

export type NinetyDaySprintBoardPmRegistry = {
  version: string;
  policyId: typeof NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  totalWeeks: number;
  sprintDurationWeeks: number;
  sprintCount: number;
  activePilotCount: number;
  completedSprintCount: number;
  implementationRefs: Record<string, string>;
  sprints: NinetyDaySprintRecord[];
  weeks: NinetyDaySprintWeekRecord[];
};

export function loadNinetyDaySprintBoardPmRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/ninety-day-sprint-board-pm-registry.json",
): NinetyDaySprintBoardPmRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as NinetyDaySprintBoardPmRegistry;
}

export function validateNinetyDaySprintBoardPmRegistry(
  registry: NinetyDaySprintBoardPmRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  weeksComplete: boolean;
  sprintsComplete: boolean;
  zeroActivePilot: boolean;
} {
  const policyIdMatches = registry.policyId === NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID;

  const weeksComplete =
    registry.weeks.length === NINETY_DAY_SPRINT_BOARD_P3_140_TOTAL_WEEKS &&
    NINETY_DAY_SPRINT_BOARD_P3_140_WEEK_IDS.every((weekId, index) => {
      const week = registry.weeks[index];
      return week?.id === weekId && week.weekNumber === index + 1 && week.status === "planned";
    });

  const sprintsComplete =
    registry.sprintCount === NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT &&
    registry.sprintDurationWeeks === NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS &&
    registry.sprints.length === NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT &&
    NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_IDS.every((sprintId, index) => {
      const sprint = registry.sprints[index];
      const expectedWeekStart = index * NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS + 1;
      const expectedWeekEnd = expectedWeekStart + NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS - 1;
      return (
        sprint?.id === sprintId &&
        sprint.durationWeeks === NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS &&
        sprint.weekStart === expectedWeekStart &&
        sprint.weekEnd === expectedWeekEnd &&
        sprint.status === "planned"
      );
    });

  const zeroActivePilot =
    registry.activePilotCount === 0 && registry.completedSprintCount === 0;

  const valid = policyIdMatches && weeksComplete && sprintsComplete && zeroActivePilot;

  return {
    valid,
    policyIdMatches,
    weeksComplete,
    sprintsComplete,
    zeroActivePilot,
  };
}

export function checkNinetyDaySprintBoardLivePilotMetricsAudit(root = process.cwd()): boolean {
  const baseline = loadPilotSuccessMetricsBaseline(root);
  const validation = validatePilotSuccessMetricsBaseline(baseline);
  return validation.valid && validation.allNotCaptured;
}
