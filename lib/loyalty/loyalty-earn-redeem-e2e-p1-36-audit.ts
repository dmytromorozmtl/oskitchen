import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditLoyaltyEarnRedeemE2E } from "@/lib/loyalty/loyalty-earn-redeem-e2e-audit";
import {
  LOYALTY_EARN_REDEEM_E2E_P1_36_ARTIFACT,
  LOYALTY_EARN_REDEEM_E2E_P1_36_CHAIN,
  LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-p1-36-policy";
import {
  CRM_LOYALTY_POINTS_TEST_ID,
  LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-policy";

export type LoyaltyEarnRedeemE2EP136AuditSummary = {
  policyId: typeof LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID;
  chain: readonly string[];
  flowSteps: readonly string[];
  crmTestId: string;
  baseAuditPassed: boolean;
  crmPointsWired: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditLoyaltyEarnRedeemE2EP136(
  root = process.cwd(),
): LoyaltyEarnRedeemE2EP136AuditSummary {
  const base = auditLoyaltyEarnRedeemE2E(root);
  const artifactPresent = existsSync(join(root, LOYALTY_EARN_REDEEM_E2E_P1_36_ARTIFACT));

  const crmPanelPath = join(root, "components/crm/unified-customer-profile-panel.tsx");
  const crmPanelHasTestId =
    existsSync(crmPanelPath) &&
    readFileSync(crmPanelPath, "utf8").includes(CRM_LOYALTY_POINTS_TEST_ID);

  const flowStepsMatch =
    LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS.includes("place_order_earn") &&
    LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS.includes("verify_crm_points") &&
    LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS.includes("redeem_next_order");

  const passed =
    base.passed &&
    base.crmPointsWired &&
    crmPanelHasTestId &&
    flowStepsMatch &&
    artifactPresent &&
    LOYALTY_EARN_REDEEM_E2E_P1_36_CHAIN.length === 4;

  return {
    policyId: LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID,
    chain: LOYALTY_EARN_REDEEM_E2E_P1_36_CHAIN,
    flowSteps: LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
    crmTestId: CRM_LOYALTY_POINTS_TEST_ID,
    baseAuditPassed: base.passed,
    crmPointsWired: base.crmPointsWired,
    artifactPresent,
    passed,
  };
}

export function formatLoyaltyEarnRedeemE2EP136AuditLines(
  summary: LoyaltyEarnRedeemE2EP136AuditSummary,
): string[] {
  return [
    `Loyalty earn/redeem E2E (P1-36) audit (${summary.policyId})`,
    `Chain: ${summary.chain.join(" → ")}`,
    `Flow steps: ${summary.flowSteps.join(" → ")}`,
    `CRM test id: ${summary.crmTestId}`,
    `Base E2E audit: ${summary.baseAuditPassed ? "passed" : "failed"}`,
    `CRM points wired: ${summary.crmPointsWired ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

export function readLoyaltyEarnRedeemE2EP136Artifact(root = process.cwd()): {
  policyId: string;
  chain: string[];
  flowSteps: string[];
} | null {
  const path = join(root, LOYALTY_EARN_REDEEM_E2E_P1_36_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    policyId: string;
    chain: string[];
    flowSteps: string[];
  };
}
