import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES } from "@/lib/inventory/vendor-price-intelligence-p2-100-content";
import {
  VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT,
  VENDOR_PRICE_INTELLIGENCE_P2_100_COMPONENT,
  VENDOR_PRICE_INTELLIGENCE_P2_100_DOC,
  VENDOR_PRICE_INTELLIGENCE_P2_100_HONESTY_MARKERS,
  VENDOR_PRICE_INTELLIGENCE_P2_100_LEGACY_POLICY,
  VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATIONS_PATH,
  VENDOR_PRICE_INTELLIGENCE_P2_100_PAGE,
  VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID,
  VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE,
  VENDOR_PRICE_INTELLIGENCE_P2_100_SERVICE_PATH,
  VENDOR_PRICE_INTELLIGENCE_P2_100_WIRING_PATHS,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-policy";

export type VendorPriceIntelligenceP2_100AuditSummary = {
  policyId: typeof VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyPriceHistoryLinked: boolean;
  legacyPurchasingLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditVendorPriceIntelligenceP2_100(
  root = process.cwd(),
): VendorPriceIntelligenceP2_100AuditSummary {
  const wiringComplete = VENDOR_PRICE_INTELLIGENCE_P2_100_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyPriceHistoryLinked = false;
  let legacyPurchasingLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_DOC))) {
    const source = readFileSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_DOC), "utf8");
    docWired =
      source.includes(VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE) &&
      source.includes(String(VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_COMPONENT))) {
    const source = readFileSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_COMPONENT), "utf8");
    componentWired =
      source.includes("VendorPriceIntelligencePanel") &&
      source.includes("VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES");
    allTestIdsPresent =
      source.includes("VENDOR_PRICE_INTELLIGENCE_P2_100_TEST_IDS[0]") &&
      source.includes("VENDOR_PRICE_INTELLIGENCE_P2_100_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_PAGE))) {
    const source = readFileSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_PAGE), "utf8");
    pageWired =
      source.includes("VendorPriceIntelligencePanel") &&
      source.includes("VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildPriceHistoryPoints") &&
      source.includes("buildSubstitutionSuggestions") &&
      source.includes("buildCheaperVendorRecommendations") &&
      source.includes("buildVendorPriceIntelligenceReport");
  }

  if (existsSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_SERVICE_PATH))) {
    const source = readFileSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadVendorPriceIntelligenceSnapshot") &&
      source.includes("VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_LEGACY_POLICY))) {
    const source = readFileSync(join(root, VENDOR_PRICE_INTELLIGENCE_P2_100_LEGACY_POLICY), "utf8");
    legacyPriceHistoryLinked =
      source.includes("getSupplierPriceHistoryForChart") &&
      source.includes("compareSupplierPricesByIngredient");
  }

  const purchasingPath = "lib/ai/ai-purchasing-builders.ts";
  if (existsSync(join(root, purchasingPath))) {
    const source = readFileSync(join(root, purchasingPath), "utf8");
    legacyPurchasingLinked = source.includes("optimizePrice");
  }

  const combinedSources = [
    VENDOR_PRICE_INTELLIGENCE_P2_100_DOC,
    "lib/inventory/vendor-price-intelligence-p2-100-content.ts",
    VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATIONS_PATH,
    VENDOR_PRICE_INTELLIGENCE_P2_100_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = VENDOR_PRICE_INTELLIGENCE_P2_100_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES.length ===
    VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyPriceHistoryLinked &&
    legacyPurchasingLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyPriceHistoryLinked,
    legacyPurchasingLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatVendorPriceIntelligenceP2_100AuditLines(
  summary: VendorPriceIntelligenceP2_100AuditSummary,
): string[] {
  return [
    `Vendor price intelligence audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${VENDOR_PRICE_INTELLIGENCE_P2_100_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${VENDOR_PRICE_INTELLIGENCE_P2_100_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy price history linked: ${summary.legacyPriceHistoryLinked ? "yes" : "no"}`,
    `Legacy purchasing linked: ${summary.legacyPurchasingLinked ? "yes" : "no"}`,
    `Capabilities (${VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
