import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { SALES_BY_STAFF_P2_112_CAPABILITIES } from "@/lib/analytics/sales-by-staff-p2-112-content";
import {
  SALES_BY_STAFF_P2_112_CAPABILITY_COUNT,
  SALES_BY_STAFF_P2_112_COMPONENT,
  SALES_BY_STAFF_P2_112_DOC,
  SALES_BY_STAFF_P2_112_HONESTY_MARKERS,
  SALES_BY_STAFF_P2_112_LEGACY_CHECKOUT,
  SALES_BY_STAFF_P2_112_LEGACY_CLOSEOUT,
  SALES_BY_STAFF_P2_112_LEGACY_SHIFT,
  SALES_BY_STAFF_P2_112_OPERATIONS_PATH,
  SALES_BY_STAFF_P2_112_PAGE,
  SALES_BY_STAFF_P2_112_POLICY_ID,
  SALES_BY_STAFF_P2_112_ROUTE,
  SALES_BY_STAFF_P2_112_SERVICE_PATH,
  SALES_BY_STAFF_P2_112_WIRING_PATHS,
} from "@/lib/analytics/sales-by-staff-p2-112-policy";

export type SalesByStaffP2_112AuditSummary = {
  policyId: typeof SALES_BY_STAFF_P2_112_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyCheckoutLinked: boolean;
  legacyShiftLinked: boolean;
  legacyCloseoutLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditSalesByStaffP2_112(root = process.cwd()): SalesByStaffP2_112AuditSummary {
  const wiringComplete = SALES_BY_STAFF_P2_112_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyCheckoutLinked = false;
  let legacyShiftLinked = false;
  let legacyCloseoutLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_DOC))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_DOC), "utf8");
    docWired =
      source.includes(SALES_BY_STAFF_P2_112_ROUTE) &&
      source.includes(String(SALES_BY_STAFF_P2_112_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_COMPONENT))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_COMPONENT), "utf8");
    componentWired =
      source.includes("SalesByStaffPanel") &&
      source.includes("SALES_BY_STAFF_P2_112_CAPABILITIES");
    allTestIdsPresent =
      source.includes("SALES_BY_STAFF_P2_112_TEST_IDS[0]") &&
      source.includes("SALES_BY_STAFF_P2_112_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_PAGE))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_PAGE), "utf8");
    pageWired =
      source.includes("SalesByStaffPanel") &&
      source.includes("SALES_BY_STAFF_P2_112_POLICY_ID");
  }

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("computeAvgCheck") &&
      source.includes("buildStaffSalesRows") &&
      source.includes("buildShiftAvgCheckRows") &&
      source.includes("buildSalesByStaffReport") &&
      source.includes("buildSalesByStaffDemoReport");
  }

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_SERVICE_PATH))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadSalesByStaffSnapshot") &&
      source.includes("SALES_BY_STAFF_P2_112_POLICY_ID");
  }

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_LEGACY_CHECKOUT))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_LEGACY_CHECKOUT), "utf8");
    legacyCheckoutLinked =
      source.includes("checkoutPosSale") && source.includes("staffMemberId");
  }

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_LEGACY_SHIFT))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_LEGACY_SHIFT), "utf8");
    legacyShiftLinked = source.includes("openPosShift") && source.includes("closePosShift");
  }

  if (existsSync(join(root, SALES_BY_STAFF_P2_112_LEGACY_CLOSEOUT))) {
    const source = readFileSync(join(root, SALES_BY_STAFF_P2_112_LEGACY_CLOSEOUT), "utf8");
    legacyCloseoutLinked = source.includes("computeShiftCloseout");
  }

  const combinedSources = [
    SALES_BY_STAFF_P2_112_DOC,
    "lib/analytics/sales-by-staff-p2-112-content.ts",
    SALES_BY_STAFF_P2_112_OPERATIONS_PATH,
    SALES_BY_STAFF_P2_112_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = SALES_BY_STAFF_P2_112_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    SALES_BY_STAFF_P2_112_CAPABILITIES.length === SALES_BY_STAFF_P2_112_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyCheckoutLinked &&
    legacyShiftLinked &&
    legacyCloseoutLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: SALES_BY_STAFF_P2_112_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyCheckoutLinked,
    legacyShiftLinked,
    legacyCloseoutLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatSalesByStaffP2_112AuditLines(
  summary: SalesByStaffP2_112AuditSummary,
): string[] {
  return [
    `Sales-by-staff audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${SALES_BY_STAFF_P2_112_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${SALES_BY_STAFF_P2_112_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy checkout linked: ${summary.legacyCheckoutLinked ? "yes" : "no"}`,
    `Legacy shift linked: ${summary.legacyShiftLinked ? "yes" : "no"}`,
    `Legacy closeout linked: ${summary.legacyCloseoutLinked ? "yes" : "no"}`,
    `Capabilities (${SALES_BY_STAFF_P2_112_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
