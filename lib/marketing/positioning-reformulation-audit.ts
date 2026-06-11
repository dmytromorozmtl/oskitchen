import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POSITIONING_REFORMULATION_COMPONENT_PATH,
  POSITIONING_REFORMULATION_CONTENT_PATH,
  POSITIONING_REFORMULATION_DOC,
  POSITIONING_REFORMULATION_HONESTY_MARKERS,
  POSITIONING_REFORMULATION_HOME_LANDING,
  POSITIONING_REFORMULATION_LEGACY_DOC,
  POSITIONING_REFORMULATION_POLICY_ID,
  POSITIONING_REFORMULATION_PRIMARY_LINE,
  POSITIONING_REFORMULATION_STRIP_TEST_ID,
  POSITIONING_REFORMULATION_WIRING_PATHS,
} from "@/lib/marketing/positioning-reformulation-policy";

export type PositioningReformulationAuditSummary = {
  policyId: typeof POSITIONING_REFORMULATION_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  legacyDocWired: boolean;
  contentWired: boolean;
  componentWired: boolean;
  homeLandingWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPositioningReformulation(
  root = process.cwd(),
): PositioningReformulationAuditSummary {
  const wiringComplete = POSITIONING_REFORMULATION_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let legacyDocWired = false;
  let contentWired = false;
  let componentWired = false;
  let homeLandingWired = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, POSITIONING_REFORMULATION_DOC))) {
    const source = readFileSync(join(root, POSITIONING_REFORMULATION_DOC), "utf8");
    docWired = source.includes(POSITIONING_REFORMULATION_PRIMARY_LINE);
  }

  if (existsSync(join(root, POSITIONING_REFORMULATION_LEGACY_DOC))) {
    const source = readFileSync(join(root, POSITIONING_REFORMULATION_LEGACY_DOC), "utf8");
    legacyDocWired = source.includes(POSITIONING_REFORMULATION_PRIMARY_LINE);
  }

  if (existsSync(join(root, POSITIONING_REFORMULATION_CONTENT_PATH))) {
    const source = readFileSync(join(root, POSITIONING_REFORMULATION_CONTENT_PATH), "utf8");
    contentWired = source.includes("POSITIONING_REFORMULATION_PRIMARY_LINE");
  }

  if (existsSync(join(root, POSITIONING_REFORMULATION_COMPONENT_PATH))) {
    const source = readFileSync(join(root, POSITIONING_REFORMULATION_COMPONENT_PATH), "utf8");
    componentWired =
      source.includes("PositioningReformulationStrip") &&
      source.includes("POSITIONING_REFORMULATION_STRIP_TEST_ID") &&
      source.includes("POSITIONING_REFORMULATION_PRIMARY_LINE");
  }

  if (existsSync(join(root, POSITIONING_REFORMULATION_HOME_LANDING))) {
    const source = readFileSync(join(root, POSITIONING_REFORMULATION_HOME_LANDING), "utf8");
    homeLandingWired =
      source.includes("PositioningReformulationStrip") &&
      source.includes(POSITIONING_REFORMULATION_STRIP_TEST_ID);
  }

  const combinedSources = [
    POSITIONING_REFORMULATION_DOC,
    POSITIONING_REFORMULATION_CONTENT_PATH,
    POSITIONING_REFORMULATION_COMPONENT_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  honestyMarkersPresent = POSITIONING_REFORMULATION_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    legacyDocWired &&
    contentWired &&
    componentWired &&
    homeLandingWired &&
    honestyMarkersPresent;

  return {
    policyId: POSITIONING_REFORMULATION_POLICY_ID,
    wiringComplete,
    docWired,
    legacyDocWired,
    contentWired,
    componentWired,
    homeLandingWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPositioningReformulationAuditLines(
  summary: PositioningReformulationAuditSummary,
): string[] {
  return [
    `Positioning reformulation audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${POSITIONING_REFORMULATION_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Legacy doc (${POSITIONING_REFORMULATION_LEGACY_DOC}): ${summary.legacyDocWired ? "yes" : "no"}`,
    `Content module: ${summary.contentWired ? "yes" : "no"}`,
    `Strip component (${POSITIONING_REFORMULATION_STRIP_TEST_ID}): ${summary.componentWired ? "yes" : "no"}`,
    `Home landing wired: ${summary.homeLandingWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
