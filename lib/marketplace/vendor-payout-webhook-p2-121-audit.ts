import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES } from "@/lib/marketplace/vendor-payout-webhook-p2-121-content";
import {
  VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_COMPONENT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_DOC,
  VENDOR_PAYOUT_WEBHOOK_P2_121_HONESTY_MARKERS,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_CONNECT_CONFIG,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_INSTANT_PAYOUTS,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_STRIPE_CONNECT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_API,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_FINANCE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_WEBHOOK_ROUTE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATIONS_PATH,
  VENDOR_PAYOUT_WEBHOOK_P2_121_PAGE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID,
  VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_SERVICE_PATH,
  VENDOR_PAYOUT_WEBHOOK_P2_121_WIRING_PATHS,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-policy";

export type VendorPayoutWebhookP2_121AuditSummary = {
  policyId: typeof VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyStripeConnectLinked: boolean;
  legacyWebhookRouteLinked: boolean;
  legacyConnectConfigLinked: boolean;
  legacyVendorFinanceLinked: boolean;
  legacyVendorApiLinked: boolean;
  legacyInstantPayoutsLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditVendorPayoutWebhookP2_121(
  root = process.cwd(),
): VendorPayoutWebhookP2_121AuditSummary {
  const wiringComplete = VENDOR_PAYOUT_WEBHOOK_P2_121_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyStripeConnectLinked = false;
  let legacyWebhookRouteLinked = false;
  let legacyConnectConfigLinked = false;
  let legacyVendorFinanceLinked = false;
  let legacyVendorApiLinked = false;
  let legacyInstantPayoutsLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_DOC))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_DOC), "utf8");
    docWired =
      source.includes(VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE) &&
      source.includes(String(VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_COMPONENT))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_COMPONENT), "utf8");
    componentWired =
      source.includes("VendorPayoutWebhookPanel") &&
      source.includes("VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES");
    allTestIdsPresent =
      source.includes("VENDOR_PAYOUT_WEBHOOK_P2_121_TEST_IDS[0]") &&
      source.includes("VENDOR_PAYOUT_WEBHOOK_P2_121_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_PAGE))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_PAGE), "utf8");
    pageWired =
      source.includes("VendorPayoutWebhookPanel") &&
      source.includes("VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildConnectOnboardingBlock") &&
      source.includes("buildPaymentCaptureBlock") &&
      source.includes("buildPayoutTransferBlock") &&
      source.includes("buildPayoutWebhookBlock") &&
      source.includes("buildVendorPayoutWebhookDemoReport");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_SERVICE_PATH))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadVendorPayoutWebhookSnapshot") &&
      source.includes("VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_STRIPE_CONNECT))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_STRIPE_CONNECT), "utf8");
    legacyStripeConnectLinked =
      source.includes("processPayout") &&
      source.includes("handleMarketplaceStripeWebhookEvent") &&
      source.includes("handlePayoutPaid") &&
      source.includes("createVendorAccount");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_WEBHOOK_ROUTE))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_WEBHOOK_ROUTE), "utf8");
    legacyWebhookRouteLinked =
      source.includes("handleMarketplaceStripeWebhookEvent") &&
      source.includes("isDuplicateMarketplaceConnectWebhook");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_CONNECT_CONFIG))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_CONNECT_CONFIG), "utf8");
    legacyConnectConfigLinked =
      source.includes("MARKETPLACE_CONNECT_WEBHOOK_EVENTS") &&
      source.includes("payout.paid");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_FINANCE))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_FINANCE), "utf8");
    legacyVendorFinanceLinked = source.includes("requestVendorPayout");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_API))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_API), "utf8");
    legacyVendorApiLinked = source.includes("dispatchVendorWebhookEvent");
  }

  if (existsSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_INSTANT_PAYOUTS))) {
    const source = readFileSync(join(root, VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_INSTANT_PAYOUTS), "utf8");
    legacyInstantPayoutsLinked = source.includes("requestInstantVendorPayout");
  }

  const combinedSources = [
    VENDOR_PAYOUT_WEBHOOK_P2_121_DOC,
    "lib/marketplace/vendor-payout-webhook-p2-121-content.ts",
    VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATIONS_PATH,
    VENDOR_PAYOUT_WEBHOOK_P2_121_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = VENDOR_PAYOUT_WEBHOOK_P2_121_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES.length ===
    VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyStripeConnectLinked &&
    legacyWebhookRouteLinked &&
    legacyConnectConfigLinked &&
    legacyVendorFinanceLinked &&
    legacyVendorApiLinked &&
    legacyInstantPayoutsLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyStripeConnectLinked,
    legacyWebhookRouteLinked,
    legacyConnectConfigLinked,
    legacyVendorFinanceLinked,
    legacyVendorApiLinked,
    legacyInstantPayoutsLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatVendorPayoutWebhookP2_121AuditLines(
  summary: VendorPayoutWebhookP2_121AuditSummary,
): string[] {
  return [
    `Vendor payout webhook audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${VENDOR_PAYOUT_WEBHOOK_P2_121_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy stripe connect linked: ${summary.legacyStripeConnectLinked ? "yes" : "no"}`,
    `Legacy webhook route linked: ${summary.legacyWebhookRouteLinked ? "yes" : "no"}`,
    `Legacy connect config linked: ${summary.legacyConnectConfigLinked ? "yes" : "no"}`,
    `Legacy vendor finance linked: ${summary.legacyVendorFinanceLinked ? "yes" : "no"}`,
    `Legacy vendor api linked: ${summary.legacyVendorApiLinked ? "yes" : "no"}`,
    `Legacy instant payouts linked: ${summary.legacyInstantPayoutsLinked ? "yes" : "no"}`,
    `Capabilities (${VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
