import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { RESTAURANT_PURCHASING_P2_117_CAPABILITIES } from "@/lib/marketplace/restaurant-purchasing-p2-117-content";
import {
  RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT,
  RESTAURANT_PURCHASING_P2_117_COMPONENT,
  RESTAURANT_PURCHASING_P2_117_DOC,
  RESTAURANT_PURCHASING_P2_117_HONESTY_MARKERS,
  RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE,
  RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE_PAGE,
  RESTAURANT_PURCHASING_P2_117_LEGACY_DASHBOARD,
  RESTAURANT_PURCHASING_P2_117_LEGACY_DISPUTES,
  RESTAURANT_PURCHASING_P2_117_LEGACY_RECURRING,
  RESTAURANT_PURCHASING_P2_117_LEGACY_SUPPLIER,
  RESTAURANT_PURCHASING_P2_117_OPERATIONS_PATH,
  RESTAURANT_PURCHASING_P2_117_PAGE,
  RESTAURANT_PURCHASING_P2_117_POLICY_ID,
  RESTAURANT_PURCHASING_P2_117_ROUTE,
  RESTAURANT_PURCHASING_P2_117_SERVICE_PATH,
  RESTAURANT_PURCHASING_P2_117_WIRING_PATHS,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-policy";

export type RestaurantPurchasingP2_117AuditSummary = {
  policyId: typeof RESTAURANT_PURCHASING_P2_117_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyCompareLinked: boolean;
  legacyRecurringLinked: boolean;
  legacyComparePageLinked: boolean;
  legacyDisputesLinked: boolean;
  legacyDashboardLinked: boolean;
  legacySupplierLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditRestaurantPurchasingP2_117(
  root = process.cwd(),
): RestaurantPurchasingP2_117AuditSummary {
  const wiringComplete = RESTAURANT_PURCHASING_P2_117_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyCompareLinked = false;
  let legacyRecurringLinked = false;
  let legacyComparePageLinked = false;
  let legacyDisputesLinked = false;
  let legacyDashboardLinked = false;
  let legacySupplierLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_DOC))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_DOC), "utf8");
    docWired =
      source.includes(RESTAURANT_PURCHASING_P2_117_ROUTE) &&
      source.includes(String(RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_COMPONENT))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_COMPONENT), "utf8");
    componentWired =
      source.includes("RestaurantPurchasingPanel") &&
      source.includes("RESTAURANT_PURCHASING_P2_117_CAPABILITIES");
    allTestIdsPresent =
      source.includes("RESTAURANT_PURCHASING_P2_117_TEST_IDS[0]") &&
      source.includes("RESTAURANT_PURCHASING_P2_117_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_PAGE))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_PAGE), "utf8");
    pageWired =
      source.includes("RestaurantPurchasingPanel") &&
      source.includes("RESTAURANT_PURCHASING_P2_117_POLICY_ID");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildCompareSuppliersBlock") &&
      source.includes("buildRecurringOrdersBlock") &&
      source.includes("buildSubstitutionsBlock") &&
      source.includes("buildDeliveryTrackingBlock") &&
      source.includes("buildDisputesBlock") &&
      source.includes("buildRestaurantPurchasingDemoReport");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_SERVICE_PATH))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadRestaurantPurchasingSnapshot") &&
      source.includes("RESTAURANT_PURCHASING_P2_117_POLICY_ID");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE), "utf8");
    legacyCompareLinked = source.includes("loadMarketplaceCompare");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_RECURRING))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_RECURRING), "utf8");
    legacyRecurringLinked =
      source.includes("loadMarketplaceRecurringOrders") ||
      source.includes("computeNextRecurringRunAt");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE_PAGE))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_COMPARE_PAGE), "utf8");
    legacyComparePageLinked =
      source.includes("loadMarketplaceCompare") && source.includes("Compare prices");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_DISPUTES))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_DISPUTES), "utf8");
    legacyDisputesLinked = source.includes("dispute") || source.includes("Dispute");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_DASHBOARD))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_DASHBOARD), "utf8");
    legacyDashboardLinked =
      source.includes("delivery") && source.includes("dispute");
  }

  if (existsSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_SUPPLIER))) {
    const source = readFileSync(join(root, RESTAURANT_PURCHASING_P2_117_LEGACY_SUPPLIER), "utf8");
    legacySupplierLinked = source.includes("loadSupplierMarketplaceDashboard");
  }

  const combinedSources = [
    RESTAURANT_PURCHASING_P2_117_DOC,
    "lib/marketplace/restaurant-purchasing-p2-117-content.ts",
    RESTAURANT_PURCHASING_P2_117_OPERATIONS_PATH,
    RESTAURANT_PURCHASING_P2_117_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = RESTAURANT_PURCHASING_P2_117_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    RESTAURANT_PURCHASING_P2_117_CAPABILITIES.length ===
    RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyCompareLinked &&
    legacyRecurringLinked &&
    legacyComparePageLinked &&
    legacyDisputesLinked &&
    legacyDashboardLinked &&
    legacySupplierLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: RESTAURANT_PURCHASING_P2_117_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyCompareLinked,
    legacyRecurringLinked,
    legacyComparePageLinked,
    legacyDisputesLinked,
    legacyDashboardLinked,
    legacySupplierLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatRestaurantPurchasingP2_117AuditLines(
  summary: RestaurantPurchasingP2_117AuditSummary,
): string[] {
  return [
    `Restaurant purchasing audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${RESTAURANT_PURCHASING_P2_117_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${RESTAURANT_PURCHASING_P2_117_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy compare linked: ${summary.legacyCompareLinked ? "yes" : "no"}`,
    `Legacy recurring linked: ${summary.legacyRecurringLinked ? "yes" : "no"}`,
    `Legacy compare page linked: ${summary.legacyComparePageLinked ? "yes" : "no"}`,
    `Legacy disputes linked: ${summary.legacyDisputesLinked ? "yes" : "no"}`,
    `Legacy dashboard linked: ${summary.legacyDashboardLinked ? "yes" : "no"}`,
    `Legacy supplier linked: ${summary.legacySupplierLinked ? "yes" : "no"}`,
    `Capabilities (${RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
