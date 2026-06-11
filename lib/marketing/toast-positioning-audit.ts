import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  TOAST_POSITIONING_COMPARE_LANDING,
  TOAST_POSITIONING_COMPARE_PATH,
  TOAST_POSITIONING_COMPONENT_PATH,
  TOAST_POSITIONING_DOC,
  TOAST_POSITIONING_HONESTY_MARKERS,
  TOAST_POSITIONING_POLICY_ID,
  TOAST_POSITIONING_PRICING_PAGE,
  TOAST_POSITIONING_PRIMARY_LINE,
  TOAST_POSITIONING_SECTION_TEST_ID,
  TOAST_POSITIONING_WIRING_PATHS,
} from "@/lib/marketing/toast-positioning-policy";

export type ToastPositioningAuditSummary = {
  policyId: typeof TOAST_POSITIONING_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  compareContentWired: boolean;
  sectionWired: boolean;
  compareLandingWired: boolean;
  pricingWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditToastPositioning(root = process.cwd()): ToastPositioningAuditSummary {
  const wiringComplete = TOAST_POSITIONING_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let compareContentWired = false;
  let sectionWired = false;
  let compareLandingWired = false;
  let pricingWired = false;

  if (existsSync(join(root, TOAST_POSITIONING_DOC))) {
    const source = readFileSync(join(root, TOAST_POSITIONING_DOC), "utf8");
    docWired =
      source.includes(TOAST_POSITIONING_PRIMARY_LINE) &&
      source.includes(TOAST_POSITIONING_COMPARE_PATH);
  }

  const compareContentPath = "lib/marketing/compare-content.ts";
  if (existsSync(join(root, compareContentPath))) {
    const source = readFileSync(join(root, compareContentPath), "utf8");
    compareContentWired = source.includes("TOAST_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, TOAST_POSITIONING_COMPONENT_PATH))) {
    const source = readFileSync(join(root, TOAST_POSITIONING_COMPONENT_PATH), "utf8");
    sectionWired =
      source.includes("ToastPositioningSection") &&
      source.includes("TOAST_POSITIONING_SECTION_TEST_ID") &&
      source.includes("TOAST_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, TOAST_POSITIONING_COMPARE_LANDING))) {
    const source = readFileSync(join(root, TOAST_POSITIONING_COMPARE_LANDING), "utf8");
    compareLandingWired =
      source.includes("ToastPositioningSection") && source.includes("toast");
  }

  if (existsSync(join(root, TOAST_POSITIONING_PRICING_PAGE))) {
    const source = readFileSync(join(root, TOAST_POSITIONING_PRICING_PAGE), "utf8");
    pricingWired =
      source.includes("ToastPositioningSection") &&
      source.includes(TOAST_POSITIONING_SECTION_TEST_ID);
  }

  const combinedSources = [
    TOAST_POSITIONING_DOC,
    TOAST_POSITIONING_COMPONENT_PATH,
    "lib/marketing/toast-positioning-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = TOAST_POSITIONING_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    compareContentWired &&
    sectionWired &&
    compareLandingWired &&
    pricingWired &&
    honestyMarkersPresent;

  return {
    policyId: TOAST_POSITIONING_POLICY_ID,
    wiringComplete,
    docWired,
    compareContentWired,
    sectionWired,
    compareLandingWired,
    pricingWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatToastPositioningAuditLines(
  summary: ToastPositioningAuditSummary,
): string[] {
  return [
    `Toast positioning audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${TOAST_POSITIONING_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Compare content: ${summary.compareContentWired ? "yes" : "no"}`,
    `Section (${TOAST_POSITIONING_SECTION_TEST_ID}): ${summary.sectionWired ? "yes" : "no"}`,
    `Compare landing wired: ${summary.compareLandingWired ? "yes" : "no"}`,
    `Pricing page wired: ${summary.pricingWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
