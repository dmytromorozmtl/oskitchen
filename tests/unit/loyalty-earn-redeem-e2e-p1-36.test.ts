import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLoyaltyEarnRedeemE2EP136,
  formatLoyaltyEarnRedeemE2EP136AuditLines,
  readLoyaltyEarnRedeemE2EP136Artifact,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-p1-36-audit";
import {
  CRM_LOYALTY_POINTS_TEST_ID,
  LOYALTY_EARN_REDEEM_E2E_P1_36_ARTIFACT,
  LOYALTY_EARN_REDEEM_E2E_P1_36_CHAIN,
  LOYALTY_EARN_REDEEM_E2E_P1_36_CHECK_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_E2E_P1_36_CI_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_E2E_P1_36_CI_WORKFLOW,
  LOYALTY_EARN_REDEEM_E2E_P1_36_DOC,
  LOYALTY_EARN_REDEEM_E2E_P1_36_E2E_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID,
  LOYALTY_EARN_REDEEM_E2E_P1_36_WIRING_PATHS,
  LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-p1-36-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Loyalty earn→redeem E2E (P1-36)", () => {
  it("locks P1-36 policy and order→points→CRM→apply_next chain", () => {
    expect(LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID).toBe(
      "loyalty-earn-redeem-e2e-p1-36-v1",
    );
    expect(LOYALTY_EARN_REDEEM_E2E_P1_36_CHAIN).toEqual([
      "order",
      "points",
      "crm",
      "apply_next",
    ]);
    expect(LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS).toEqual([
      "seed_customer",
      "place_order_earn",
      "verify_crm_points",
      "redeem_next_order",
      "verify_balance_updated",
    ]);
    expect(CRM_LOYALTY_POINTS_TEST_ID).toBe("crm-loyalty-points-balance");
  });

  it("passes full P1-36 audit — E2E spec, CRM panel, artifact wired", () => {
    const summary = auditLoyaltyEarnRedeemE2EP136(ROOT);
    expect(summary.baseAuditPassed).toBe(true);
    expect(summary.crmPointsWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("CRM unified profile panel exposes loyalty points test id", () => {
    const panel = readSource("components/crm/unified-customer-profile-panel.tsx");
    expect(panel).toContain(CRM_LOYALTY_POINTS_TEST_ID);
    expect(panel).toContain("Loyalty points");
  });

  it("flow helper visits CRM profile after earn", () => {
    const flow = readSource("e2e/helpers/loyalty-earn-redeem-e2e-flow.ts");
    expect(flow).toContain("verify_crm_points");
    expect(flow).toContain("CRM_UNIFIED_PROFILE_PATH");
    expect(flow).toContain("redeem_next_order");
  });

  it("P1-36 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of LOYALTY_EARN_REDEEM_E2E_P1_36_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${LOYALTY_EARN_REDEEM_E2E_P1_36_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${LOYALTY_EARN_REDEEM_E2E_P1_36_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${LOYALTY_EARN_REDEEM_E2E_P1_36_E2E_NPM_SCRIPT}"`);

    const ci = readSource(LOYALTY_EARN_REDEEM_E2E_P1_36_CI_WORKFLOW);
    expect(ci).toContain(LOYALTY_EARN_REDEEM_E2E_P1_36_CHECK_NPM_SCRIPT);

    const doc = readSource(LOYALTY_EARN_REDEEM_E2E_P1_36_DOC);
    expect(doc).toContain(LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID);

    const artifact = readLoyaltyEarnRedeemE2EP136Artifact(ROOT);
    expect(artifact?.policyId).toBe(LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID);
    expect(artifact?.chain).toEqual([...LOYALTY_EARN_REDEEM_E2E_P1_36_CHAIN]);

    expect(existsSync(join(ROOT, LOYALTY_EARN_REDEEM_E2E_P1_36_ARTIFACT))).toBe(true);
  });

  it("formats audit lines", () => {
    const summary = auditLoyaltyEarnRedeemE2EP136(ROOT);
    const lines = formatLoyaltyEarnRedeemE2EP136AuditLines(summary);
    expect(lines.some((line) => line.includes(LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
