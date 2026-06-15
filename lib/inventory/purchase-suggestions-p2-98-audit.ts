import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES } from "@/lib/inventory/purchase-suggestions-p2-98-content";
import {
  PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT,
  PURCHASE_SUGGESTIONS_P2_98_COMPONENT,
  PURCHASE_SUGGESTIONS_P2_98_DOC,
  PURCHASE_SUGGESTIONS_P2_98_HONESTY_MARKERS,
  PURCHASE_SUGGESTIONS_P2_98_LEGACY_POLICY,
  PURCHASE_SUGGESTIONS_P2_98_OPERATIONS_PATH,
  PURCHASE_SUGGESTIONS_P2_98_PAGE,
  PURCHASE_SUGGESTIONS_P2_98_POLICY_ID,
  PURCHASE_SUGGESTIONS_P2_98_ROUTE,
  PURCHASE_SUGGESTIONS_P2_98_SERVICE_PATH,
  PURCHASE_SUGGESTIONS_P2_98_WIRING_PATHS,
} from "@/lib/inventory/purchase-suggestions-p2-98-policy";

export type PurchaseSuggestionsP2_98AuditSummary = {
  policyId: typeof PURCHASE_SUGGESTIONS_P2_98_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyBuildersLinked: boolean;
  legacyServiceLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPurchaseSuggestionsP2_98(
  root = process.cwd(),
): PurchaseSuggestionsP2_98AuditSummary {
  const wiringComplete = PURCHASE_SUGGESTIONS_P2_98_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyBuildersLinked = false;
  let legacyServiceLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, PURCHASE_SUGGESTIONS_P2_98_DOC))) {
    const source = readFileSync(join(root, PURCHASE_SUGGESTIONS_P2_98_DOC), "utf8");
    docWired =
      source.includes(PURCHASE_SUGGESTIONS_P2_98_ROUTE) &&
      source.includes(String(PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, PURCHASE_SUGGESTIONS_P2_98_COMPONENT))) {
    const source = readFileSync(join(root, PURCHASE_SUGGESTIONS_P2_98_COMPONENT), "utf8");
    componentWired =
      source.includes("PurchaseSuggestionsPanel") &&
      source.includes("PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES");
    allTestIdsPresent =
      source.includes("PURCHASE_SUGGESTIONS_P2_98_TEST_IDS[0]") &&
      source.includes("PURCHASE_SUGGESTIONS_P2_98_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, PURCHASE_SUGGESTIONS_P2_98_PAGE))) {
    const source = readFileSync(join(root, PURCHASE_SUGGESTIONS_P2_98_PAGE), "utf8");
    pageWired =
      source.includes("PurchaseSuggestionsPanel") &&
      source.includes("PURCHASE_SUGGESTIONS_P2_98_POLICY_ID");
  }

  if (existsSync(join(root, PURCHASE_SUGGESTIONS_P2_98_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, PURCHASE_SUGGESTIONS_P2_98_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildForecastSignal") &&
      source.includes("buildLowStockSignal") &&
      source.includes("buildMenuDemandSignal") &&
      source.includes("buildVendorPriceSignal") &&
      source.includes("buildPurchaseSuggestionsReport");
  }

  if (existsSync(join(root, PURCHASE_SUGGESTIONS_P2_98_SERVICE_PATH))) {
    const source = readFileSync(join(root, PURCHASE_SUGGESTIONS_P2_98_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadPurchaseSuggestionsSnapshot") &&
      source.includes("PURCHASE_SUGGESTIONS_P2_98_POLICY_ID");
  }

  if (existsSync(join(root, PURCHASE_SUGGESTIONS_P2_98_LEGACY_POLICY))) {
    const source = readFileSync(join(root, PURCHASE_SUGGESTIONS_P2_98_LEGACY_POLICY), "utf8");
    legacyBuildersLinked =
      source.includes("computePredictedDemand14d") &&
      source.includes("optimizePrice");
  }

  const legacyServicePath = "services/ai/ai-purchasing.ts";
  if (existsSync(join(root, legacyServicePath))) {
    const source = readFileSync(join(root, legacyServicePath), "utf8");
    legacyServiceLinked = source.includes("generatePurchaseRecommendations");
  }

  const combinedSources = [
    PURCHASE_SUGGESTIONS_P2_98_DOC,
    "lib/inventory/purchase-suggestions-p2-98-content.ts",
    PURCHASE_SUGGESTIONS_P2_98_OPERATIONS_PATH,
    PURCHASE_SUGGESTIONS_P2_98_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PURCHASE_SUGGESTIONS_P2_98_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES.length === PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyBuildersLinked &&
    legacyServiceLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: PURCHASE_SUGGESTIONS_P2_98_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyBuildersLinked,
    legacyServiceLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPurchaseSuggestionsP2_98AuditLines(
  summary: PurchaseSuggestionsP2_98AuditSummary,
): string[] {
  return [
    `Purchase suggestions audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${PURCHASE_SUGGESTIONS_P2_98_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${PURCHASE_SUGGESTIONS_P2_98_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy builders linked: ${summary.legacyBuildersLinked ? "yes" : "no"}`,
    `Legacy AI purchasing linked: ${summary.legacyServiceLinked ? "yes" : "no"}`,
    `Capabilities (${PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
