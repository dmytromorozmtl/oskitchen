import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { TABLE_SERVICE_DEPTH_CAPABILITIES } from "@/lib/pos/table-service-depth-content";
import {
  TABLE_SERVICE_DEPTH_CAPABILITY_COUNT,
  TABLE_SERVICE_DEPTH_COMPONENT,
  TABLE_SERVICE_DEPTH_DOC,
  TABLE_SERVICE_DEPTH_HONESTY_MARKERS,
  TABLE_SERVICE_DEPTH_OPERATIONS_PATH,
  TABLE_SERVICE_DEPTH_PAGE,
  TABLE_SERVICE_DEPTH_POLICY_ID,
  TABLE_SERVICE_DEPTH_ROUTE,
  TABLE_SERVICE_DEPTH_SERVICE_PATH,
  TABLE_SERVICE_DEPTH_WIRING_PATHS,
} from "@/lib/pos/table-service-depth-policy";

export type TableServiceDepthAuditSummary = {
  policyId: typeof TABLE_SERVICE_DEPTH_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  actionsWired: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  legacyDocLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditTableServiceDepth(root = process.cwd()): TableServiceDepthAuditSummary {
  const wiringComplete = TABLE_SERVICE_DEPTH_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let actionsWired = false;
  let allTestIdsPresent = false;
  let legacyDocLinked = false;

  if (existsSync(join(root, TABLE_SERVICE_DEPTH_DOC))) {
    const source = readFileSync(join(root, TABLE_SERVICE_DEPTH_DOC), "utf8");
    docWired =
      source.includes(TABLE_SERVICE_DEPTH_ROUTE) &&
      source.includes(String(TABLE_SERVICE_DEPTH_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, TABLE_SERVICE_DEPTH_COMPONENT))) {
    const source = readFileSync(join(root, TABLE_SERVICE_DEPTH_COMPONENT), "utf8");
    componentWired =
      source.includes("TableServiceDepthPanel") &&
      source.includes("TABLE_SERVICE_DEPTH_CAPABILITIES");
    allTestIdsPresent =
      source.includes("TABLE_SERVICE_DEPTH_TEST_IDS[0]") &&
      source.includes("TABLE_SERVICE_DEPTH_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, TABLE_SERVICE_DEPTH_PAGE))) {
    const source = readFileSync(join(root, TABLE_SERVICE_DEPTH_PAGE), "utf8");
    pageWired =
      source.includes("TableServiceDepthPanel") &&
      source.includes("TABLE_SERVICE_DEPTH_POLICY_ID");
  }

  if (existsSync(join(root, TABLE_SERVICE_DEPTH_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, TABLE_SERVICE_DEPTH_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("computeServerBankingSummary") &&
      source.includes("reconcileTips") &&
      source.includes("BAR_MODE_QUICK_ITEMS");
  }

  if (existsSync(join(root, TABLE_SERVICE_DEPTH_SERVICE_PATH))) {
    const source = readFileSync(join(root, TABLE_SERVICE_DEPTH_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("mergeTabs") &&
      source.includes("transferSeatOnTab") &&
      source.includes("mergeRestaurantTables");
  }

  const actionsPath = "actions/pos/table-service-depth.ts";
  if (existsSync(join(root, actionsPath))) {
    const source = readFileSync(join(root, actionsPath), "utf8");
    actionsWired =
      source.includes("mergeTabsAction") &&
      source.includes("transferSeatAction") &&
      source.includes("getTipsReconciliationAction");
  }

  const legacyPath = "docs/BILL_SPLITTING.md";
  if (existsSync(join(root, legacyPath))) {
    const source = readFileSync(join(root, legacyPath), "utf8");
    legacyDocLinked =
      source.includes("table-service-depth") || source.includes(TABLE_SERVICE_DEPTH_ROUTE);
  }

  const combinedSources = [
    TABLE_SERVICE_DEPTH_DOC,
    TABLE_SERVICE_DEPTH_COMPONENT,
    "lib/pos/table-service-depth-content.ts",
    TABLE_SERVICE_DEPTH_OPERATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = TABLE_SERVICE_DEPTH_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    TABLE_SERVICE_DEPTH_CAPABILITIES.length === TABLE_SERVICE_DEPTH_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    actionsWired &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    legacyDocLinked &&
    honestyMarkersPresent;

  return {
    policyId: TABLE_SERVICE_DEPTH_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    actionsWired,
    capabilityCountCorrect,
    allTestIdsPresent,
    legacyDocLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatTableServiceDepthAuditLines(
  summary: TableServiceDepthAuditSummary,
): string[] {
  return [
    `Table service depth audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${TABLE_SERVICE_DEPTH_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${TABLE_SERVICE_DEPTH_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Actions: ${summary.actionsWired ? "yes" : "no"}`,
    `Capabilities (${TABLE_SERVICE_DEPTH_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Legacy doc linked: ${summary.legacyDocLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
