import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { EXPO_MODE_CAPABILITIES } from "@/lib/kitchen/expo-mode-p2-93-content";
import {
  EXPO_MODE_CAPABILITY_COUNT,
  EXPO_MODE_COMPONENT,
  EXPO_MODE_DOC,
  EXPO_MODE_HONESTY_MARKERS,
  EXPO_MODE_OPERATIONS_PATH,
  EXPO_MODE_PAGE,
  EXPO_MODE_POLICY_ID,
  EXPO_MODE_ROUTE,
  EXPO_MODE_SERVICE_PATH,
  EXPO_MODE_WIRING_PATHS,
} from "@/lib/kitchen/expo-mode-p2-93-policy";

export type ExpoModeAuditSummary = {
  policyId: typeof EXPO_MODE_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  kdsBumpLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditExpoMode(root = process.cwd()): ExpoModeAuditSummary {
  const wiringComplete = EXPO_MODE_WIRING_PATHS.every((rel) => existsSync(join(root, rel)));

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let kdsBumpLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, EXPO_MODE_DOC))) {
    const source = readFileSync(join(root, EXPO_MODE_DOC), "utf8");
    docWired =
      source.includes(EXPO_MODE_ROUTE) && source.includes(String(EXPO_MODE_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, EXPO_MODE_COMPONENT))) {
    const source = readFileSync(join(root, EXPO_MODE_COMPONENT), "utf8");
    componentWired =
      source.includes("ExpoModePanel") && source.includes("EXPO_MODE_CAPABILITIES");
    allTestIdsPresent =
      source.includes("EXPO_MODE_TEST_IDS[0]") &&
      source.includes("EXPO_MODE_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, EXPO_MODE_PAGE))) {
    const source = readFileSync(join(root, EXPO_MODE_PAGE), "utf8");
    pageWired = source.includes("ExpoModePanel") && source.includes("EXPO_MODE_POLICY_ID");
  }

  if (existsSync(join(root, EXPO_MODE_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, EXPO_MODE_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("computeExpoCompleteness") &&
      source.includes("buildExpoHandoffChecklist") &&
      source.includes("buildExpoModeReport");
  }

  if (existsSync(join(root, EXPO_MODE_SERVICE_PATH))) {
    const source = readFileSync(join(root, EXPO_MODE_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadExpoModeSnapshot") && source.includes("EXPO_MODE_POLICY_ID");
  }

  const kdsActionsPath = "actions/kitchen-daily-kds.ts";
  if (existsSync(join(root, kdsActionsPath))) {
    const source = readFileSync(join(root, kdsActionsPath), "utf8");
    kdsBumpLinked = source.includes("bumpDailyKdsOrderAction") && source.includes('"READY"');
  }

  const combinedSources = [
    EXPO_MODE_DOC,
    EXPO_MODE_COMPONENT,
    "lib/kitchen/expo-mode-p2-93-content.ts",
    EXPO_MODE_OPERATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = EXPO_MODE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect = EXPO_MODE_CAPABILITIES.length === EXPO_MODE_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    kdsBumpLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: EXPO_MODE_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    kdsBumpLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatExpoModeAuditLines(summary: ExpoModeAuditSummary): string[] {
  return [
    `Expo mode audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${EXPO_MODE_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${EXPO_MODE_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `KDS bump linked: ${summary.kdsBumpLinked ? "yes" : "no"}`,
    `Capabilities (${EXPO_MODE_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
