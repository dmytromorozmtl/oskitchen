import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS } from "@/lib/hardware/hardware-compatibility-center-content";
import {
  HARDWARE_COMPATIBILITY_CENTER_COMPONENT,
  HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_DOC,
  HARDWARE_COMPATIBILITY_CENTER_HEADLINE,
  HARDWARE_COMPATIBILITY_CENTER_HONESTY_MARKERS,
  HARDWARE_COMPATIBILITY_CENTER_PAGE,
  HARDWARE_COMPATIBILITY_CENTER_POLICY_ID,
  HARDWARE_COMPATIBILITY_CENTER_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_TAGLINE,
  HARDWARE_COMPATIBILITY_CENTER_TEST_IDS,
  HARDWARE_COMPATIBILITY_CENTER_WIRING_PATHS,
} from "@/lib/hardware/hardware-compatibility-center-policy";

export type HardwareCompatibilityCenterAuditSummary = {
  policyId: typeof HARDWARE_COMPATIBILITY_CENTER_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  diagnosticCountCorrect: boolean;
  allTestIdsPresent: boolean;
  guideLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditHardwareCompatibilityCenter(
  root = process.cwd(),
): HardwareCompatibilityCenterAuditSummary {
  const wiringComplete = HARDWARE_COMPATIBILITY_CENTER_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let allTestIdsPresent = false;
  let guideLinked = false;

  if (existsSync(join(root, HARDWARE_COMPATIBILITY_CENTER_DOC))) {
    const source = readFileSync(join(root, HARDWARE_COMPATIBILITY_CENTER_DOC), "utf8");
    docWired =
      source.includes(HARDWARE_COMPATIBILITY_CENTER_TAGLINE) &&
      source.includes(HARDWARE_COMPATIBILITY_CENTER_HEADLINE) &&
      source.includes(HARDWARE_COMPATIBILITY_CENTER_ROUTE) &&
      source.includes(String(HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT));
  }

  if (existsSync(join(root, HARDWARE_COMPATIBILITY_CENTER_COMPONENT))) {
    const source = readFileSync(join(root, HARDWARE_COMPATIBILITY_CENTER_COMPONENT), "utf8");
    componentWired =
      source.includes("HardwareCompatibilityCenter") &&
      source.includes("runNetworkDiagnostic") &&
      source.includes("runKdsConnectivityCheck") &&
      source.includes("buildPrinterTestHtml");
    allTestIdsPresent =
      source.includes("HARDWARE_COMPATIBILITY_CENTER_TEST_IDS[0]") &&
      source.includes("HARDWARE_COMPATIBILITY_CENTER_TEST_IDS[4]");
  }

  if (existsSync(join(root, HARDWARE_COMPATIBILITY_CENTER_PAGE))) {
    const source = readFileSync(join(root, HARDWARE_COMPATIBILITY_CENTER_PAGE), "utf8");
    pageWired =
      source.includes("HardwareCompatibilityCenter") &&
      (source.includes(HARDWARE_COMPATIBILITY_CENTER_ROUTE) ||
        source.includes("HARDWARE_COMPATIBILITY_CENTER_ROUTE"));
  }

  const guidePath = "docs/certified-hardware-guide.md";
  if (existsSync(join(root, guidePath))) {
    const source = readFileSync(join(root, guidePath), "utf8");
    guideLinked =
      source.includes(HARDWARE_COMPATIBILITY_CENTER_ROUTE) ||
      source.includes("hardware-compatibility-center");
  }

  const combinedSources = [
    HARDWARE_COMPATIBILITY_CENTER_DOC,
    HARDWARE_COMPATIBILITY_CENTER_COMPONENT,
    "lib/hardware/hardware-compatibility-center-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = HARDWARE_COMPATIBILITY_CENTER_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const diagnosticCountCorrect =
    HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS.length ===
    HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    diagnosticCountCorrect &&
    allTestIdsPresent &&
    guideLinked &&
    honestyMarkersPresent;

  return {
    policyId: HARDWARE_COMPATIBILITY_CENTER_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    diagnosticCountCorrect,
    allTestIdsPresent,
    guideLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatHardwareCompatibilityCenterAuditLines(
  summary: HardwareCompatibilityCenterAuditSummary,
): string[] {
  return [
    `Hardware compatibility center audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${HARDWARE_COMPATIBILITY_CENTER_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${HARDWARE_COMPATIBILITY_CENTER_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Diagnostics (${HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT}): ${summary.diagnosticCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Guide linked: ${summary.guideLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
