import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PACKING_VERIFICATION_P2_94_CAPABILITIES } from "@/lib/kitchen/packing-verification-p2-94-content";
import {
  PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT,
  PACKING_VERIFICATION_P2_94_COMPONENT,
  PACKING_VERIFICATION_P2_94_DOC,
  PACKING_VERIFICATION_P2_94_HONESTY_MARKERS,
  PACKING_VERIFICATION_P2_94_LEGACY_DOC,
  PACKING_VERIFICATION_P2_94_OPERATIONS_PATH,
  PACKING_VERIFICATION_P2_94_PAGE,
  PACKING_VERIFICATION_P2_94_POLICY_ID,
  PACKING_VERIFICATION_P2_94_ROUTE,
  PACKING_VERIFICATION_P2_94_SCANNER_ROUTE,
  PACKING_VERIFICATION_P2_94_SERVICE_PATH,
  PACKING_VERIFICATION_P2_94_WIRING_PATHS,
} from "@/lib/kitchen/packing-verification-p2-94-policy";

export type PackingVerificationP2_94AuditSummary = {
  policyId: typeof PACKING_VERIFICATION_P2_94_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  packingVerifyLinked: boolean;
  legacyDocLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPackingVerificationP2_94(
  root = process.cwd(),
): PackingVerificationP2_94AuditSummary {
  const wiringComplete = PACKING_VERIFICATION_P2_94_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let packingVerifyLinked = false;
  let legacyDocLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, PACKING_VERIFICATION_P2_94_DOC))) {
    const source = readFileSync(join(root, PACKING_VERIFICATION_P2_94_DOC), "utf8");
    docWired =
      source.includes(PACKING_VERIFICATION_P2_94_ROUTE) &&
      source.includes(String(PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, PACKING_VERIFICATION_P2_94_COMPONENT))) {
    const source = readFileSync(join(root, PACKING_VERIFICATION_P2_94_COMPONENT), "utf8");
    componentWired =
      source.includes("PackingVerificationPanel") &&
      source.includes("PACKING_VERIFICATION_P2_94_CAPABILITIES");
    allTestIdsPresent =
      source.includes("PACKING_VERIFICATION_P2_94_TEST_IDS[0]") &&
      source.includes("PACKING_VERIFICATION_P2_94_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, PACKING_VERIFICATION_P2_94_PAGE))) {
    const source = readFileSync(join(root, PACKING_VERIFICATION_P2_94_PAGE), "utf8");
    pageWired =
      source.includes("PackingVerificationPanel") &&
      source.includes("PACKING_VERIFICATION_P2_94_POLICY_ID");
  }

  if (existsSync(join(root, PACKING_VERIFICATION_P2_94_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, PACKING_VERIFICATION_P2_94_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("validatePackingScanToken") &&
      source.includes("buildDeliveryBagChecklist") &&
      source.includes("buildPackingVerificationReport");
  }

  if (existsSync(join(root, PACKING_VERIFICATION_P2_94_SERVICE_PATH))) {
    const source = readFileSync(join(root, PACKING_VERIFICATION_P2_94_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadPackingVerificationSnapshot") &&
      source.includes("PACKING_VERIFICATION_P2_94_POLICY_ID");
  }

  const packingVerifyPath = "actions/packing-verify.ts";
  if (existsSync(join(root, packingVerifyPath))) {
    const source = readFileSync(join(root, packingVerifyPath), "utf8");
    packingVerifyLinked = source.includes("lookupOrderByPackTokenAction");
  }

  if (existsSync(join(root, PACKING_VERIFICATION_P2_94_LEGACY_DOC))) {
    const source = readFileSync(join(root, PACKING_VERIFICATION_P2_94_LEGACY_DOC), "utf8");
    legacyDocLinked =
      source.includes("packing") || source.includes(PACKING_VERIFICATION_P2_94_SCANNER_ROUTE);
  }

  const combinedSources = [
    PACKING_VERIFICATION_P2_94_DOC,
    PACKING_VERIFICATION_P2_94_COMPONENT,
    "lib/kitchen/packing-verification-p2-94-content.ts",
    PACKING_VERIFICATION_P2_94_OPERATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PACKING_VERIFICATION_P2_94_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    PACKING_VERIFICATION_P2_94_CAPABILITIES.length === PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    packingVerifyLinked &&
    legacyDocLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: PACKING_VERIFICATION_P2_94_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    packingVerifyLinked,
    legacyDocLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPackingVerificationP2_94AuditLines(
  summary: PackingVerificationP2_94AuditSummary,
): string[] {
  return [
    `Packing verification audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${PACKING_VERIFICATION_P2_94_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${PACKING_VERIFICATION_P2_94_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Packing verify linked: ${summary.packingVerifyLinked ? "yes" : "no"}`,
    `Legacy doc linked: ${summary.legacyDocLinked ? "yes" : "no"}`,
    `Capabilities (${PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
