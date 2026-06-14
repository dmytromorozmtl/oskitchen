import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isNavAuditSuppressedHref } from "@/lib/navigation/nav-audit-suppressed-prefixes";
import { getNavMaturityExposure } from "@/lib/navigation/nav-maturity-governance";
import {
  LOYALTY_EARN_REDEEM_P2_62_DOC,
  LOYALTY_EARN_REDEEM_P2_62_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_P2_62_LIVE_ROUTES,
  LOYALTY_EARN_REDEEM_P2_62_LOYALTY_SERVICE,
  LOYALTY_EARN_REDEEM_P2_62_POLICY_ID,
  LOYALTY_EARN_REDEEM_P2_62_POS_ACTION,
  LOYALTY_EARN_REDEEM_P2_62_POS_BALANCE_TEST_ID,
  LOYALTY_EARN_REDEEM_P2_62_POS_CHECKOUT_SERVICE,
  LOYALTY_EARN_REDEEM_P2_62_POS_PAYMENT_PANEL,
  LOYALTY_EARN_REDEEM_P2_62_POS_REDEEM_TEST_ID,
  LOYALTY_EARN_REDEEM_P2_62_SQUARE_PARITY_NOTE,
  LOYALTY_EARN_REDEEM_P2_62_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-62-policy";

export type LoyaltyEarnRedeemP262AuditSummary = {
  policyId: typeof LOYALTY_EARN_REDEEM_P2_62_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  posCheckoutWired: boolean;
  posActionWired: boolean;
  posPaymentPanelWired: boolean;
  loyaltyServiceWired: boolean;
  loyaltyNavLive: boolean;
  loyaltyNotSuppressed: boolean;
  passed: boolean;
};

export function auditLoyaltyEarnRedeemP262(root = process.cwd()): LoyaltyEarnRedeemP262AuditSummary {
  const wiringComplete = LOYALTY_EARN_REDEEM_P2_62_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_62_DOC))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_62_DOC), "utf8");
    docWired =
      source.includes(LOYALTY_EARN_REDEEM_P2_62_POLICY_ID) &&
      source.includes("Square parity") &&
      source.includes("LIVE") &&
      source.includes("POS");
  }

  let posCheckoutWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_62_POS_CHECKOUT_SERVICE))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_62_POS_CHECKOUT_SERVICE), "utf8");
    posCheckoutWired =
      source.includes("redeemLoyaltyPoints") &&
      source.includes("earnLoyaltyPointsForOrder") &&
      source.includes("loyaltyPointsRedeem");
  }

  let posActionWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_62_POS_ACTION))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_62_POS_ACTION), "utf8");
    posActionWired = source.includes("loyaltyPointsRedeem");
  }

  let posPaymentPanelWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_62_POS_PAYMENT_PANEL))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_62_POS_PAYMENT_PANEL), "utf8");
    posPaymentPanelWired =
      source.includes(LOYALTY_EARN_REDEEM_P2_62_POS_REDEEM_TEST_ID) &&
      source.includes(LOYALTY_EARN_REDEEM_P2_62_POS_BALANCE_TEST_ID);
  }

  let loyaltyServiceWired = false;
  if (existsSync(join(root, LOYALTY_EARN_REDEEM_P2_62_LOYALTY_SERVICE))) {
    const source = readFileSync(join(root, LOYALTY_EARN_REDEEM_P2_62_LOYALTY_SERVICE), "utf8");
    loyaltyServiceWired =
      source.includes("earnLoyaltyPointsForOrder") && source.includes("redeemLoyaltyPoints");
  }

  const loyaltyNavLive = LOYALTY_EARN_REDEEM_P2_62_LIVE_ROUTES.every(
    (route) => getNavMaturityExposure(route) === "default",
  );

  const loyaltyNotSuppressed = LOYALTY_EARN_REDEEM_P2_62_LIVE_ROUTES.every(
    (route) => !isNavAuditSuppressedHref(route),
  );

  const passed =
    wiringComplete &&
    docWired &&
    posCheckoutWired &&
    posActionWired &&
    posPaymentPanelWired &&
    loyaltyServiceWired &&
    loyaltyNavLive &&
    loyaltyNotSuppressed &&
    LOYALTY_EARN_REDEEM_P2_62_FLOW_STEPS.length === 4;

  return {
    policyId: LOYALTY_EARN_REDEEM_P2_62_POLICY_ID,
    wiringComplete,
    docWired,
    posCheckoutWired,
    posActionWired,
    posPaymentPanelWired,
    loyaltyServiceWired,
    loyaltyNavLive,
    loyaltyNotSuppressed,
    passed,
  };
}

export function formatLoyaltyEarnRedeemP262AuditLines(
  summary: LoyaltyEarnRedeemP262AuditSummary,
): string[] {
  return [
    `Loyalty earn/redeem LIVE (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `POS checkout: ${summary.posCheckoutWired ? "wired" : "missing"}`,
    `POS action: ${summary.posActionWired ? "wired" : "missing"}`,
    `POS payment panel: ${summary.posPaymentPanelWired ? "wired" : "missing"}`,
    `Loyalty service: ${summary.loyaltyServiceWired ? "wired" : "missing"}`,
    `Nav LIVE (default): ${summary.loyaltyNavLive ? "yes" : "no"}`,
    `Not suppressed: ${summary.loyaltyNotSuppressed ? "yes" : "no"}`,
    `Square parity: ${LOYALTY_EARN_REDEEM_P2_62_SQUARE_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
