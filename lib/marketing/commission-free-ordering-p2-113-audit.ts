import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { COMMISSION_FREE_ORDERING_P2_113_MESSAGES } from "@/lib/marketing/commission-free-ordering-p2-113-content";
import {
  COMMISSION_FREE_ORDERING_P2_113_COMPONENT,
  COMMISSION_FREE_ORDERING_P2_113_DOC,
  COMMISSION_FREE_ORDERING_P2_113_HONESTY_MARKERS,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_ORDERING,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_OWN_CHANNEL,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_PAYMENT,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_STRIPE,
  COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT,
  COMMISSION_FREE_ORDERING_P2_113_OPERATIONS_PATH,
  COMMISSION_FREE_ORDERING_P2_113_PAGE,
  COMMISSION_FREE_ORDERING_P2_113_POLICY_ID,
  COMMISSION_FREE_ORDERING_P2_113_ROUTE,
  COMMISSION_FREE_ORDERING_P2_113_SERVICE_PATH,
  COMMISSION_FREE_ORDERING_P2_113_WIRING_PATHS,
} from "@/lib/marketing/commission-free-ordering-p2-113-policy";

export type CommissionFreeOrderingP2_113AuditSummary = {
  policyId: typeof COMMISSION_FREE_ORDERING_P2_113_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyStripeLinked: boolean;
  legacyPaymentLinked: boolean;
  legacyOrderingLinked: boolean;
  legacyOwnChannelLinked: boolean;
  messageCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCommissionFreeOrderingP2_113(
  root = process.cwd(),
): CommissionFreeOrderingP2_113AuditSummary {
  const wiringComplete = COMMISSION_FREE_ORDERING_P2_113_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyStripeLinked = false;
  let legacyPaymentLinked = false;
  let legacyOrderingLinked = false;
  let legacyOwnChannelLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_DOC))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_DOC), "utf8");
    docWired =
      source.includes(COMMISSION_FREE_ORDERING_P2_113_ROUTE) &&
      source.includes(String(COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT));
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_COMPONENT))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_COMPONENT), "utf8");
    componentWired =
      source.includes("CommissionFreeOrderingPanel") &&
      source.includes("COMMISSION_FREE_ORDERING_P2_113_MESSAGES");
    allTestIdsPresent =
      source.includes("COMMISSION_FREE_ORDERING_P2_113_TEST_IDS[0]") &&
      source.includes("COMMISSION_FREE_ORDERING_P2_113_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_PAGE))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_PAGE), "utf8");
    pageWired =
      source.includes("CommissionFreeOrderingPanel") &&
      source.includes("COMMISSION_FREE_ORDERING_P2_113_POLICY_ID");
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("formatStripeFeeDisclosure") &&
      source.includes("buildStorefrontMessage") &&
      source.includes("buildStripeMessage") &&
      source.includes("buildCompareMessage") &&
      source.includes("buildCommissionFreeOrderingDemoReport");
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_SERVICE_PATH))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadCommissionFreeOrderingSnapshot") &&
      source.includes("COMMISSION_FREE_ORDERING_P2_113_POLICY_ID");
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_STRIPE))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_STRIPE), "utf8");
    legacyStripeLinked =
      source.includes("stripeReadinessSummary") && source.includes("isStripeSecretConfigured");
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_PAYMENT))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_PAYMENT), "utf8");
    legacyPaymentLinked =
      source.includes("storefrontPaymentReadiness") &&
      source.includes("isStorefrontOnlineCheckoutAvailable");
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_ORDERING))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_ORDERING), "utf8");
    legacyOrderingLinked =
      source.includes("storefrontPaymentReadiness") && source.includes("Stripe readiness");
  }

  if (existsSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_OWN_CHANNEL))) {
    const source = readFileSync(join(root, COMMISSION_FREE_ORDERING_P2_113_LEGACY_OWN_CHANNEL), "utf8");
    legacyOwnChannelLinked =
      source.includes("marketplace commission") || source.includes("Marketplace commission");
  }

  const combinedSources = [
    COMMISSION_FREE_ORDERING_P2_113_DOC,
    "lib/marketing/commission-free-ordering-p2-113-content.ts",
    COMMISSION_FREE_ORDERING_P2_113_OPERATIONS_PATH,
    COMMISSION_FREE_ORDERING_P2_113_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMMISSION_FREE_ORDERING_P2_113_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const messageCountCorrect =
    COMMISSION_FREE_ORDERING_P2_113_MESSAGES.length ===
    COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyStripeLinked &&
    legacyPaymentLinked &&
    legacyOrderingLinked &&
    legacyOwnChannelLinked &&
    messageCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: COMMISSION_FREE_ORDERING_P2_113_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyStripeLinked,
    legacyPaymentLinked,
    legacyOrderingLinked,
    legacyOwnChannelLinked,
    messageCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCommissionFreeOrderingP2_113AuditLines(
  summary: CommissionFreeOrderingP2_113AuditSummary,
): string[] {
  return [
    `Commission-free ordering audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${COMMISSION_FREE_ORDERING_P2_113_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${COMMISSION_FREE_ORDERING_P2_113_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy Stripe linked: ${summary.legacyStripeLinked ? "yes" : "no"}`,
    `Legacy payment linked: ${summary.legacyPaymentLinked ? "yes" : "no"}`,
    `Legacy ordering linked: ${summary.legacyOrderingLinked ? "yes" : "no"}`,
    `Legacy own-channel linked: ${summary.legacyOwnChannelLinked ? "yes" : "no"}`,
    `Messages (${COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT}): ${summary.messageCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
