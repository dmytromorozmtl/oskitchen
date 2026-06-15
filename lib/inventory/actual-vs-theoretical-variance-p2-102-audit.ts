import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES } from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-content";
import {
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_COMPONENT,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_HONESTY_MARKERS,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_ALERT_POLICY,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_AVT_POLICY,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATIONS_PATH,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_PAGE,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SERVICE_PATH,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_WIRING_PATHS,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-policy";

export type ActualVsTheoreticalVarianceP2_102AuditSummary = {
  policyId: typeof ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyAvtLinked: boolean;
  legacyAlertLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditActualVsTheoreticalVarianceP2_102(
  root = process.cwd(),
): ActualVsTheoreticalVarianceP2_102AuditSummary {
  const wiringComplete = ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyAvtLinked = false;
  let legacyAlertLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC))) {
    const source = readFileSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC), "utf8");
    docWired =
      source.includes(ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE) &&
      source.includes(String(ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_COMPONENT))) {
    const source = readFileSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_COMPONENT), "utf8");
    componentWired =
      source.includes("ActualVsTheoreticalVariancePanel") &&
      source.includes("ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES");
    allTestIdsPresent =
      source.includes("ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_TEST_IDS[0]") &&
      source.includes("ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_PAGE))) {
    const source = readFileSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_PAGE), "utf8");
    pageWired =
      source.includes("ActualVsTheoreticalVariancePanel") &&
      source.includes("ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID");
  }

  if (existsSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATIONS_PATH))) {
    const source = readFileSync(
      join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATIONS_PATH),
      "utf8",
    );
    operationsWired =
      source.includes("buildAvtVarianceTile") &&
      source.includes("buildTheoreticalBaselineRows") &&
      source.includes("buildActualDepletionRows") &&
      source.includes("buildActualVsTheoreticalVarianceReport");
  }

  if (existsSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SERVICE_PATH))) {
    const source = readFileSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadActualVsTheoreticalVarianceSnapshot") &&
      source.includes("ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID");
  }

  if (existsSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_AVT_POLICY))) {
    const source = readFileSync(
      join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_AVT_POLICY),
      "utf8",
    );
    legacyAvtLinked =
      source.includes("summarizeActualVsTheoretical") &&
      source.includes("ActualVsTheoreticalSummary");
  }

  if (existsSync(join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_ALERT_POLICY))) {
    const source = readFileSync(
      join(root, ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_LEGACY_ALERT_POLICY),
      "utf8",
    );
    legacyAlertLinked =
      source.includes("checkCostingVariances") &&
      source.includes("summarizeCostingVarianceAlerts");
  }

  const combinedSources = [
    ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC,
    "lib/inventory/actual-vs-theoretical-variance-p2-102-content.ts",
    ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATIONS_PATH,
    ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_HONESTY_MARKERS.every(
    (marker) => combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES.length ===
    ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyAvtLinked &&
    legacyAlertLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyAvtLinked,
    legacyAlertLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatActualVsTheoreticalVarianceP2_102AuditLines(
  summary: ActualVsTheoreticalVarianceP2_102AuditSummary,
): string[] {
  return [
    `Actual vs theoretical variance audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy AVT service linked: ${summary.legacyAvtLinked ? "yes" : "no"}`,
    `Legacy alert service linked: ${summary.legacyAlertLinked ? "yes" : "no"}`,
    `Capabilities (${ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
