import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadWeeklyGoNoGoLog,
  validateWeeklyGoNoGoLog,
} from "@/lib/pm/weekly-go-no-go-p3-127-operations";
import {
  WEEKLY_GO_NO_GO_DECISIONS,
  WEEKLY_GO_NO_GO_DOC,
  WEEKLY_GO_NO_GO_GATES,
  WEEKLY_GO_NO_GO_HONESTY_MARKERS,
  WEEKLY_GO_NO_GO_LOG_ARTIFACT,
  WEEKLY_GO_NO_GO_POLICY_ID,
  WEEKLY_GO_NO_GO_RELATED_PATHS,
  WEEKLY_GO_NO_GO_WIRING_PATHS,
} from "@/lib/pm/weekly-go-no-go-p3-127-policy";

export type WeeklyGoNoGoAuditSummary = {
  policyId: typeof WEEKLY_GO_NO_GO_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  logValid: boolean;
  relatedPathsReferenced: boolean;
  gatesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditWeeklyGoNoGo(root = process.cwd()): WeeklyGoNoGoAuditSummary {
  const wiringComplete = WEEKLY_GO_NO_GO_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedPathsReferenced = false;
  let gatesDocumented = false;

  if (existsSync(join(root, WEEKLY_GO_NO_GO_DOC))) {
    const source = readFileSync(join(root, WEEKLY_GO_NO_GO_DOC), "utf8");
    docWired =
      WEEKLY_GO_NO_GO_GATES.every((gate) => source.includes(gate.id)) &&
      WEEKLY_GO_NO_GO_DECISIONS.every((decision) => source.includes(decision));
    relatedPathsReferenced = WEEKLY_GO_NO_GO_RELATED_PATHS.every((path) =>
      source.includes(path),
    );
    gatesDocumented = WEEKLY_GO_NO_GO_GATES.every((gate) => source.includes(gate.label));
  }

  let logValid = false;
  if (existsSync(join(root, WEEKLY_GO_NO_GO_LOG_ARTIFACT))) {
    const log = loadWeeklyGoNoGoLog(root);
    logValid = validateWeeklyGoNoGoLog(log).valid;
  }

  const combinedSources = [WEEKLY_GO_NO_GO_DOC, WEEKLY_GO_NO_GO_LOG_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = WEEKLY_GO_NO_GO_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    logValid &&
    relatedPathsReferenced &&
    gatesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: WEEKLY_GO_NO_GO_POLICY_ID,
    wiringComplete,
    docWired,
    logValid,
    relatedPathsReferenced,
    gatesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatWeeklyGoNoGoAuditLines(summary: WeeklyGoNoGoAuditSummary): string[] {
  return [
    `Weekly GO/NO-GO log audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${WEEKLY_GO_NO_GO_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Log artifact: ${summary.logValid ? "yes" : "no"}`,
    `Related paths referenced: ${summary.relatedPathsReferenced ? "yes" : "no"}`,
    `Gates documented: ${summary.gatesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
