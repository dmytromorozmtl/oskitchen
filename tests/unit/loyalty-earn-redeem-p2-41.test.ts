import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLoyaltyEarnRedeemP2_41,
  formatLoyaltyEarnRedeemP2_41AuditLines,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-audit";
import {
  computeStorefrontLoyaltyEarnPoints,
  quoteStorefrontLoyaltyRedeemCredit,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-measurement";
import {
  LOYALTY_EARN_REDEEM_P2_41_AUDIT_SCRIPT,
  LOYALTY_EARN_REDEEM_P2_41_CHECK_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_P2_41_CI_WORKFLOW,
  LOYALTY_EARN_REDEEM_P2_41_DOC,
  LOYALTY_EARN_REDEEM_P2_41_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_P2_41_POLICY_ID,
  LOYALTY_EARN_REDEEM_P2_41_UNIT_TEST,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-policy";

const ROOT = process.cwd();

describe("Loyalty earn/redeem storefront (P2-41)", () => {
  it("locks policy id and earn/redeem math", () => {
    expect(LOYALTY_EARN_REDEEM_P2_41_POLICY_ID).toBe("loyalty-earn-redeem-p2-41-v1");
    expect(computeStorefrontLoyaltyEarnPoints(10, { pointsPerDollar: 1.5, isActive: true })).toBe(15);
    expect(computeStorefrontLoyaltyEarnPoints(10, { pointsPerDollar: 1.5, isActive: false })).toBe(0);

    const redeem = quoteStorefrontLoyaltyRedeemCredit(450, {
      redeemPoints: 200,
      redeemAmount: 5,
      minPointsToRedeem: 200,
    });
    expect(redeem.ok).toBe(true);
    if (redeem.ok) {
      expect(redeem.pointsUsed).toBe(400);
      expect(redeem.creditAmount).toBe(10);
    }
  });

  it("passes full loyalty earn/redeem audit", () => {
    const summary = auditLoyaltyEarnRedeemP2_41(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.checkoutPanelWired).toBe(true);
    expect(summary.checkoutClientWired).toBe(true);
    expect(summary.storefrontOrderWired).toBe(true);
    expect(summary.stripeHookWired).toBe(true);
    expect(summary.goldenEarnRedeemOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatLoyaltyEarnRedeemP2_41AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, LOYALTY_EARN_REDEEM_P2_41_DOC))).toBe(true);
    expect(existsSync(join(ROOT, LOYALTY_EARN_REDEEM_P2_41_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, LOYALTY_EARN_REDEEM_P2_41_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LOYALTY_EARN_REDEEM_P2_41_NPM_SCRIPT]).toContain(
      "audit-loyalty-earn-redeem-p2-41.ts",
    );
    expect(pkg.scripts?.[LOYALTY_EARN_REDEEM_P2_41_CHECK_NPM_SCRIPT]).toContain(
      LOYALTY_EARN_REDEEM_P2_41_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, LOYALTY_EARN_REDEEM_P2_41_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("loyalty-earn-redeem-p2-41");
  });
});
