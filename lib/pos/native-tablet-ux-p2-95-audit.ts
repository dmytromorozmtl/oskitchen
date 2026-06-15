import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { NATIVE_TABLET_UX_P2_95_CAPABILITIES } from "@/lib/pos/native-tablet-ux-p2-95-content";
import {
  NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT,
  NATIVE_TABLET_UX_P2_95_COMPONENT,
  NATIVE_TABLET_UX_P2_95_DOC,
  NATIVE_TABLET_UX_P2_95_HONESTY_MARKERS,
  NATIVE_TABLET_UX_P2_95_LEGACY_POLICY,
  NATIVE_TABLET_UX_P2_95_OPERATIONS_PATH,
  NATIVE_TABLET_UX_P2_95_PAGE,
  NATIVE_TABLET_UX_P2_95_POLICY_ID,
  NATIVE_TABLET_UX_P2_95_ROUTE,
  NATIVE_TABLET_UX_P2_95_SERVICE_PATH,
  NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE,
  NATIVE_TABLET_UX_P2_95_WIRING_PATHS,
} from "@/lib/pos/native-tablet-ux-p2-95-policy";
import { POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";

export type NativeTabletUxP2_95AuditSummary = {
  policyId: typeof NATIVE_TABLET_UX_P2_95_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  tabletLayoutLinked: boolean;
  touchTargetsLinked: boolean;
  legacyPolicyLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditNativeTabletUxP2_95(root = process.cwd()): NativeTabletUxP2_95AuditSummary {
  const wiringComplete = NATIVE_TABLET_UX_P2_95_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let tabletLayoutLinked = false;
  let touchTargetsLinked = false;
  let legacyPolicyLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, NATIVE_TABLET_UX_P2_95_DOC))) {
    const source = readFileSync(join(root, NATIVE_TABLET_UX_P2_95_DOC), "utf8");
    docWired =
      source.includes(NATIVE_TABLET_UX_P2_95_ROUTE) &&
      source.includes(String(NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, NATIVE_TABLET_UX_P2_95_COMPONENT))) {
    const source = readFileSync(join(root, NATIVE_TABLET_UX_P2_95_COMPONENT), "utf8");
    componentWired =
      source.includes("NativeTabletUxPanel") &&
      source.includes("NATIVE_TABLET_UX_P2_95_CAPABILITIES");
    allTestIdsPresent =
      source.includes("NATIVE_TABLET_UX_P2_95_TEST_IDS[0]") &&
      source.includes("NATIVE_TABLET_UX_P2_95_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, NATIVE_TABLET_UX_P2_95_PAGE))) {
    const source = readFileSync(join(root, NATIVE_TABLET_UX_P2_95_PAGE), "utf8");
    pageWired =
      source.includes("NativeTabletUxPanel") &&
      source.includes("NATIVE_TABLET_UX_P2_95_POLICY_ID");
  }

  if (existsSync(join(root, NATIVE_TABLET_UX_P2_95_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, NATIVE_TABLET_UX_P2_95_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("resolveNativeTabletLayoutSnapshot") &&
      source.includes("buildTableTabsPolishHints") &&
      source.includes("buildNativeTabletUxReport");
  }

  if (existsSync(join(root, NATIVE_TABLET_UX_P2_95_SERVICE_PATH))) {
    const source = readFileSync(join(root, NATIVE_TABLET_UX_P2_95_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadNativeTabletUxSnapshot") &&
      source.includes("NATIVE_TABLET_UX_P2_95_POLICY_ID");
  }

  const layoutPath = "lib/pos/pos-tablet-layout.ts";
  if (existsSync(join(root, layoutPath))) {
    const source = readFileSync(join(root, layoutPath), "utf8");
    tabletLayoutLinked =
      source.includes("posTabletShellClass") && source.includes("posIpadNativeShellClass");
  }

  const touchPath = "lib/pos/touch-targets.ts";
  if (existsSync(join(root, touchPath))) {
    const source = readFileSync(join(root, touchPath), "utf8");
    touchTargetsLinked = source.includes(String(POS_WCAG_FLOOR_PX));
  }

  if (existsSync(join(root, NATIVE_TABLET_UX_P2_95_LEGACY_POLICY))) {
    const source = readFileSync(join(root, NATIVE_TABLET_UX_P2_95_LEGACY_POLICY), "utf8");
    legacyPolicyLinked =
      source.includes(NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE) ||
      source.includes("ipad-native");
  }

  const combinedSources = [
    NATIVE_TABLET_UX_P2_95_DOC,
    NATIVE_TABLET_UX_P2_95_COMPONENT,
    "lib/pos/native-tablet-ux-p2-95-content.ts",
    NATIVE_TABLET_UX_P2_95_OPERATIONS_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = NATIVE_TABLET_UX_P2_95_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    NATIVE_TABLET_UX_P2_95_CAPABILITIES.length === NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    tabletLayoutLinked &&
    touchTargetsLinked &&
    legacyPolicyLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: NATIVE_TABLET_UX_P2_95_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    tabletLayoutLinked,
    touchTargetsLinked,
    legacyPolicyLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatNativeTabletUxP2_95AuditLines(
  summary: NativeTabletUxP2_95AuditSummary,
): string[] {
  return [
    `Native tablet UX audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${NATIVE_TABLET_UX_P2_95_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${NATIVE_TABLET_UX_P2_95_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Tablet layout linked: ${summary.tabletLayoutLinked ? "yes" : "no"}`,
    `Touch targets linked: ${summary.touchTargetsLinked ? "yes" : "no"}`,
    `Legacy policy linked: ${summary.legacyPolicyLinked ? "yes" : "no"}`,
    `Capabilities (${NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
