import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { MARKETPLACE_TRUST_P2_120_CAPABILITIES } from "@/lib/marketplace/marketplace-trust-p2-120-content";
import {
  MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT,
  MARKETPLACE_TRUST_P2_120_COMPONENT,
  MARKETPLACE_TRUST_P2_120_DOC,
  MARKETPLACE_TRUST_P2_120_HONESTY_MARKERS,
  MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST,
  MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST_COMPONENT,
  MARKETPLACE_TRUST_P2_120_LEGACY_DISPUTES,
  MARKETPLACE_TRUST_P2_120_LEGACY_QUALITY,
  MARKETPLACE_TRUST_P2_120_LEGACY_VENDOR_MODERATION,
  MARKETPLACE_TRUST_P2_120_LEGACY_VENDORS,
  MARKETPLACE_TRUST_P2_120_OPERATIONS_PATH,
  MARKETPLACE_TRUST_P2_120_PAGE,
  MARKETPLACE_TRUST_P2_120_POLICY_ID,
  MARKETPLACE_TRUST_P2_120_ROUTE,
  MARKETPLACE_TRUST_P2_120_SERVICE_PATH,
  MARKETPLACE_TRUST_P2_120_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-trust-p2-120-policy";

export type MarketplaceTrustP2_120AuditSummary = {
  policyId: typeof MARKETPLACE_TRUST_P2_120_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyVendorModerationLinked: boolean;
  legacyVendorsLinked: boolean;
  legacyQualityLinked: boolean;
  legacyDisputesLinked: boolean;
  legacyCheckoutTrustLinked: boolean;
  legacyCheckoutTrustComponentLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMarketplaceTrustP2_120(
  root = process.cwd(),
): MarketplaceTrustP2_120AuditSummary {
  const wiringComplete = MARKETPLACE_TRUST_P2_120_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyVendorModerationLinked = false;
  let legacyVendorsLinked = false;
  let legacyQualityLinked = false;
  let legacyDisputesLinked = false;
  let legacyCheckoutTrustLinked = false;
  let legacyCheckoutTrustComponentLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_DOC))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_DOC), "utf8");
    docWired =
      source.includes(MARKETPLACE_TRUST_P2_120_ROUTE) &&
      source.includes(String(MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_COMPONENT))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_COMPONENT), "utf8");
    componentWired =
      source.includes("MarketplaceTrustPanel") &&
      source.includes("MARKETPLACE_TRUST_P2_120_CAPABILITIES");
    allTestIdsPresent =
      source.includes("MARKETPLACE_TRUST_P2_120_TEST_IDS[0]") &&
      source.includes("MARKETPLACE_TRUST_P2_120_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_PAGE))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_PAGE), "utf8");
    pageWired =
      source.includes("MarketplaceTrustPanel") &&
      source.includes("MARKETPLACE_TRUST_P2_120_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildVerifiedBadgeBlock") &&
      source.includes("buildSlaBlock") &&
      source.includes("buildReviewsBlock") &&
      source.includes("buildDisputeResolutionBlock") &&
      source.includes("buildMarketplaceTrustDemoReport");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_SERVICE_PATH))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadMarketplaceTrustSnapshot") &&
      source.includes("MARKETPLACE_TRUST_P2_120_POLICY_ID");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_VENDOR_MODERATION))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_VENDOR_MODERATION), "utf8");
    legacyVendorModerationLinked =
      source.includes("verifiedAt") && source.includes("moderatePlatformVendor");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_VENDORS))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_VENDORS), "utf8");
    legacyVendorsLinked =
      source.includes("submitMarketplaceVendorReview") && source.includes("verifiedAt");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_QUALITY))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_QUALITY), "utf8");
    legacyQualityLinked = source.includes("loadMarketplaceQualityScoringSnapshot");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_DISPUTES))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_DISPUTES), "utf8");
    legacyDisputesLinked =
      source.includes("loadPlatformDisputes") &&
      source.includes("countOpenPlatformDisputes") &&
      source.includes("resolvePlatformDispute");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST))) {
    const source = readFileSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST), "utf8");
    legacyCheckoutTrustLinked =
      source.includes("dispute_path") && source.includes("approved_vendors");
  }

  if (existsSync(join(root, MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST_COMPONENT))) {
    const source = readFileSync(
      join(root, MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST_COMPONENT),
      "utf8",
    );
    legacyCheckoutTrustComponentLinked = source.includes("MarketplaceCheckoutTrustStrip");
  }

  const combinedSources = [
    MARKETPLACE_TRUST_P2_120_DOC,
    "lib/marketplace/marketplace-trust-p2-120-content.ts",
    MARKETPLACE_TRUST_P2_120_OPERATIONS_PATH,
    MARKETPLACE_TRUST_P2_120_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MARKETPLACE_TRUST_P2_120_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    MARKETPLACE_TRUST_P2_120_CAPABILITIES.length === MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyVendorModerationLinked &&
    legacyVendorsLinked &&
    legacyQualityLinked &&
    legacyDisputesLinked &&
    legacyCheckoutTrustLinked &&
    legacyCheckoutTrustComponentLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: MARKETPLACE_TRUST_P2_120_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyVendorModerationLinked,
    legacyVendorsLinked,
    legacyQualityLinked,
    legacyDisputesLinked,
    legacyCheckoutTrustLinked,
    legacyCheckoutTrustComponentLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatMarketplaceTrustP2_120AuditLines(
  summary: MarketplaceTrustP2_120AuditSummary,
): string[] {
  return [
    `Marketplace trust audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MARKETPLACE_TRUST_P2_120_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${MARKETPLACE_TRUST_P2_120_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy vendor moderation linked: ${summary.legacyVendorModerationLinked ? "yes" : "no"}`,
    `Legacy vendors linked: ${summary.legacyVendorsLinked ? "yes" : "no"}`,
    `Legacy quality linked: ${summary.legacyQualityLinked ? "yes" : "no"}`,
    `Legacy disputes linked: ${summary.legacyDisputesLinked ? "yes" : "no"}`,
    `Legacy checkout trust linked: ${summary.legacyCheckoutTrustLinked ? "yes" : "no"}`,
    `Legacy checkout trust component linked: ${summary.legacyCheckoutTrustComponentLinked ? "yes" : "no"}`,
    `Capabilities (${MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
