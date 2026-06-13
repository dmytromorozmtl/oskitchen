import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeStorefrontLoyaltyEarnPoints,
  quoteStorefrontLoyaltyRedeemCredit,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-measurement";
import {
  LOYALTY_EARN_REDEEM_P2_41_BALANCE_ROUTE,
  LOYALTY_EARN_REDEEM_P2_41_BALANCE_TEST_ID,
  LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_CLIENT,
  LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_PANEL,
  LOYALTY_EARN_REDEEM_P2_41_DOC,
  LOYALTY_EARN_REDEEM_P2_41_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_P2_41_HONESTY_MARKERS,
  LOYALTY_EARN_REDEEM_P2_41_POLICY_ID,
  LOYALTY_EARN_REDEEM_P2_41_REDEEM_ROUTE,
  LOYALTY_EARN_REDEEM_P2_41_REDEEM_TEST_ID,
  LOYALTY_EARN_REDEEM_P2_41_SERVICE,
  LOYALTY_EARN_REDEEM_P2_41_STOREFRONT_ORDER,
  LOYALTY_EARN_REDEEM_P2_41_STRIPE_HOOK,
  LOYALTY_EARN_REDEEM_P2_41_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-policy";

export type LoyaltyEarnRedeemP2_41AuditSummary = {
  policyId: typeof LOYALTY_EARN_REDEEM_P2_41_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  serviceWired: boolean;
  checkoutPanelWired: boolean;
  checkoutClientWired: boolean;
  storefrontOrderWired: boolean;
  stripeHookWired: boolean;
  balanceRouteWired: boolean;
  redeemRouteWired: boolean;
  goldenEarnRedeemOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditLoyaltyEarnRedeemP2_41(
  root = process.cwd(),
): LoyaltyEarnRedeemP2_41AuditSummary {
  const wiringComplete = LOYALTY_EARN_REDEEM_P2_41_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_DOC))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_41_DOC), "utf8");
    docWired =
      source.includes("storefront") &&
      source.includes("earn") &&
      source.includes("redeem") &&
      source.includes("Square parity");
  }

  let serviceWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_SERVICE))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_41_SERVICE), "utf8");
    serviceWired =
      source.includes("earnStorefrontLoyaltyPoints") &&
      source.includes("redeemLoyaltyPoints") &&
      source.includes("restoreStorefrontLoyaltyRedeem");
  }

  let checkoutPanelWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_PANEL))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_PANEL), "utf8");
    checkoutPanelWired =
      source.includes(LOYALTY_EARN_REDEEM_P2_41_BALANCE_TEST_ID) &&
      source.includes(LOYALTY_EARN_REDEEM_P2_41_REDEEM_TEST_ID);
  }

  let checkoutClientWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_CLIENT))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_CLIENT), "utf8");
    checkoutClientWired =
      source.includes("StorefrontLoyaltyCheckoutPanel") &&
      source.includes("loyaltyPointsRedeem");
  }

  let storefrontOrderWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_STOREFRONT_ORDER))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_41_STOREFRONT_ORDER), "utf8");
    storefrontOrderWired =
      source.includes("earnStorefrontLoyaltyPoints") &&
      source.includes("redeemLoyaltyPoints") &&
      source.includes("loyaltyPointsRedeem");
  }

  let stripeHookWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_STRIPE_HOOK))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_41_STRIPE_HOOK), "utf8");
    stripeHookWired = source.includes("earnStorefrontLoyaltyPoints");
  }

  const balanceRouteWired = existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_BALANCE_ROUTE));
  const redeemRouteWired = existsSync(join(root, LOYALTY_EARN_REDEEM_P2_41_REDEEM_ROUTE));

  const earn = computeStorefrontLoyaltyEarnPoints(25, { pointsPerDollar: 2, isActive: true });
  const redeem = quoteStorefrontLoyaltyRedeemCredit(400, {
    redeemPoints: 200,
    redeemAmount: 5,
    minPointsToRedeem: 200,
  });
  const goldenEarnRedeemOk =
    earn === 50 && redeem.ok === true && redeem.creditAmount === 10 && redeem.pointsUsed === 400;

  const combined = [LOYALTY_EARN_REDEEM_P2_41_DOC, LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_PANEL]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = LOYALTY_EARN_REDEEM_P2_41_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    serviceWired &&
    checkoutPanelWired &&
    checkoutClientWired &&
    storefrontOrderWired &&
    stripeHookWired &&
    balanceRouteWired &&
    redeemRouteWired &&
    goldenEarnRedeemOk &&
    honestyMarkersPresent &&
    LOYALTY_EARN_REDEEM_P2_41_FLOW_STEPS.length === 4;

  return {
    policyId: LOYALTY_EARN_REDEEM_P2_41_POLICY_ID,
    wiringComplete,
    docWired,
    serviceWired,
    checkoutPanelWired,
    checkoutClientWired,
    storefrontOrderWired,
    stripeHookWired,
    balanceRouteWired,
    redeemRouteWired,
    goldenEarnRedeemOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatLoyaltyEarnRedeemP2_41AuditLines(
  summary: LoyaltyEarnRedeemP2_41AuditSummary,
): string[] {
  return [
    `Loyalty earn/redeem audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${LOYALTY_EARN_REDEEM_P2_41_DOC})`,
    `Loyalty service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Checkout panel: ${summary.checkoutPanelWired ? "wired" : "missing"}`,
    `Checkout client: ${summary.checkoutClientWired ? "wired" : "missing"}`,
    `Storefront order action: ${summary.storefrontOrderWired ? "wired" : "missing"}`,
    `Stripe paid hook: ${summary.stripeHookWired ? "wired" : "missing"}`,
    `Balance route: ${summary.balanceRouteWired ? "yes" : "no"}`,
    `Redeem route: ${summary.redeemRouteWired ? "yes" : "no"}`,
    `Golden earn/redeem: ${summary.goldenEarnRedeemOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
