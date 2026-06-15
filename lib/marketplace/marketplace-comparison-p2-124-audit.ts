import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MARKETPLACE_COMPARISON_P2_124_CAPABILITIES } from "@/lib/marketplace/marketplace-comparison-p2-124-content";
import {
  MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT,
  MARKETPLACE_COMPARISON_P2_124_COMPONENT,
  MARKETPLACE_COMPARISON_P2_124_DOC,
  MARKETPLACE_COMPARISON_P2_124_HONESTY_MARKERS,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_CATALOG_TOOLBAR,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_CLIENT,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_FILTERS,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_PAGE,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_SERVICE,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_STORAGE,
  MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARISON_TABLE,
  MARKETPLACE_COMPARISON_P2_124_OPERATIONS_PATH,
  MARKETPLACE_COMPARISON_P2_124_PAGE,
  MARKETPLACE_COMPARISON_P2_124_POLICY_ID,
  MARKETPLACE_COMPARISON_P2_124_ROUTE,
  MARKETPLACE_COMPARISON_P2_124_SERVICE_PATH,
  MARKETPLACE_COMPARISON_P2_124_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-comparison-p2-124-policy";

export type MarketplaceComparisonP2_124AuditSummary = {
  policyId: typeof MARKETPLACE_COMPARISON_P2_124_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyCompareServiceLinked: boolean;
  legacyComparePageLinked: boolean;
  legacyCompareClientLinked: boolean;
  legacyComparisonTableLinked: boolean;
  legacyCompareFiltersLinked: boolean;
  legacyCompareStorageLinked: boolean;
  legacyCatalogToolbarLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMarketplaceComparisonP2_124(
  root = process.cwd(),
): MarketplaceComparisonP2_124AuditSummary {
  const wiringComplete = MARKETPLACE_COMPARISON_P2_124_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyCompareServiceLinked = false;
  let legacyComparePageLinked = false;
  let legacyCompareClientLinked = false;
  let legacyComparisonTableLinked = false;
  let legacyCompareFiltersLinked = false;
  let legacyCompareStorageLinked = false;
  let legacyCatalogToolbarLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_DOC))) {
    const source = readFileSync(join(root, MARKETPLACE_COMPARISON_P2_124_DOC), "utf8");
    docWired =
      source.includes(MARKETPLACE_COMPARISON_P2_124_ROUTE) &&
      source.includes(String(MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_COMPONENT))) {
    const source = readFileSync(join(root, MARKETPLACE_COMPARISON_P2_124_COMPONENT), "utf8");
    componentWired =
      source.includes("MarketplaceComparisonP2_124Panel") &&
      source.includes("MARKETPLACE_COMPARISON_P2_124_CAPABILITIES");
    allTestIdsPresent =
      source.includes("MARKETPLACE_COMPARISON_P2_124_TEST_IDS[0]") &&
      source.includes("MARKETPLACE_COMPARISON_P2_124_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_PAGE))) {
    const source = readFileSync(join(root, MARKETPLACE_COMPARISON_P2_124_PAGE), "utf8");
    pageWired =
      source.includes("MarketplaceComparisonP2_124Panel") &&
      source.includes("MARKETPLACE_COMPARISON_P2_124_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_COMPARISON_P2_124_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildSideBySideBlock") &&
      source.includes("buildSearchMatchBlock") &&
      source.includes("buildMultiSortBlock") &&
      source.includes("buildCompareTrayBlock") &&
      source.includes("buildMarketplaceComparisonP2_124DemoReport");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_SERVICE_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_COMPARISON_P2_124_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadMarketplaceComparisonP2_124Snapshot") &&
      source.includes("MARKETPLACE_COMPARISON_P2_124_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_SERVICE))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_SERVICE),
      "utf8",
    );
    legacyCompareServiceLinked =
      source.includes("loadMarketplaceCompare") &&
      source.includes("markBestPrice") &&
      source.includes("sortCompareRows");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_PAGE))) {
    const source = readFileSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_PAGE), "utf8");
    legacyComparePageLinked =
      source.includes("MarketplaceCompareClient") &&
      source.includes("loadMarketplaceCompare");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_CLIENT))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_CLIENT),
      "utf8",
    );
    legacyCompareClientLinked =
      source.includes("ProductComparisonTable") &&
      source.includes("MarketplaceCompareResult");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARISON_TABLE))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARISON_TABLE),
      "utf8",
    );
    legacyComparisonTableLinked =
      source.includes("ProductComparisonTable") &&
      source.includes("MARKETPLACE_PRODUCT_COMPARISON_MAX");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_FILTERS))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_FILTERS),
      "utf8",
    );
    legacyCompareFiltersLinked =
      source.includes("MARKETPLACE_COMPARE_SORT_OPTIONS") &&
      source.includes("isLikelyGtinQuery");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_STORAGE))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_COMPARE_STORAGE),
      "utf8",
    );
    legacyCompareStorageLinked =
      source.includes("readMarketplaceCompareSlugs") &&
      source.includes("MARKETPLACE_COMPARE_STORAGE_KEY");
  }

  if (existsSync(join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_CATALOG_TOOLBAR))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMPARISON_P2_124_LEGACY_CATALOG_TOOLBAR),
      "utf8",
    );
    legacyCatalogToolbarLinked =
      source.includes("readMarketplaceCompareSlugs") &&
      source.includes("marketplace-catalog-compare-link");
  }

  const combinedSources = [
    MARKETPLACE_COMPARISON_P2_124_DOC,
    "lib/marketplace/marketplace-comparison-p2-124-content.ts",
    MARKETPLACE_COMPARISON_P2_124_OPERATIONS_PATH,
    MARKETPLACE_COMPARISON_P2_124_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MARKETPLACE_COMPARISON_P2_124_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    MARKETPLACE_COMPARISON_P2_124_CAPABILITIES.length ===
    MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyCompareServiceLinked &&
    legacyComparePageLinked &&
    legacyCompareClientLinked &&
    legacyComparisonTableLinked &&
    legacyCompareFiltersLinked &&
    legacyCompareStorageLinked &&
    legacyCatalogToolbarLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: MARKETPLACE_COMPARISON_P2_124_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyCompareServiceLinked,
    legacyComparePageLinked,
    legacyCompareClientLinked,
    legacyComparisonTableLinked,
    legacyCompareFiltersLinked,
    legacyCompareStorageLinked,
    legacyCatalogToolbarLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatMarketplaceComparisonP2_124AuditLines(
  summary: MarketplaceComparisonP2_124AuditSummary,
): string[] {
  return [
    `Marketplace comparison tool audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MARKETPLACE_COMPARISON_P2_124_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${MARKETPLACE_COMPARISON_P2_124_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy compare service linked: ${summary.legacyCompareServiceLinked ? "yes" : "no"}`,
    `Legacy compare page linked: ${summary.legacyComparePageLinked ? "yes" : "no"}`,
    `Legacy compare client linked: ${summary.legacyCompareClientLinked ? "yes" : "no"}`,
    `Legacy comparison table linked: ${summary.legacyComparisonTableLinked ? "yes" : "no"}`,
    `Legacy compare filters linked: ${summary.legacyCompareFiltersLinked ? "yes" : "no"}`,
    `Legacy compare storage linked: ${summary.legacyCompareStorageLinked ? "yes" : "no"}`,
    `Legacy catalog toolbar linked: ${summary.legacyCatalogToolbarLinked ? "yes" : "no"}`,
    `Capabilities (${MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
