import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { ALLERGEN_TRACKING_P2_101_CAPABILITIES } from "@/lib/inventory/allergen-tracking-p2-101-content";
import {
  ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT,
  ALLERGEN_TRACKING_P2_101_COMPONENT,
  ALLERGEN_TRACKING_P2_101_DOC,
  ALLERGEN_TRACKING_P2_101_HONESTY_MARKERS,
  ALLERGEN_TRACKING_P2_101_LEGACY_POLICY,
  ALLERGEN_TRACKING_P2_101_OPERATIONS_PATH,
  ALLERGEN_TRACKING_P2_101_PAGE,
  ALLERGEN_TRACKING_P2_101_POLICY_ID,
  ALLERGEN_TRACKING_P2_101_ROUTE,
  ALLERGEN_TRACKING_P2_101_SERVICE_PATH,
  ALLERGEN_TRACKING_P2_101_WIRING_PATHS,
} from "@/lib/inventory/allergen-tracking-p2-101-policy";

export type AllergenTrackingP2_101AuditSummary = {
  policyId: typeof ALLERGEN_TRACKING_P2_101_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyRegistryLinked: boolean;
  legacyServiceLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAllergenTrackingP2_101(root = process.cwd()): AllergenTrackingP2_101AuditSummary {
  const wiringComplete = ALLERGEN_TRACKING_P2_101_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyRegistryLinked = false;
  let legacyServiceLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, ALLERGEN_TRACKING_P2_101_DOC))) {
    const source = readFileSync(join(root, ALLERGEN_TRACKING_P2_101_DOC), "utf8");
    docWired =
      source.includes(ALLERGEN_TRACKING_P2_101_ROUTE) &&
      source.includes(String(ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, ALLERGEN_TRACKING_P2_101_COMPONENT))) {
    const source = readFileSync(join(root, ALLERGEN_TRACKING_P2_101_COMPONENT), "utf8");
    componentWired =
      source.includes("AllergenTrackingPanel") &&
      source.includes("ALLERGEN_TRACKING_P2_101_CAPABILITIES");
    allTestIdsPresent =
      source.includes("ALLERGEN_TRACKING_P2_101_TEST_IDS[0]") &&
      source.includes("ALLERGEN_TRACKING_P2_101_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, ALLERGEN_TRACKING_P2_101_PAGE))) {
    const source = readFileSync(join(root, ALLERGEN_TRACKING_P2_101_PAGE), "utf8");
    pageWired =
      source.includes("AllergenTrackingPanel") &&
      source.includes("ALLERGEN_TRACKING_P2_101_POLICY_ID");
  }

  if (existsSync(join(root, ALLERGEN_TRACKING_P2_101_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, ALLERGEN_TRACKING_P2_101_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildRegulatoryAllergenRegistry") &&
      source.includes("rollUpRecipeAllergens") &&
      source.includes("linkInventoryIngredientAllergens") &&
      source.includes("buildAllergenTrackingReport");
  }

  if (existsSync(join(root, ALLERGEN_TRACKING_P2_101_SERVICE_PATH))) {
    const source = readFileSync(join(root, ALLERGEN_TRACKING_P2_101_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadAllergenTrackingSnapshot") &&
      source.includes("ALLERGEN_TRACKING_P2_101_POLICY_ID");
  }

  if (existsSync(join(root, ALLERGEN_TRACKING_P2_101_LEGACY_POLICY))) {
    const source = readFileSync(join(root, ALLERGEN_TRACKING_P2_101_LEGACY_POLICY), "utf8");
    legacyRegistryLinked =
      source.includes("STANDARD_ALLERGEN_KEYS") && source.includes("displayAllergenKey");
  }

  const allergenServicePath = "services/allergen/allergen-service.ts";
  if (existsSync(join(root, allergenServicePath))) {
    const source = readFileSync(join(root, allergenServicePath), "utf8");
    legacyServiceLinked = source.includes("listMenuAllergenSummary");
  }

  const combinedSources = [
    ALLERGEN_TRACKING_P2_101_DOC,
    "lib/inventory/allergen-tracking-p2-101-content.ts",
    ALLERGEN_TRACKING_P2_101_OPERATIONS_PATH,
    ALLERGEN_TRACKING_P2_101_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = ALLERGEN_TRACKING_P2_101_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    ALLERGEN_TRACKING_P2_101_CAPABILITIES.length === ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyRegistryLinked &&
    legacyServiceLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: ALLERGEN_TRACKING_P2_101_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyRegistryLinked,
    legacyServiceLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAllergenTrackingP2_101AuditLines(
  summary: AllergenTrackingP2_101AuditSummary,
): string[] {
  return [
    `Allergen tracking audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${ALLERGEN_TRACKING_P2_101_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${ALLERGEN_TRACKING_P2_101_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy registry linked: ${summary.legacyRegistryLinked ? "yes" : "no"}`,
    `Legacy allergen service linked: ${summary.legacyServiceLinked ? "yes" : "no"}`,
    `Capabilities (${ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
