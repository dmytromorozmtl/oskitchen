import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MENU_ENGINEERING_P2_105_CAPABILITIES } from "@/lib/analytics/menu-engineering-p2-105-content";
import {
  MENU_ENGINEERING_P2_105_CAPABILITY_COUNT,
  MENU_ENGINEERING_P2_105_COMPONENT,
  MENU_ENGINEERING_P2_105_DOC,
  MENU_ENGINEERING_P2_105_HONESTY_MARKERS,
  MENU_ENGINEERING_P2_105_LEGACY_PAGE,
  MENU_ENGINEERING_P2_105_LEGACY_POLICY,
  MENU_ENGINEERING_P2_105_OPERATIONS_PATH,
  MENU_ENGINEERING_P2_105_PAGE,
  MENU_ENGINEERING_P2_105_POLICY_ID,
  MENU_ENGINEERING_P2_105_ROUTE,
  MENU_ENGINEERING_P2_105_SERVICE_PATH,
  MENU_ENGINEERING_P2_105_WIRING_PATHS,
} from "@/lib/analytics/menu-engineering-p2-105-policy";

export type MenuEngineeringP2_105AuditSummary = {
  policyId: typeof MENU_ENGINEERING_P2_105_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyServiceLinked: boolean;
  legacyPageLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMenuEngineeringP2_105(root = process.cwd()): MenuEngineeringP2_105AuditSummary {
  const wiringComplete = MENU_ENGINEERING_P2_105_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyServiceLinked = false;
  let legacyPageLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, MENU_ENGINEERING_P2_105_DOC))) {
    const source = readFileSync(join(root, MENU_ENGINEERING_P2_105_DOC), "utf8");
    docWired =
      source.includes(MENU_ENGINEERING_P2_105_ROUTE) &&
      source.includes(String(MENU_ENGINEERING_P2_105_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, MENU_ENGINEERING_P2_105_COMPONENT))) {
    const source = readFileSync(join(root, MENU_ENGINEERING_P2_105_COMPONENT), "utf8");
    componentWired =
      source.includes("MenuEngineeringPanel") &&
      source.includes("MENU_ENGINEERING_P2_105_CAPABILITIES");
    allTestIdsPresent =
      source.includes("MENU_ENGINEERING_P2_105_TEST_IDS[0]") &&
      source.includes("MENU_ENGINEERING_P2_105_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, MENU_ENGINEERING_P2_105_PAGE))) {
    const source = readFileSync(join(root, MENU_ENGINEERING_P2_105_PAGE), "utf8");
    pageWired =
      source.includes("MenuEngineeringPanel") &&
      source.includes("MENU_ENGINEERING_P2_105_POLICY_ID");
  }

  if (existsSync(join(root, MENU_ENGINEERING_P2_105_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, MENU_ENGINEERING_P2_105_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("classifyMenuEngineeringCategory") &&
      source.includes("buildQuadrantSummaries") &&
      source.includes("buildMenuEngineeringItems") &&
      source.includes("buildMenuEngineeringReport");
  }

  if (existsSync(join(root, MENU_ENGINEERING_P2_105_SERVICE_PATH))) {
    const source = readFileSync(join(root, MENU_ENGINEERING_P2_105_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadMenuEngineeringSnapshot") &&
      source.includes("MENU_ENGINEERING_P2_105_POLICY_ID");
  }

  if (existsSync(join(root, MENU_ENGINEERING_P2_105_LEGACY_POLICY))) {
    const source = readFileSync(join(root, MENU_ENGINEERING_P2_105_LEGACY_POLICY), "utf8");
    legacyServiceLinked =
      source.includes("getMenuEngineeringMatrix") &&
      source.includes("MenuEngineeringCategory");
  }

  if (existsSync(join(root, MENU_ENGINEERING_P2_105_LEGACY_PAGE))) {
    const source = readFileSync(join(root, MENU_ENGINEERING_P2_105_LEGACY_PAGE), "utf8");
    legacyPageLinked =
      source.includes("getMenuEngineeringMatrix") && source.includes("Menu engineering matrix");
  }

  const combinedSources = [
    MENU_ENGINEERING_P2_105_DOC,
    "lib/analytics/menu-engineering-p2-105-content.ts",
    MENU_ENGINEERING_P2_105_OPERATIONS_PATH,
    MENU_ENGINEERING_P2_105_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MENU_ENGINEERING_P2_105_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    MENU_ENGINEERING_P2_105_CAPABILITIES.length === MENU_ENGINEERING_P2_105_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyServiceLinked &&
    legacyPageLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: MENU_ENGINEERING_P2_105_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyServiceLinked,
    legacyPageLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatMenuEngineeringP2_105AuditLines(
  summary: MenuEngineeringP2_105AuditSummary,
): string[] {
  return [
    `Menu engineering audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MENU_ENGINEERING_P2_105_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${MENU_ENGINEERING_P2_105_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy menu engineering service linked: ${summary.legacyServiceLinked ? "yes" : "no"}`,
    `Legacy reports page linked: ${summary.legacyPageLinked ? "yes" : "no"}`,
    `Capabilities (${MENU_ENGINEERING_P2_105_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
