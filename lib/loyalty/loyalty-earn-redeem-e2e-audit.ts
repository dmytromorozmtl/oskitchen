import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOYALTY_EARN_REDEEM_E2E_FLOW_HELPER,
  LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_E2E_POLICY_ID,
  LOYALTY_EARN_REDEEM_E2E_READY_HELPER,
  LOYALTY_EARN_REDEEM_E2E_SPEC,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-policy";

export type LoyaltyEarnRedeemE2EAuditSummary = {
  policyId: typeof LOYALTY_EARN_REDEEM_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  earnRedeemWired: boolean;
  balanceAssertWired: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditLoyaltyEarnRedeemE2E(root = process.cwd()): LoyaltyEarnRedeemE2EAuditSummary {
  const specPath = join(root, LOYALTY_EARN_REDEEM_E2E_SPEC);
  const flowPath = join(root, LOYALTY_EARN_REDEEM_E2E_FLOW_HELPER);
  const readyPath = join(root, LOYALTY_EARN_REDEEM_E2E_READY_HELPER);

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let earnRedeemWired = false;
  let balanceAssertWired = false;

  if (flowHelperPresent) {
    const source = readFileSync(flowPath, "utf8");
    earnRedeemWired =
      source.includes("completePosCashSale") &&
      source.includes("LOYALTY_REDEEM_INPUT_TEST_ID");
    balanceAssertWired =
      source.includes("getLoyaltyBalance") &&
      source.includes("LOYALTY_BALANCE_TEST_ID");
  }

  const specReferencesPolicy =
    specPresent &&
    readFileSync(specPath, "utf8").includes(LOYALTY_EARN_REDEEM_E2E_POLICY_ID);

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    earnRedeemWired &&
    balanceAssertWired &&
    specReferencesPolicy &&
    LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS.length === 5;

  return {
    policyId: LOYALTY_EARN_REDEEM_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    earnRedeemWired,
    balanceAssertWired,
    flowStepCount: LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS.length,
    passed,
  };
}

export function formatLoyaltyEarnRedeemE2EAuditLines(
  summary: LoyaltyEarnRedeemE2EAuditSummary,
): string[] {
  return [
    `Loyalty earn/redeem E2E audit (${summary.policyId})`,
    `Spec (${LOYALTY_EARN_REDEEM_E2E_SPEC}): ${summary.specPresent ? "yes" : "no"}`,
    `Flow helper: ${summary.flowHelperPresent ? "yes" : "no"}`,
    `Ready helper: ${summary.readyHelperPresent ? "yes" : "no"}`,
    `Earn + redeem wired: ${summary.earnRedeemWired ? "yes" : "no"}`,
    `Balance assert wired: ${summary.balanceAssertWired ? "yes" : "no"}`,
    `Flow steps (${summary.flowStepCount}): ${summary.flowStepCount === 5 ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
