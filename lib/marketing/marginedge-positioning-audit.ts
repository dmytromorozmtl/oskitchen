import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARGINEDGE_POSITIONING_COMPARE_LANDING,
  MARGINEDGE_POSITIONING_COMPARE_PATH,
  MARGINEDGE_POSITIONING_COMPONENT_PATH,
  MARGINEDGE_POSITIONING_DOC,
  MARGINEDGE_POSITIONING_HONESTY_MARKERS,
  MARGINEDGE_POSITIONING_POLICY_ID,
  MARGINEDGE_POSITIONING_PRICING_PAGE,
  MARGINEDGE_POSITIONING_PRIMARY_LINE,
  MARGINEDGE_POSITIONING_SECTION_TEST_ID,
  MARGINEDGE_POSITIONING_WIRING_PATHS,
} from "@/lib/marketing/marginedge-positioning-policy";

export type MarginedgePositioningAuditSummary = {
  policyId: typeof MARGINEDGE_POSITIONING_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  compareContentWired: boolean;
  sectionWired: boolean;
  compareLandingWired: boolean;
  pricingWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMarginedgePositioning(
  root = process.cwd(),
): MarginedgePositioningAuditSummary {
  const wiringComplete = MARGINEDGE_POSITIONING_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let compareContentWired = false;
  let sectionWired = false;
  let compareLandingWired = false;
  let pricingWired = false;

  if (existsSync(join(root, MARGINEDGE_POSITIONING_DOC))) {
    const source = readFileSync(join(root, MARGINEDGE_POSITIONING_DOC), "utf8");
    docWired =
      source.includes(MARGINEDGE_POSITIONING_PRIMARY_LINE) &&
      source.includes(MARGINEDGE_POSITIONING_COMPARE_PATH);
  }

  const compareContentPath = "lib/marketing/compare-content.ts";
  if (existsSync(join(root, compareContentPath))) {
    const source = readFileSync(join(root, compareContentPath), "utf8");
    compareContentWired = source.includes("MARGINEDGE_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, MARGINEDGE_POSITIONING_COMPONENT_PATH))) {
    const source = readFileSync(join(root, MARGINEDGE_POSITIONING_COMPONENT_PATH), "utf8");
    sectionWired =
      source.includes("MarginedgePositioningSection") &&
      source.includes("MARGINEDGE_POSITIONING_SECTION_TEST_ID") &&
      source.includes("MARGINEDGE_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, MARGINEDGE_POSITIONING_COMPARE_LANDING))) {
    const source = readFileSync(join(root, MARGINEDGE_POSITIONING_COMPARE_LANDING), "utf8");
    compareLandingWired =
      source.includes("MarginedgePositioningSection") && source.includes("marginedge");
  }

  if (existsSync(join(root, MARGINEDGE_POSITIONING_PRICING_PAGE))) {
    const source = readFileSync(join(root, MARGINEDGE_POSITIONING_PRICING_PAGE), "utf8");
    pricingWired =
      source.includes("MarginedgePositioningSection") &&
      source.includes(MARGINEDGE_POSITIONING_SECTION_TEST_ID);
  }

  const combinedSources = [
    MARGINEDGE_POSITIONING_DOC,
    MARGINEDGE_POSITIONING_COMPONENT_PATH,
    "lib/marketing/marginedge-positioning-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MARGINEDGE_POSITIONING_HONESTY_MARKERS.every((marker) =>
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
    policyId: MARGINEDGE_POSITIONING_POLICY_ID,
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

export function formatMarginedgePositioningAuditLines(
  summary: MarginedgePositioningAuditSummary,
): string[] {
  return [
    `MarginEdge positioning audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MARGINEDGE_POSITIONING_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Compare content: ${summary.compareContentWired ? "yes" : "no"}`,
    `Section (${MARGINEDGE_POSITIONING_SECTION_TEST_ID}): ${summary.sectionWired ? "yes" : "no"}`,
    `Compare landing wired: ${summary.compareLandingWired ? "yes" : "no"}`,
    `Pricing page wired: ${summary.pricingWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
