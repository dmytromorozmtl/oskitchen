import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkNinetyDaySprintBoardLivePilotMetricsAudit,
  loadNinetyDaySprintBoardPmRegistry,
  validateNinetyDaySprintBoardPmRegistry,
} from "@/lib/pm/ninety-day-sprint-board-p3-140-operations";
import {
  NINETY_DAY_SPRINT_BOARD_P3_140_ARTIFACT,
  NINETY_DAY_SPRINT_BOARD_P3_140_DOC,
  NINETY_DAY_SPRINT_BOARD_P3_140_HONESTY_MARKERS,
  NINETY_DAY_SPRINT_BOARD_P3_140_IMPLEMENTATION_REFS,
  NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID,
  NINETY_DAY_SPRINT_BOARD_P3_140_RELATED_DOCS,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_IDS,
  NINETY_DAY_SPRINT_BOARD_P3_140_TOTAL_WEEKS,
  NINETY_DAY_SPRINT_BOARD_P3_140_WEEK_IDS,
  NINETY_DAY_SPRINT_BOARD_P3_140_WIRING_PATHS,
} from "@/lib/pm/ninety-day-sprint-board-p3-140-policy";

export type NinetyDaySprintBoardP3_140AuditSummary = {
  policyId: typeof NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  livePilotMetricsPassed: boolean;
  relatedDocsReferenced: boolean;
  weeksDocumented: boolean;
  sprintsDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditNinetyDaySprintBoardP3_140(
  root = process.cwd(),
): NinetyDaySprintBoardP3_140AuditSummary {
  const wiringComplete = NINETY_DAY_SPRINT_BOARD_P3_140_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let weeksDocumented = false;
  let sprintsDocumented = false;

  if (existsSync(join(root, NINETY_DAY_SPRINT_BOARD_P3_140_DOC))) {
    const source = readFileSync(join(root, NINETY_DAY_SPRINT_BOARD_P3_140_DOC), "utf8");
    docWired =
      source.includes(`W1–W${NINETY_DAY_SPRINT_BOARD_P3_140_TOTAL_WEEKS}`) &&
      source.includes(`${NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT} × ${NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS}-week sprints`) &&
      source.includes(NINETY_DAY_SPRINT_BOARD_P3_140_IMPLEMENTATION_REFS.pilotSuccessMetrics) &&
      source.includes(NINETY_DAY_SPRINT_BOARD_P3_140_IMPLEMENTATION_REFS.weeklyGoNoGo);
    relatedDocsReferenced = NINETY_DAY_SPRINT_BOARD_P3_140_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    weeksDocumented = NINETY_DAY_SPRINT_BOARD_P3_140_WEEK_IDS.every((weekId) =>
      source.includes(weekId),
    );
    sprintsDocumented = NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_IDS.every((sprintId) =>
      source.includes(sprintId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, NINETY_DAY_SPRINT_BOARD_P3_140_ARTIFACT))) {
    const registry = loadNinetyDaySprintBoardPmRegistry(root);
    registryValid = validateNinetyDaySprintBoardPmRegistry(registry).valid;
  }

  const livePilotMetricsPassed = checkNinetyDaySprintBoardLivePilotMetricsAudit(root);

  const combinedSources = [
    NINETY_DAY_SPRINT_BOARD_P3_140_DOC,
    NINETY_DAY_SPRINT_BOARD_P3_140_ARTIFACT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = NINETY_DAY_SPRINT_BOARD_P3_140_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    livePilotMetricsPassed &&
    relatedDocsReferenced &&
    weeksDocumented &&
    sprintsDocumented &&
    honestyMarkersPresent;

  return {
    policyId: NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    livePilotMetricsPassed,
    relatedDocsReferenced,
    weeksDocumented,
    sprintsDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatNinetyDaySprintBoardP3_140AuditLines(
  summary: NinetyDaySprintBoardP3_140AuditSummary,
): string[] {
  return [
    `90-day sprint board PM audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${NINETY_DAY_SPRINT_BOARD_P3_140_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live pilot metrics audit: ${summary.livePilotMetricsPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `W1–W12 documented: ${summary.weeksDocumented ? "yes" : "no"}`,
    `6 sprints documented: ${summary.sprintsDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
