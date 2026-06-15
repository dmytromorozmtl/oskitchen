import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadPilotSuccessMetricsBaseline,
  validatePilotSuccessMetricsBaseline,
} from "@/lib/pm/pilot-success-metrics-p3-131-operations";
import {
  PILOT_SUCCESS_METRICS_ARTIFACT,
  PILOT_SUCCESS_METRICS_DOC,
  PILOT_SUCCESS_METRICS_HONESTY_MARKERS,
  PILOT_SUCCESS_METRICS_MILESTONES,
  PILOT_SUCCESS_METRICS_POLICY_ID,
  PILOT_SUCCESS_METRICS_RELATED_DOCS,
  PILOT_SUCCESS_METRICS_WIRING_PATHS,
} from "@/lib/pm/pilot-success-metrics-p3-131-policy";

export type PilotSuccessMetricsAuditSummary = {
  policyId: typeof PILOT_SUCCESS_METRICS_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  baselineValid: boolean;
  relatedDocsReferenced: boolean;
  milestonesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPilotSuccessMetrics(root = process.cwd()): PilotSuccessMetricsAuditSummary {
  const wiringComplete = PILOT_SUCCESS_METRICS_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let milestonesDocumented = false;

  if (existsSync(join(root, PILOT_SUCCESS_METRICS_DOC))) {
    const source = readFileSync(join(root, PILOT_SUCCESS_METRICS_DOC), "utf8");
    docWired =
      PILOT_SUCCESS_METRICS_MILESTONES.every(
        (milestone) =>
          source.includes(milestone.id) &&
          milestone.metrics.every((metric) => source.includes(metric.target)),
      ) &&
      source.includes("<2s") &&
      source.includes(">=8");
    relatedDocsReferenced = PILOT_SUCCESS_METRICS_RELATED_DOCS.every((doc) => source.includes(doc));
    milestonesDocumented = PILOT_SUCCESS_METRICS_MILESTONES.every((milestone) =>
      source.includes(milestone.label),
    );
  }

  let baselineValid = false;
  if (existsSync(join(root, PILOT_SUCCESS_METRICS_ARTIFACT))) {
    const baseline = loadPilotSuccessMetricsBaseline(root);
    baselineValid = validatePilotSuccessMetricsBaseline(baseline).valid;
  }

  const combinedSources = [PILOT_SUCCESS_METRICS_DOC, PILOT_SUCCESS_METRICS_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PILOT_SUCCESS_METRICS_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    baselineValid &&
    relatedDocsReferenced &&
    milestonesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: PILOT_SUCCESS_METRICS_POLICY_ID,
    wiringComplete,
    docWired,
    baselineValid,
    relatedDocsReferenced,
    milestonesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPilotSuccessMetricsAuditLines(
  summary: PilotSuccessMetricsAuditSummary,
): string[] {
  return [
    `Pilot success metrics audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${PILOT_SUCCESS_METRICS_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Baseline artifact: ${summary.baselineValid ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Milestones documented: ${summary.milestonesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
