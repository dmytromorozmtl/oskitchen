import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { BUMP_RECALL_AUDIT_DIMENSIONS } from "@/lib/kitchen/bump-recall-audit-p2-91-content";
import {
  BUMP_RECALL_AUDIT_COMPONENT,
  BUMP_RECALL_AUDIT_DIMENSION_COUNT,
  BUMP_RECALL_AUDIT_DOC,
  BUMP_RECALL_AUDIT_HONESTY_MARKERS,
  BUMP_RECALL_AUDIT_OPERATIONS_PATH,
  BUMP_RECALL_AUDIT_PAGE,
  BUMP_RECALL_AUDIT_POLICY_ID,
  BUMP_RECALL_AUDIT_ROUTE,
  BUMP_RECALL_AUDIT_SERVICE_PATH,
  BUMP_RECALL_AUDIT_WIRING_PATHS,
} from "@/lib/kitchen/bump-recall-audit-p2-91-policy";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

export type BumpRecallAuditAuditSummary = {
  policyId: typeof BUMP_RECALL_AUDIT_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  kdsActionsEnriched: boolean;
  auditActionsRegistered: boolean;
  dimensionCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditBumpRecallAudit(root = process.cwd()): BumpRecallAuditAuditSummary {
  const wiringComplete = BUMP_RECALL_AUDIT_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let kdsActionsEnriched = false;
  let auditActionsRegistered = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, BUMP_RECALL_AUDIT_DOC))) {
    const source = readFileSync(join(root, BUMP_RECALL_AUDIT_DOC), "utf8");
    docWired =
      source.includes(BUMP_RECALL_AUDIT_ROUTE) &&
      source.includes(String(BUMP_RECALL_AUDIT_DIMENSION_COUNT));
  }

  if (existsSync(join(root, BUMP_RECALL_AUDIT_COMPONENT))) {
    const source = readFileSync(join(root, BUMP_RECALL_AUDIT_COMPONENT), "utf8");
    componentWired =
      source.includes("BumpRecallAuditPanel") &&
      source.includes("BUMP_RECALL_AUDIT_DIMENSIONS");
    allTestIdsPresent =
      source.includes("BUMP_RECALL_AUDIT_TEST_IDS[0]") &&
      source.includes("BUMP_RECALL_AUDIT_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, BUMP_RECALL_AUDIT_PAGE))) {
    const source = readFileSync(join(root, BUMP_RECALL_AUDIT_PAGE), "utf8");
    pageWired =
      source.includes("BumpRecallAuditPanel") &&
      source.includes("BUMP_RECALL_AUDIT_POLICY_ID");
  }

  if (existsSync(join(root, BUMP_RECALL_AUDIT_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, BUMP_RECALL_AUDIT_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildBumpAuditMetadata") &&
      source.includes("buildRecallAuditMetadata") &&
      source.includes("aggregateBumpRecallReport");
  }

  if (existsSync(join(root, BUMP_RECALL_AUDIT_SERVICE_PATH))) {
    const source = readFileSync(join(root, BUMP_RECALL_AUDIT_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadBumpRecallAuditSnapshot") &&
      source.includes("BUMP_RECALL_AUDIT_POLICY_ID");
  }

  const kdsActionsPath = "actions/kitchen-daily-kds.ts";
  if (existsSync(join(root, kdsActionsPath))) {
    const source = readFileSync(join(root, kdsActionsPath), "utf8");
    kdsActionsEnriched =
      source.includes("buildBumpAuditMetadata") &&
      source.includes("buildRecallAuditMetadata") &&
      source.includes("inferStationFromOrderItems");
  }

  const auditActionsPath = "lib/audit/audit-actions.ts";
  if (existsSync(join(root, auditActionsPath))) {
    const source = readFileSync(join(root, auditActionsPath), "utf8");
    auditActionsRegistered =
      source.includes(AUDIT_ACTIONS.KITCHEN_ORDER_BUMPED) &&
      source.includes(AUDIT_ACTIONS.KITCHEN_ORDER_RECALLED);
  }

  const combinedSources = [
    BUMP_RECALL_AUDIT_DOC,
    BUMP_RECALL_AUDIT_COMPONENT,
    "lib/kitchen/bump-recall-audit-p2-91-content.ts",
    BUMP_RECALL_AUDIT_OPERATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = BUMP_RECALL_AUDIT_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const dimensionCountCorrect =
    BUMP_RECALL_AUDIT_DIMENSIONS.length === BUMP_RECALL_AUDIT_DIMENSION_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    kdsActionsEnriched &&
    auditActionsRegistered &&
    dimensionCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: BUMP_RECALL_AUDIT_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    kdsActionsEnriched,
    auditActionsRegistered,
    dimensionCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatBumpRecallAuditAuditLines(summary: BumpRecallAuditAuditSummary): string[] {
  return [
    `Bump/recall audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${BUMP_RECALL_AUDIT_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${BUMP_RECALL_AUDIT_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `KDS actions enriched: ${summary.kdsActionsEnriched ? "yes" : "no"}`,
    `Audit actions: ${summary.auditActionsRegistered ? "yes" : "no"}`,
    `Dimensions (${BUMP_RECALL_AUDIT_DIMENSION_COUNT}): ${summary.dimensionCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
