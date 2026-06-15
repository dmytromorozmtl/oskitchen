import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES } from "@/lib/inventory/recipe-costing-engine-p2-97-content";
import {
  RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT,
  RECIPE_COSTING_ENGINE_P2_97_COMPONENT,
  RECIPE_COSTING_ENGINE_P2_97_DOC,
  RECIPE_COSTING_ENGINE_P2_97_HONESTY_MARKERS,
  RECIPE_COSTING_ENGINE_P2_97_LEGACY_POLICY,
  RECIPE_COSTING_ENGINE_P2_97_OPERATIONS_PATH,
  RECIPE_COSTING_ENGINE_P2_97_PAGE,
  RECIPE_COSTING_ENGINE_P2_97_POLICY_ID,
  RECIPE_COSTING_ENGINE_P2_97_ROUTE,
  RECIPE_COSTING_ENGINE_P2_97_SERVICE_PATH,
  RECIPE_COSTING_ENGINE_P2_97_WIRING_PATHS,
} from "@/lib/inventory/recipe-costing-engine-p2-97-policy";

export type RecipeCostingEngineP2_97AuditSummary = {
  policyId: typeof RECIPE_COSTING_ENGINE_P2_97_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyCalculationsLinked: boolean;
  legacyServiceLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditRecipeCostingEngineP2_97(
  root = process.cwd(),
): RecipeCostingEngineP2_97AuditSummary {
  const wiringComplete = RECIPE_COSTING_ENGINE_P2_97_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyCalculationsLinked = false;
  let legacyServiceLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, RECIPE_COSTING_ENGINE_P2_97_DOC))) {
    const source = readFileSync(join(root, RECIPE_COSTING_ENGINE_P2_97_DOC), "utf8");
    docWired =
      source.includes(RECIPE_COSTING_ENGINE_P2_97_ROUTE) &&
      source.includes(String(RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, RECIPE_COSTING_ENGINE_P2_97_COMPONENT))) {
    const source = readFileSync(join(root, RECIPE_COSTING_ENGINE_P2_97_COMPONENT), "utf8");
    componentWired =
      source.includes("RecipeCostingEnginePanel") &&
      source.includes("RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES");
    allTestIdsPresent =
      source.includes("RECIPE_COSTING_ENGINE_P2_97_TEST_IDS[0]") &&
      source.includes("RECIPE_COSTING_ENGINE_P2_97_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, RECIPE_COSTING_ENGINE_P2_97_PAGE))) {
    const source = readFileSync(join(root, RECIPE_COSTING_ENGINE_P2_97_PAGE), "utf8");
    pageWired =
      source.includes("RecipeCostingEnginePanel") &&
      source.includes("RECIPE_COSTING_ENGINE_P2_97_POLICY_ID");
  }

  if (existsSync(join(root, RECIPE_COSTING_ENGINE_P2_97_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, RECIPE_COSTING_ENGINE_P2_97_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildRecipeIngredientCostLines") &&
      source.includes("computePortionCost") &&
      source.includes("computeMarginByItem") &&
      source.includes("buildRecipeCostingEngineReport");
  }

  if (existsSync(join(root, RECIPE_COSTING_ENGINE_P2_97_SERVICE_PATH))) {
    const source = readFileSync(join(root, RECIPE_COSTING_ENGINE_P2_97_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadRecipeCostingEngineSnapshot") &&
      source.includes("RECIPE_COSTING_ENGINE_P2_97_POLICY_ID");
  }

  if (existsSync(join(root, RECIPE_COSTING_ENGINE_P2_97_LEGACY_POLICY))) {
    const source = readFileSync(join(root, RECIPE_COSTING_ENGINE_P2_97_LEGACY_POLICY), "utf8");
    legacyCalculationsLinked =
      source.includes("computeRecipeCostPerOutputUnit") &&
      source.includes("wastePercent");
  }

  const legacyServicePath = "services/costing/costing-service.ts";
  if (existsSync(join(root, legacyServicePath))) {
    const source = readFileSync(join(root, legacyServicePath), "utf8");
    legacyServiceLinked =
      source.includes("runFullRecipeCosting") &&
      source.includes("loadCostingOverviewData");
  }

  const combinedSources = [
    RECIPE_COSTING_ENGINE_P2_97_DOC,
    "lib/inventory/recipe-costing-engine-p2-97-content.ts",
    RECIPE_COSTING_ENGINE_P2_97_OPERATIONS_PATH,
    RECIPE_COSTING_ENGINE_P2_97_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = RECIPE_COSTING_ENGINE_P2_97_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES.length === RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyCalculationsLinked &&
    legacyServiceLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: RECIPE_COSTING_ENGINE_P2_97_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyCalculationsLinked,
    legacyServiceLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatRecipeCostingEngineP2_97AuditLines(
  summary: RecipeCostingEngineP2_97AuditSummary,
): string[] {
  return [
    `Recipe costing engine audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${RECIPE_COSTING_ENGINE_P2_97_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${RECIPE_COSTING_ENGINE_P2_97_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy calculations linked: ${summary.legacyCalculationsLinked ? "yes" : "no"}`,
    `Legacy costing service linked: ${summary.legacyServiceLinked ? "yes" : "no"}`,
    `Capabilities (${RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
