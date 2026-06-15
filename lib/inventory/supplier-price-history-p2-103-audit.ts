import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES } from "@/lib/inventory/supplier-price-history-p2-103-content";
import {
  SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT,
  SUPPLIER_PRICE_HISTORY_P2_103_COMPONENT,
  SUPPLIER_PRICE_HISTORY_P2_103_DOC,
  SUPPLIER_PRICE_HISTORY_P2_103_HONESTY_MARKERS,
  SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_CHART,
  SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_POLICY,
  SUPPLIER_PRICE_HISTORY_P2_103_OPERATIONS_PATH,
  SUPPLIER_PRICE_HISTORY_P2_103_PAGE,
  SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID,
  SUPPLIER_PRICE_HISTORY_P2_103_ROUTE,
  SUPPLIER_PRICE_HISTORY_P2_103_SERVICE_PATH,
  SUPPLIER_PRICE_HISTORY_P2_103_WIRING_PATHS,
} from "@/lib/inventory/supplier-price-history-p2-103-policy";

export type SupplierPriceHistoryP2_103AuditSummary = {
  policyId: typeof SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyServiceLinked: boolean;
  legacyChartLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditSupplierPriceHistoryP2_103(
  root = process.cwd(),
): SupplierPriceHistoryP2_103AuditSummary {
  const wiringComplete = SUPPLIER_PRICE_HISTORY_P2_103_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyServiceLinked = false;
  let legacyChartLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_DOC))) {
    const source = readFileSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_DOC), "utf8");
    docWired =
      source.includes(SUPPLIER_PRICE_HISTORY_P2_103_ROUTE) &&
      source.includes(String(SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_COMPONENT))) {
    const source = readFileSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_COMPONENT), "utf8");
    componentWired =
      source.includes("SupplierPriceHistoryPanel") &&
      source.includes("SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES");
    allTestIdsPresent =
      source.includes("SUPPLIER_PRICE_HISTORY_P2_103_TEST_IDS[0]") &&
      source.includes("SUPPLIER_PRICE_HISTORY_P2_103_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_PAGE))) {
    const source = readFileSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_PAGE), "utf8");
    pageWired =
      source.includes("SupplierPriceHistoryPanel") &&
      source.includes("SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID");
  }

  if (existsSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildIngredientGraphSeries") &&
      source.includes("buildMultiSupplierTrendRows") &&
      source.includes("buildPriceChangeSummaryRows") &&
      source.includes("buildSupplierPriceHistoryReport");
  }

  if (existsSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_SERVICE_PATH))) {
    const source = readFileSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadSupplierPriceHistorySnapshot") &&
      source.includes("SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID");
  }

  if (existsSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_POLICY))) {
    const source = readFileSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_POLICY), "utf8");
    legacyServiceLinked =
      source.includes("getSupplierPriceHistoryForChart") &&
      source.includes("compareSupplierPricesByIngredient");
  }

  if (existsSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_CHART))) {
    const source = readFileSync(join(root, SUPPLIER_PRICE_HISTORY_P2_103_LEGACY_CHART), "utf8");
    legacyChartLinked =
      source.includes("SupplierPriceChart") && source.includes("SupplierPriceChartPoint");
  }

  const combinedSources = [
    SUPPLIER_PRICE_HISTORY_P2_103_DOC,
    "lib/inventory/supplier-price-history-p2-103-content.ts",
    SUPPLIER_PRICE_HISTORY_P2_103_OPERATIONS_PATH,
    SUPPLIER_PRICE_HISTORY_P2_103_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = SUPPLIER_PRICE_HISTORY_P2_103_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES.length ===
    SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyServiceLinked &&
    legacyChartLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyServiceLinked,
    legacyChartLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatSupplierPriceHistoryP2_103AuditLines(
  summary: SupplierPriceHistoryP2_103AuditSummary,
): string[] {
  return [
    `Supplier price history audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${SUPPLIER_PRICE_HISTORY_P2_103_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${SUPPLIER_PRICE_HISTORY_P2_103_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy price history service linked: ${summary.legacyServiceLinked ? "yes" : "no"}`,
    `Legacy chart component linked: ${summary.legacyChartLinked ? "yes" : "no"}`,
    `Capabilities (${SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
