import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES } from "@/lib/inventory/inventory-variance-report-p2-99-content";
import {
  INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT,
  INVENTORY_VARIANCE_REPORT_P2_99_COMPONENT,
  INVENTORY_VARIANCE_REPORT_P2_99_DOC,
  INVENTORY_VARIANCE_REPORT_P2_99_HONESTY_MARKERS,
  INVENTORY_VARIANCE_REPORT_P2_99_LEGACY_POLICY,
  INVENTORY_VARIANCE_REPORT_P2_99_OPERATIONS_PATH,
  INVENTORY_VARIANCE_REPORT_P2_99_PAGE,
  INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID,
  INVENTORY_VARIANCE_REPORT_P2_99_ROUTE,
  INVENTORY_VARIANCE_REPORT_P2_99_SERVICE_PATH,
  INVENTORY_VARIANCE_REPORT_P2_99_WIRING_PATHS,
} from "@/lib/inventory/inventory-variance-report-p2-99-policy";

export type InventoryVarianceReportP2_99AuditSummary = {
  policyId: typeof INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyCountServiceLinked: boolean;
  legacyManagerLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditInventoryVarianceReportP2_99(
  root = process.cwd(),
): InventoryVarianceReportP2_99AuditSummary {
  const wiringComplete = INVENTORY_VARIANCE_REPORT_P2_99_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyCountServiceLinked = false;
  let legacyManagerLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_DOC))) {
    const source = readFileSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_DOC), "utf8");
    docWired =
      source.includes(INVENTORY_VARIANCE_REPORT_P2_99_ROUTE) &&
      source.includes(String(INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_COMPONENT))) {
    const source = readFileSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_COMPONENT), "utf8");
    componentWired =
      source.includes("InventoryVarianceReportPanel") &&
      source.includes("INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES");
    allTestIdsPresent =
      source.includes("INVENTORY_VARIANCE_REPORT_P2_99_TEST_IDS[0]") &&
      source.includes("INVENTORY_VARIANCE_REPORT_P2_99_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_PAGE))) {
    const source = readFileSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_PAGE), "utf8");
    pageWired =
      source.includes("InventoryVarianceReportPanel") &&
      source.includes("INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID");
  }

  if (existsSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("computeExpectedVsActualRow") &&
      source.includes("buildTheftSpoilageRows") &&
      source.includes("buildWasteTrackingRows") &&
      source.includes("buildInventoryVarianceReport");
  }

  if (existsSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_SERVICE_PATH))) {
    const source = readFileSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadInventoryVarianceReportSnapshot") &&
      source.includes("INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID");
  }

  if (existsSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_LEGACY_POLICY))) {
    const source = readFileSync(join(root, INVENTORY_VARIANCE_REPORT_P2_99_LEGACY_POLICY), "utf8");
    legacyCountServiceLinked = source.includes("summarizeInventoryCountVariance");
  }

  const managerPath = "services/ai/inventory-manager.ts";
  if (existsSync(join(root, managerPath))) {
    const source = readFileSync(join(root, managerPath), "utf8");
    legacyManagerLinked = source.includes("loadInventoryManagerSnapshot");
  }

  const combinedSources = [
    INVENTORY_VARIANCE_REPORT_P2_99_DOC,
    "lib/inventory/inventory-variance-report-p2-99-content.ts",
    INVENTORY_VARIANCE_REPORT_P2_99_OPERATIONS_PATH,
    INVENTORY_VARIANCE_REPORT_P2_99_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = INVENTORY_VARIANCE_REPORT_P2_99_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES.length ===
    INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyCountServiceLinked &&
    legacyManagerLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyCountServiceLinked,
    legacyManagerLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatInventoryVarianceReportP2_99AuditLines(
  summary: InventoryVarianceReportP2_99AuditSummary,
): string[] {
  return [
    `Inventory variance report audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${INVENTORY_VARIANCE_REPORT_P2_99_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${INVENTORY_VARIANCE_REPORT_P2_99_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy count service linked: ${summary.legacyCountServiceLinked ? "yes" : "no"}`,
    `Legacy inventory manager linked: ${summary.legacyManagerLinked ? "yes" : "no"}`,
    `Capabilities (${INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
