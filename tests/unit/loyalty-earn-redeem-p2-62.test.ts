import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLoyaltyEarnRedeemP262,
  formatLoyaltyEarnRedeemP262AuditLines,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-62-audit";
import {
  LOYALTY_EARN_REDEEM_P2_62_ARTIFACT,
  LOYALTY_EARN_REDEEM_P2_62_CHECK_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_P2_62_CI_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_P2_62_CI_WORKFLOW,
  LOYALTY_EARN_REDEEM_P2_62_DOC,
  LOYALTY_EARN_REDEEM_P2_62_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_P2_62_LIVE_ROUTES,
  LOYALTY_EARN_REDEEM_P2_62_POLICY_ID,
  LOYALTY_EARN_REDEEM_P2_62_UNIT_TEST,
  LOYALTY_EARN_REDEEM_P2_62_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-62-policy";
import { getNavMaturityExposure } from "@/lib/navigation/nav-maturity-governance";
import { isNavAuditSuppressedHref } from "@/lib/navigation/nav-audit-suppressed-prefixes";

const ROOT = process.cwd();

describe("Loyalty earn/redeem LIVE — POS + storefront (P2-62)", () => {
  it("locks P2-62 policy, LIVE routes, and flow steps", () => {
    expect(LOYALTY_EARN_REDEEM_P2_62_POLICY_ID).toBe("loyalty-earn-redeem-p2-62-v1");
    expect(LOYALTY_EARN_REDEEM_P2_62_LIVE_ROUTES).toHaveLength(2);
    expect(LOYALTY_EARN_REDEEM_P2_62_FLOW_STEPS).toEqual([
      "pos_redeem_at_checkout",
      "pos_earn_on_sale",
      "storefront_earn_redeem",
      "crm_balance_sync",
    ]);
  });

  it("promotes loyalty routes from preview to default nav exposure", () => {
    for (const route of LOYALTY_EARN_REDEEM_P2_62_LIVE_ROUTES) {
      expect(getNavMaturityExposure(route)).toBe("default");
      expect(isNavAuditSuppressedHref(route)).toBe(false);
    }
  });

  it("passes full P2-62 loyalty earn/redeem LIVE audit", () => {
    const summary = auditLoyaltyEarnRedeemP262(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.posCheckoutWired).toBe(true);
    expect(summary.posActionWired).toBe(true);
    expect(summary.posPaymentPanelWired).toBe(true);
    expect(summary.loyaltyServiceWired).toBe(true);
    expect(summary.loyaltyNavLive).toBe(true);
    expect(summary.loyaltyNotSuppressed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-62 wiring paths, CI gate, and artifact", () => {
    for (const path of LOYALTY_EARN_REDEEM_P2_62_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LOYALTY_EARN_REDEEM_P2_62_CHECK_NPM_SCRIPT]).toContain(
      LOYALTY_EARN_REDEEM_P2_62_UNIT_TEST,
    );
    expect(pkg.scripts?.[LOYALTY_EARN_REDEEM_P2_62_CI_NPM_SCRIPT]).toContain(
      LOYALTY_EARN_REDEEM_P2_62_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, LOYALTY_EARN_REDEEM_P2_62_CI_WORKFLOW), "utf8");
    expect(ci).toContain(LOYALTY_EARN_REDEEM_P2_62_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, LOYALTY_EARN_REDEEM_P2_62_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(LOYALTY_EARN_REDEEM_P2_62_POLICY_ID);
    expect(artifact.status).toBe("LIVE");

    const doc = readFileSync(join(ROOT, LOYALTY_EARN_REDEEM_P2_62_DOC), "utf8");
    expect(doc).toContain(LOYALTY_EARN_REDEEM_P2_62_POLICY_ID);
    expect(doc).toContain("Square parity");
  });

  it("formats audit lines", () => {
    const summary = auditLoyaltyEarnRedeemP262(ROOT);
    const lines = formatLoyaltyEarnRedeemP262AuditLines(summary);
    expect(lines.some((line) => line.includes(LOYALTY_EARN_REDEEM_P2_62_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
