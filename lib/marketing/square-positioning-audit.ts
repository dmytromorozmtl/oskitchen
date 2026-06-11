import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SQUARE_POSITIONING_COMPARE_LANDING,
  SQUARE_POSITIONING_COMPARE_PATH,
  SQUARE_POSITIONING_COMPONENT_PATH,
  SQUARE_POSITIONING_DOC,
  SQUARE_POSITIONING_HONESTY_MARKERS,
  SQUARE_POSITIONING_POLICY_ID,
  SQUARE_POSITIONING_PRICING_PAGE,
  SQUARE_POSITIONING_PRIMARY_LINE,
  SQUARE_POSITIONING_SECTION_TEST_ID,
  SQUARE_POSITIONING_WIRING_PATHS,
} from "@/lib/marketing/square-positioning-policy";

export type SquarePositioningAuditSummary = {
  policyId: typeof SQUARE_POSITIONING_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  compareContentWired: boolean;
  sectionWired: boolean;
  compareLandingWired: boolean;
  pricingWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditSquarePositioning(root = process.cwd()): SquarePositioningAuditSummary {
  const wiringComplete = SQUARE_POSITIONING_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let compareContentWired = false;
  let sectionWired = false;
  let compareLandingWired = false;
  let pricingWired = false;

  if (existsSync(join(root, SQUARE_POSITIONING_DOC))) {
    const source = readFileSync(join(root, SQUARE_POSITIONING_DOC), "utf8");
    docWired =
      source.includes(SQUARE_POSITIONING_PRIMARY_LINE) &&
      source.includes(SQUARE_POSITIONING_COMPARE_PATH);
  }

  const compareContentPath = "lib/marketing/compare-content.ts";
  if (existsSync(join(root, compareContentPath))) {
    const source = readFileSync(join(root, compareContentPath), "utf8");
    compareContentWired = source.includes("SQUARE_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, SQUARE_POSITIONING_COMPONENT_PATH))) {
    const source = readFileSync(join(root, SQUARE_POSITIONING_COMPONENT_PATH), "utf8");
    sectionWired =
      source.includes("SquarePositioningSection") &&
      source.includes("SQUARE_POSITIONING_SECTION_TEST_ID") &&
      source.includes("SQUARE_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, SQUARE_POSITIONING_COMPARE_LANDING))) {
    const source = readFileSync(join(root, SQUARE_POSITIONING_COMPARE_LANDING), "utf8");
    compareLandingWired =
      source.includes("SquarePositioningSection") && source.includes("square");
  }

  if (existsSync(join(root, SQUARE_POSITIONING_PRICING_PAGE))) {
    const source = readFileSync(join(root, SQUARE_POSITIONING_PRICING_PAGE), "utf8");
    pricingWired =
      source.includes("SquarePositioningSection") &&
      source.includes(SQUARE_POSITIONING_SECTION_TEST_ID);
  }

  const combinedSources = [
    SQUARE_POSITIONING_DOC,
    SQUARE_POSITIONING_COMPONENT_PATH,
    "lib/marketing/square-positioning-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = SQUARE_POSITIONING_HONESTY_MARKERS.every((marker) =>
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
    policyId: SQUARE_POSITIONING_POLICY_ID,
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

export function formatSquarePositioningAuditLines(
  summary: SquarePositioningAuditSummary,
): string[] {
  return [
    `Square positioning audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${SQUARE_POSITIONING_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Compare content: ${summary.compareContentWired ? "yes" : "no"}`,
    `Section (${SQUARE_POSITIONING_SECTION_TEST_ID}): ${summary.sectionWired ? "yes" : "no"}`,
    `Compare landing wired: ${summary.compareLandingWired ? "yes" : "no"}`,
    `Pricing page wired: ${summary.pricingWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
