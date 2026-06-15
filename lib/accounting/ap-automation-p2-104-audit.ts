import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AP_AUTOMATION_P2_104_CAPABILITIES } from "@/lib/accounting/ap-automation-p2-104-content";
import {
  AP_AUTOMATION_P2_104_CAPABILITY_COUNT,
  AP_AUTOMATION_P2_104_COMPONENT,
  AP_AUTOMATION_P2_104_DOC,
  AP_AUTOMATION_P2_104_HONESTY_MARKERS,
  AP_AUTOMATION_P2_104_LEGACY_ACTIONS,
  AP_AUTOMATION_P2_104_LEGACY_AP_POLICY,
  AP_AUTOMATION_P2_104_LEGACY_SCANNER,
  AP_AUTOMATION_P2_104_OPERATIONS_PATH,
  AP_AUTOMATION_P2_104_PAGE,
  AP_AUTOMATION_P2_104_POLICY_ID,
  AP_AUTOMATION_P2_104_ROUTE,
  AP_AUTOMATION_P2_104_SERVICE_PATH,
  AP_AUTOMATION_P2_104_WIRING_PATHS,
} from "@/lib/accounting/ap-automation-p2-104-policy";

export type ApAutomationP2_104AuditSummary = {
  policyId: typeof AP_AUTOMATION_P2_104_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyApLinked: boolean;
  legacyActionsLinked: boolean;
  legacyScannerLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditApAutomationP2_104(root = process.cwd()): ApAutomationP2_104AuditSummary {
  const wiringComplete = AP_AUTOMATION_P2_104_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyApLinked = false;
  let legacyActionsLinked = false;
  let legacyScannerLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, AP_AUTOMATION_P2_104_DOC))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_DOC), "utf8");
    docWired =
      source.includes(AP_AUTOMATION_P2_104_ROUTE) &&
      source.includes(String(AP_AUTOMATION_P2_104_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, AP_AUTOMATION_P2_104_COMPONENT))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_COMPONENT), "utf8");
    componentWired =
      source.includes("ApAutomationPanel") &&
      source.includes("AP_AUTOMATION_P2_104_CAPABILITIES");
    allTestIdsPresent =
      source.includes("AP_AUTOMATION_P2_104_TEST_IDS[0]") &&
      source.includes("AP_AUTOMATION_P2_104_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, AP_AUTOMATION_P2_104_PAGE))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_PAGE), "utf8");
    pageWired =
      source.includes("ApAutomationPanel") &&
      source.includes("AP_AUTOMATION_P2_104_POLICY_ID");
  }

  if (existsSync(join(root, AP_AUTOMATION_P2_104_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildApWorkflowStageSummaries") &&
      source.includes("buildInvoiceIntakeQueue") &&
      source.includes("buildPoMatchQueue") &&
      source.includes("buildPaymentReleaseQueue") &&
      source.includes("buildApAutomationReport");
  }

  if (existsSync(join(root, AP_AUTOMATION_P2_104_SERVICE_PATH))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadApAutomationSnapshot") &&
      source.includes("AP_AUTOMATION_P2_104_POLICY_ID");
  }

  if (existsSync(join(root, AP_AUTOMATION_P2_104_LEGACY_AP_POLICY))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_LEGACY_AP_POLICY), "utf8");
    legacyApLinked =
      source.includes("matchInvoiceToPO") &&
      source.includes("approveInvoice") &&
      source.includes("markInvoicePaid");
  }

  if (existsSync(join(root, AP_AUTOMATION_P2_104_LEGACY_ACTIONS))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_LEGACY_ACTIONS), "utf8");
    legacyActionsLinked =
      source.includes("matchInvoiceAction") &&
      source.includes("approveInvoiceAction") &&
      source.includes("markPaidInvoiceAction");
  }

  if (existsSync(join(root, AP_AUTOMATION_P2_104_LEGACY_SCANNER))) {
    const source = readFileSync(join(root, AP_AUTOMATION_P2_104_LEGACY_SCANNER), "utf8");
    legacyScannerLinked =
      source.includes("scanInvoice") && source.includes("createSupplyFromInvoice");
  }

  const combinedSources = [
    AP_AUTOMATION_P2_104_DOC,
    "lib/accounting/ap-automation-p2-104-content.ts",
    AP_AUTOMATION_P2_104_OPERATIONS_PATH,
    AP_AUTOMATION_P2_104_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = AP_AUTOMATION_P2_104_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    AP_AUTOMATION_P2_104_CAPABILITIES.length === AP_AUTOMATION_P2_104_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyApLinked &&
    legacyActionsLinked &&
    legacyScannerLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: AP_AUTOMATION_P2_104_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyApLinked,
    legacyActionsLinked,
    legacyScannerLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatApAutomationP2_104AuditLines(
  summary: ApAutomationP2_104AuditSummary,
): string[] {
  return [
    `AP automation audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${AP_AUTOMATION_P2_104_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${AP_AUTOMATION_P2_104_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy AP service linked: ${summary.legacyApLinked ? "yes" : "no"}`,
    `Legacy AP actions linked: ${summary.legacyActionsLinked ? "yes" : "no"}`,
    `Legacy invoice scanner linked: ${summary.legacyScannerLinked ? "yes" : "no"}`,
    `Capabilities (${AP_AUTOMATION_P2_104_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
