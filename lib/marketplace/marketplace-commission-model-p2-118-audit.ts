import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES } from "@/lib/marketplace/marketplace-commission-model-p2-118-content";
import {
  MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_COMPONENT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_DOC,
  MARKETPLACE_COMMISSION_MODEL_P2_118_HONESTY_MARKERS,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_BILLING_TYPES,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_CHECKOUT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_FEATURED,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_ANALYTICS,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_PAGE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_STRIPE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_FINANCE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_SETTINGS,
  MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATIONS_PATH,
  MARKETPLACE_COMMISSION_MODEL_P2_118_PAGE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID,
  MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_SERVICE_PATH,
  MARKETPLACE_COMMISSION_MODEL_P2_118_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-policy";

export type MarketplaceCommissionModelP2_118AuditSummary = {
  policyId: typeof MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyPlatformAnalyticsLinked: boolean;
  legacyFeaturedLinked: boolean;
  legacyCheckoutLinked: boolean;
  legacyStripeLinked: boolean;
  legacyBillingTypesLinked: boolean;
  legacyVendorFinanceLinked: boolean;
  legacyVendorSettingsLinked: boolean;
  legacyPlatformPageLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMarketplaceCommissionModelP2_118(
  root = process.cwd(),
): MarketplaceCommissionModelP2_118AuditSummary {
  const wiringComplete = MARKETPLACE_COMMISSION_MODEL_P2_118_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyPlatformAnalyticsLinked = false;
  let legacyFeaturedLinked = false;
  let legacyCheckoutLinked = false;
  let legacyStripeLinked = false;
  let legacyBillingTypesLinked = false;
  let legacyVendorFinanceLinked = false;
  let legacyVendorSettingsLinked = false;
  let legacyPlatformPageLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_DOC))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_DOC), "utf8");
    docWired =
      source.includes(MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE) &&
      source.includes(String(MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_COMPONENT))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_COMPONENT), "utf8");
    componentWired =
      source.includes("MarketplaceCommissionModelPanel") &&
      source.includes("MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES");
    allTestIdsPresent =
      source.includes("MARKETPLACE_COMMISSION_MODEL_P2_118_TEST_IDS[0]") &&
      source.includes("MARKETPLACE_COMMISSION_MODEL_P2_118_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_PAGE))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_PAGE), "utf8");
    pageWired =
      source.includes("MarketplaceCommissionModelPanel") &&
      source.includes("MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildVendorCommissionBlock") &&
      source.includes("buildFeaturedPlacementBlock") &&
      source.includes("buildLeadFeeBlock") &&
      source.includes("buildTransactionFeeBlock") &&
      source.includes("buildMarketplaceCommissionModelDemoReport");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_SERVICE_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadMarketplaceCommissionModelSnapshot") &&
      source.includes("MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_ANALYTICS))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_ANALYTICS),
      "utf8",
    );
    legacyPlatformAnalyticsLinked =
      source.includes("commissionRevenue30d") &&
      source.includes("featuredPlacementRevenue30d");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_FEATURED))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_FEATURED), "utf8");
    legacyFeaturedLinked =
      source.includes("createFeaturedPlacement") &&
      source.includes("purchaseFeaturedSlot");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_CHECKOUT))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_CHECKOUT), "utf8");
    legacyCheckoutLinked =
      source.includes("vendorTransaction") && source.includes("commissionAmount");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_STRIPE))) {
    const source = readFileSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_STRIPE), "utf8");
    legacyStripeLinked = source.includes("application_fee_amount");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_BILLING_TYPES))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_BILLING_TYPES),
      "utf8",
    );
    legacyBillingTypesLinked = source.includes("commissionRateForPlan");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_FINANCE))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_FINANCE),
      "utf8",
    );
    legacyVendorFinanceLinked = source.includes("commissionAmount");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_SETTINGS))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_VENDOR_SETTINGS),
      "utf8",
    );
    legacyVendorSettingsLinked =
      source.includes("VENDOR_PLAN_OPTIONS") && source.includes("commission");
  }

  if (existsSync(join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_PAGE))) {
    const source = readFileSync(
      join(root, MARKETPLACE_COMMISSION_MODEL_P2_118_LEGACY_PLATFORM_PAGE),
      "utf8",
    );
    legacyPlatformPageLinked = source.includes("loadPlatformMarketplaceAnalytics");
  }

  const combinedSources = [
    MARKETPLACE_COMMISSION_MODEL_P2_118_DOC,
    "lib/marketplace/marketplace-commission-model-p2-118-content.ts",
    MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATIONS_PATH,
    MARKETPLACE_COMMISSION_MODEL_P2_118_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MARKETPLACE_COMMISSION_MODEL_P2_118_HONESTY_MARKERS.every(
    (marker) => combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES.length ===
    MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyPlatformAnalyticsLinked &&
    legacyFeaturedLinked &&
    legacyCheckoutLinked &&
    legacyStripeLinked &&
    legacyBillingTypesLinked &&
    legacyVendorFinanceLinked &&
    legacyVendorSettingsLinked &&
    legacyPlatformPageLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyPlatformAnalyticsLinked,
    legacyFeaturedLinked,
    legacyCheckoutLinked,
    legacyStripeLinked,
    legacyBillingTypesLinked,
    legacyVendorFinanceLinked,
    legacyVendorSettingsLinked,
    legacyPlatformPageLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatMarketplaceCommissionModelP2_118AuditLines(
  summary: MarketplaceCommissionModelP2_118AuditSummary,
): string[] {
  return [
    `Marketplace commission model audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MARKETPLACE_COMMISSION_MODEL_P2_118_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy platform analytics linked: ${summary.legacyPlatformAnalyticsLinked ? "yes" : "no"}`,
    `Legacy featured linked: ${summary.legacyFeaturedLinked ? "yes" : "no"}`,
    `Legacy checkout linked: ${summary.legacyCheckoutLinked ? "yes" : "no"}`,
    `Legacy stripe linked: ${summary.legacyStripeLinked ? "yes" : "no"}`,
    `Legacy billing types linked: ${summary.legacyBillingTypesLinked ? "yes" : "no"}`,
    `Legacy vendor finance linked: ${summary.legacyVendorFinanceLinked ? "yes" : "no"}`,
    `Legacy vendor settings linked: ${summary.legacyVendorSettingsLinked ? "yes" : "no"}`,
    `Legacy platform page linked: ${summary.legacyPlatformPageLinked ? "yes" : "no"}`,
    `Capabilities (${MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
