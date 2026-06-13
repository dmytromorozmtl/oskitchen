import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LIGHTSPEED_POSITIONING_COMPARE_LANDING,
  LIGHTSPEED_POSITIONING_COMPARE_PATH,
  LIGHTSPEED_POSITIONING_COMPONENT_PATH,
  LIGHTSPEED_POSITIONING_DOC,
  LIGHTSPEED_POSITIONING_HONESTY_MARKERS,
  LIGHTSPEED_POSITIONING_POLICY_ID,
  LIGHTSPEED_POSITIONING_PRICING_PAGE,
  LIGHTSPEED_POSITIONING_PRIMARY_LINE,
  LIGHTSPEED_POSITIONING_SECTION_TEST_ID,
  LIGHTSPEED_POSITIONING_WIRING_PATHS,
} from "@/lib/marketing/lightspeed-positioning-policy";

export type LightspeedPositioningAuditSummary = {
  policyId: typeof LIGHTSPEED_POSITIONING_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  compareContentWired: boolean;
  sectionWired: boolean;
  compareLandingWired: boolean;
  pricingWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditLightspeedPositioning(
  root = process.cwd(),
): LightspeedPositioningAuditSummary {
  const wiringComplete = LIGHTSPEED_POSITIONING_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let compareContentWired = false;
  let sectionWired = false;
  let compareLandingWired = false;
  let pricingWired = false;

  if (existsSync(join(root, LIGHTSPEED_POSITIONING_DOC))) {
    const source = readFileSync(join(root, LIGHTSPEED_POSITIONING_DOC), "utf8");
    docWired =
      source.includes(LIGHTSPEED_POSITIONING_PRIMARY_LINE) &&
      source.includes(LIGHTSPEED_POSITIONING_COMPARE_PATH);
  }

  const compareContentPath = "lib/marketing/compare-content.ts";
  if (existsSync(join(root, compareContentPath))) {
    const source = readFileSync(join(root, compareContentPath), "utf8");
    compareContentWired = source.includes("LIGHTSPEED_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, LIGHTSPEED_POSITIONING_COMPONENT_PATH))) {
    const source = readFileSync(join(root, LIGHTSPEED_POSITIONING_COMPONENT_PATH), "utf8");
    sectionWired =
      source.includes("LightspeedPositioningSection") &&
      source.includes("LIGHTSPEED_POSITIONING_SECTION_TEST_ID") &&
      source.includes("LIGHTSPEED_POSITIONING_PRIMARY_LINE");
  }

  if (existsSync(join(root, LIGHTSPEED_POSITIONING_COMPARE_LANDING))) {
    const source = readFileSync(join(root, LIGHTSPEED_POSITIONING_COMPARE_LANDING), "utf8");
    compareLandingWired =
      source.includes("LightspeedPositioningSection") &&
      source.includes("'lightspeed'");
  }

  if (existsSync(join(root, LIGHTSPEED_POSITIONING_PRICING_PAGE))) {
    const source = readFileSync(join(root, LIGHTSPEED_POSITIONING_PRICING_PAGE), "utf8");
    pricingWired =
      source.includes("LightspeedPositioningSection") &&
      source.includes(LIGHTSPEED_POSITIONING_SECTION_TEST_ID);
  }

  const combinedSources = [
    LIGHTSPEED_POSITIONING_DOC,
    LIGHTSPEED_POSITIONING_COMPONENT_PATH,
    "lib/marketing/lightspeed-positioning-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = LIGHTSPEED_POSITIONING_HONESTY_MARKERS.every((marker) =>
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
    policyId: LIGHTSPEED_POSITIONING_POLICY_ID,
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

export function formatLightspeedPositioningAuditLines(
  summary: LightspeedPositioningAuditSummary,
): string[] {
  return [
    `Lightspeed positioning audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${LIGHTSPEED_POSITIONING_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Compare content: ${summary.compareContentWired ? "yes" : "no"}`,
    `Section (${LIGHTSPEED_POSITIONING_SECTION_TEST_ID}): ${summary.sectionWired ? "yes" : "no"}`,
    `Compare landing wired: ${summary.compareLandingWired ? "yes" : "no"}`,
    `Pricing page wired: ${summary.pricingWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
