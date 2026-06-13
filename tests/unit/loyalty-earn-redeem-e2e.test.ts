import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLoyaltyEarnRedeemE2E,
  formatLoyaltyEarnRedeemE2EAuditLines,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-audit";
import {
  LOYALTY_EARN_REDEEM_E2E_AUDIT_SCRIPT,
  LOYALTY_EARN_REDEEM_E2E_CI_WORKFLOW,
  LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_E2E_NPM_SCRIPT,
  LOYALTY_EARN_REDEEM_E2E_POLICY_ID,
  LOYALTY_EARN_REDEEM_E2E_SPEC,
  LOYALTY_EARN_REDEEM_E2E_UNIT_TEST,
  LOYALTY_BALANCE_TEST_ID,
  LOYALTY_REDEEM_INPUT_TEST_ID,
  hasLoyaltyEarnRedeemE2ECredentials,
  isLoyaltyEarnRedeemE2EEnabled,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-policy";

const ROOT = process.cwd();

describe("Loyalty earn/redeem E2E (P2-31)", () => {
  it("locks policy id and five-step earn → redeem flow", () => {
    expect(LOYALTY_EARN_REDEEM_E2E_POLICY_ID).toBe("loyalty-earn-redeem-e2e-p2-31-v1");
    expect(LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS).toHaveLength(5);
    expect(LOYALTY_REDEEM_INPUT_TEST_ID).toBe("pos-loyalty-redeem-input");
    expect(LOYALTY_BALANCE_TEST_ID).toBe("pos-loyalty-balance");
  });

  it("audits E2E spec, flow helper, and balance wiring", () => {
    const summary = auditLoyaltyEarnRedeemE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.readyHelperPresent).toBe(true);
    expect(summary.earnRedeemWired).toBe(true);
    expect(summary.balanceAssertWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, LOYALTY_EARN_REDEEM_E2E_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, LOYALTY_EARN_REDEEM_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, LOYALTY_EARN_REDEEM_E2E_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LOYALTY_EARN_REDEEM_E2E_NPM_SCRIPT]).toContain(
      "audit-loyalty-earn-redeem-e2e.ts",
    );
    expect(pkg.scripts?.["check:loyalty-earn-redeem-e2e"]).toContain(
      LOYALTY_EARN_REDEEM_E2E_UNIT_TEST,
    );
    expect(pkg.scripts?.["test:e2e:loyalty-earn-redeem-e2e"]).toContain(
      LOYALTY_EARN_REDEEM_E2E_SPEC,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:loyalty-earn-redeem-e2e"]).toContain(
      LOYALTY_EARN_REDEEM_E2E_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, LOYALTY_EARN_REDEEM_E2E_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("loyalty-earn-redeem-e2e");
  });

  it("formats audit lines", () => {
    const summary = auditLoyaltyEarnRedeemE2E(ROOT);
    const lines = formatLoyaltyEarnRedeemE2EAuditLines(summary);
    expect(lines.some((line) => line.includes(LOYALTY_EARN_REDEEM_E2E_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });

  it("E2E gate requires E2E_LOYALTY_EARN_REDEEM flag", () => {
    const original = process.env.E2E_LOYALTY_EARN_REDEEM;
    delete process.env.E2E_LOYALTY_EARN_REDEEM;
    expect(isLoyaltyEarnRedeemE2EEnabled()).toBe(false);
    process.env.E2E_LOYALTY_EARN_REDEEM = "true";
    expect(isLoyaltyEarnRedeemE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_LOYALTY_EARN_REDEEM = original;
    else delete process.env.E2E_LOYALTY_EARN_REDEEM;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasLoyaltyEarnRedeemE2ECredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
