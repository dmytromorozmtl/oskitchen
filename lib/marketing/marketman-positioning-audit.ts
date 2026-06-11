import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETMAN_POSITIONING_COMPARE_LANDING,
  MARKETMAN_POSITIONING_COMPARE_PATH,
  MARKETMAN_POSITIONING_COMPONENT_PATH,
  MARKETMAN_POSITIONING_DOC,
  MARKETMAN_POSITIONING_HONESTY_MARKERS,
  MARKETMAN_POSITIONING_POLICY_ID,
  MARKETMAN_POSITIONING_PRICING_PAGE,
  MARKETMAN_POSITIONING_PRIMARY_LINE,
  MARKETMAN_POSITIONING_SECTION_TEST_ID,
  MARKETMAN_POSITIONING_WIRING_PATHS,
} from "@/lib/marketing/marketman-positioning-policy";

export type MarketmanPositioningAuditSummary = {
  policyId: typeof MARKETMAN_POSITIONING_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  compareContentWired: boolean;
  sectionWired: boolean;
  compareLandingWired: boolean;
  pricingWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMarketmanPositioning(
  root = process.cwd(),
): MarketmanPositioningAuditSummary {
  const wiringComplete = MARKETMAN_POSITIONING_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let compareContentWired = false;
  let sectionWired = false;
  let compareLandingWired = false;
  let pricingWired = false;

  if (existsSync(join(root, MARKETMAN_POSITIONING_DOC))) {
    const source = readFileSync(join(root, MARKETMAN_POSITIONING_DOC), "utf8");
    docWired =
      source.includes(MARKETMAN_POSITIONING_PRIMARY_LINE) &&
      source.includes(MARKETMAN_POSITIONING_COMPARE_PATH);
  }

  const compareContentPath = "lib/marketing/compare-content.ts";
  if (existsSync(join(root, compareContentPath))) {
    const source = readFileSync(join(root, compareContentPath), "utf8");
    compareContentWired = source.includes("MARKETMAN_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, MARKETMAN_POSITIONING_COMPONENT_PATH))) {
    const source = readFileSync(join(root, MARKETMAN_POSITIONING_COMPONENT_PATH), "utf8");
    sectionWired =
      source.includes("MarketmanPositioningSection") &&
      source.includes("MARKETMAN_POSITIONING_SECTION_TEST_ID") &&
      source.includes("MARKETMAN_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, MARKETMAN_POSITIONING_COMPARE_LANDING))) {
    const source = readFileSync(join(root, MARKETMAN_POSITIONING_COMPARE_LANDING), "utf8");
    compareLandingWired =
      source.includes("MarketmanPositioningSection") && source.includes("marketman");
  }

  if (existsSync(join(root, MARKETMAN_POSITIONING_PRICING_PAGE))) {
    const source = readFileSync(join(root, MARKETMAN_POSITIONING_PRICING_PAGE), "utf8");
    pricingWired =
      source.includes("MarketmanPositioningSection") &&
      source.includes(MARKETMAN_POSITIONING_SECTION_TEST_ID);
  }

  const combinedSources = [
    MARKETMAN_POSITIONING_DOC,
    MARKETMAN_POSITIONING_COMPONENT_PATH,
    "lib/marketing/marketman-positioning-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MARKETMAN_POSITIONING_HONESTY_MARKERS.every((marker) =>
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
    policyId: MARKETMAN_POSITIONING_POLICY_ID,
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

export function formatMarketmanPositioningAuditLines(
  summary: MarketmanPositioningAuditSummary,
): string[] {
  return [
    `MarketMan positioning audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MARKETMAN_POSITIONING_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Compare content: ${summary.compareContentWired ? "yes" : "no"}`,
    `Section (${MARKETMAN_POSITIONING_SECTION_TEST_ID}): ${summary.sectionWired ? "yes" : "no"}`,
    `Compare landing wired: ${summary.compareLandingWired ? "yes" : "no"}`,
    `Pricing page wired: ${summary.pricingWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
