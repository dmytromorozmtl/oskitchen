import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { VENDOR_ANALYTICS_P2_119_CAPABILITIES } from "@/lib/marketplace/vendor-analytics-p2-119-content";
import {
  VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT,
  VENDOR_ANALYTICS_P2_119_COMPONENT,
  VENDOR_ANALYTICS_P2_119_DOC,
  VENDOR_ANALYTICS_P2_119_HONESTY_MARKERS,
  VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS,
  VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_CLIENT,
  VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_PAGE,
  VENDOR_ANALYTICS_P2_119_LEGACY_CART,
  VENDOR_ANALYTICS_P2_119_LEGACY_COMPARE,
  VENDOR_ANALYTICS_P2_119_LEGACY_PRICE_INTEL,
  VENDOR_ANALYTICS_P2_119_OPERATIONS_PATH,
  VENDOR_ANALYTICS_P2_119_PAGE,
  VENDOR_ANALYTICS_P2_119_POLICY_ID,
  VENDOR_ANALYTICS_P2_119_ROUTE,
  VENDOR_ANALYTICS_P2_119_SERVICE_PATH,
  VENDOR_ANALYTICS_P2_119_WIRING_PATHS,
} from "@/lib/marketplace/vendor-analytics-p2-119-policy";

export type VendorAnalyticsP2_119AuditSummary = {
  policyId: typeof VENDOR_ANALYTICS_P2_119_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyAnalyticsLinked: boolean;
  legacyAnalyticsPageLinked: boolean;
  legacyAnalyticsClientLinked: boolean;
  legacyCartLinked: boolean;
  legacyCompareLinked: boolean;
  legacyPriceIntelLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditVendorAnalyticsP2_119(
  root = process.cwd(),
): VendorAnalyticsP2_119AuditSummary {
  const wiringComplete = VENDOR_ANALYTICS_P2_119_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyAnalyticsLinked = false;
  let legacyAnalyticsPageLinked = false;
  let legacyAnalyticsClientLinked = false;
  let legacyCartLinked = false;
  let legacyCompareLinked = false;
  let legacyPriceIntelLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_DOC))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_DOC), "utf8");
    docWired =
      source.includes(VENDOR_ANALYTICS_P2_119_ROUTE) &&
      source.includes(String(VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_COMPONENT))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_COMPONENT), "utf8");
    componentWired =
      source.includes("VendorAnalyticsPanel") &&
      source.includes("VENDOR_ANALYTICS_P2_119_CAPABILITIES");
    allTestIdsPresent =
      source.includes("VENDOR_ANALYTICS_P2_119_TEST_IDS[0]") &&
      source.includes("VENDOR_ANALYTICS_P2_119_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_PAGE))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_PAGE), "utf8");
    pageWired =
      source.includes("VendorAnalyticsPanel") &&
      source.includes("VENDOR_ANALYTICS_P2_119_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildTopProductsBlock") &&
      source.includes("buildRepeatBuyersBlock") &&
      source.includes("buildLostCartsBlock") &&
      source.includes("buildPriceCompetitivenessBlock") &&
      source.includes("buildVendorAnalyticsDemoReport");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_SERVICE_PATH))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadVendorAnalyticsSnapshot") &&
      source.includes("VENDOR_ANALYTICS_P2_119_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS), "utf8");
    legacyAnalyticsLinked =
      source.includes("loadVendorAnalytics") &&
      source.includes("productPerformance") &&
      source.includes("repeatBuyerRate");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_PAGE))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_PAGE), "utf8");
    legacyAnalyticsPageLinked =
      source.includes("loadVendorAnalytics") && source.includes("VendorAnalyticsClient");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_CLIENT))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_ANALYTICS_CLIENT), "utf8");
    legacyAnalyticsClientLinked =
      source.includes("VendorAnalyticsClient") && source.includes("productPerformance");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_CART))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_CART), "utf8");
    legacyCartLinked = source.includes("getCart") && source.includes("MarketplaceCartItem");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_COMPARE))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_COMPARE), "utf8");
    legacyCompareLinked =
      source.includes("loadMarketplaceCompare") && source.includes("isBestPrice");
  }

  if (existsSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_PRICE_INTEL))) {
    const source = readFileSync(join(root, VENDOR_ANALYTICS_P2_119_LEGACY_PRICE_INTEL), "utf8");
    legacyPriceIntelLinked = source.includes("loadPriceIntelligenceSnapshot");
  }

  const combinedSources = [
    VENDOR_ANALYTICS_P2_119_DOC,
    "lib/marketplace/vendor-analytics-p2-119-content.ts",
    VENDOR_ANALYTICS_P2_119_OPERATIONS_PATH,
    VENDOR_ANALYTICS_P2_119_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = VENDOR_ANALYTICS_P2_119_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    VENDOR_ANALYTICS_P2_119_CAPABILITIES.length === VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyAnalyticsLinked &&
    legacyAnalyticsPageLinked &&
    legacyAnalyticsClientLinked &&
    legacyCartLinked &&
    legacyCompareLinked &&
    legacyPriceIntelLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: VENDOR_ANALYTICS_P2_119_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyAnalyticsLinked,
    legacyAnalyticsPageLinked,
    legacyAnalyticsClientLinked,
    legacyCartLinked,
    legacyCompareLinked,
    legacyPriceIntelLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatVendorAnalyticsP2_119AuditLines(
  summary: VendorAnalyticsP2_119AuditSummary,
): string[] {
  return [
    `Vendor analytics audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${VENDOR_ANALYTICS_P2_119_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${VENDOR_ANALYTICS_P2_119_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy analytics linked: ${summary.legacyAnalyticsLinked ? "yes" : "no"}`,
    `Legacy analytics page linked: ${summary.legacyAnalyticsPageLinked ? "yes" : "no"}`,
    `Legacy analytics client linked: ${summary.legacyAnalyticsClientLinked ? "yes" : "no"}`,
    `Legacy cart linked: ${summary.legacyCartLinked ? "yes" : "no"}`,
    `Legacy compare linked: ${summary.legacyCompareLinked ? "yes" : "no"}`,
    `Legacy price intel linked: ${summary.legacyPriceIntelLinked ? "yes" : "no"}`,
    `Capabilities (${VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
