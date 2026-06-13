import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditPosCheckoutE2E } from "@/lib/pos/pos-checkout-e2e-audit";
import {
  POS_CHECKOUT_E2E_AUDIT_SCRIPT,
  POS_CHECKOUT_E2E_CI_WORKFLOW,
  POS_CHECKOUT_E2E_FLOW_STEPS,
  POS_CHECKOUT_E2E_NPM_SCRIPT,
  POS_CHECKOUT_E2E_POLICY_ID,
  POS_CHECKOUT_E2E_SPEC,
  POS_CHECKOUT_E2E_UNIT_TEST,
  POS_SHIFTS_PATH,
  POS_TERMINAL_PATH,
  hasPosCheckoutE2ECredentials,
  isPosCheckoutE2EEnabled,
  parsePosReceiptCheckoutStatus,
} from "@/lib/pos/pos-checkout-e2e-policy";

const ROOT = process.cwd();

describe("POS checkout E2E full scenario (P1-20)", () => {
  it("locks policy id and eight-step money path", () => {
    expect(POS_CHECKOUT_E2E_POLICY_ID).toBe("pos-checkout-e2e-p1-20-v1");
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toHaveLength(8);
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("apply_discount");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("refund");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("void_sale");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toContain("close_shift");
  });

  it("parses receipt status after discounted checkout", () => {
    const parsed = parsePosReceiptCheckoutStatus(
      "Sale complete — order deadbeef… receipt R-9001",
    );
    expect(parsed.saleComplete).toBe(true);
    expect(parsed.orderPrefix).toBe("deadbeef");
    expect(parsed.receiptRef).toBe("R-9001");
  });

  it("audits E2E spec, discount, refund/void, and close shift wiring", () => {
    const summary = auditPosCheckoutE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.shiftFlowWired).toBe(true);
    expect(summary.discountWired).toBe(true);
    expect(summary.refundVoidWired).toBe(true);
    expect(summary.closeShiftWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, POS_CHECKOUT_E2E_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, POS_CHECKOUT_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, POS_CHECKOUT_E2E_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[POS_CHECKOUT_E2E_NPM_SCRIPT]).toContain("audit-pos-checkout-e2e.ts");
    expect(pkg.scripts?.["check:pos-checkout-e2e"]).toContain(POS_CHECKOUT_E2E_UNIT_TEST);
    expect(pkg.scripts?.["test:e2e:pos-checkout-e2e"]).toContain(POS_CHECKOUT_E2E_SPEC);

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:pos-checkout-e2e"]).toContain(POS_CHECKOUT_E2E_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, POS_CHECKOUT_E2E_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("pos-checkout-e2e");
  });

  it("E2E gate requires E2E_POS_CHECKOUT flag", () => {
    const original = process.env.E2E_POS_CHECKOUT;
    delete process.env.E2E_POS_CHECKOUT;
    expect(isPosCheckoutE2EEnabled()).toBe(false);
    process.env.E2E_POS_CHECKOUT = "true";
    expect(isPosCheckoutE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_POS_CHECKOUT = original;
    else delete process.env.E2E_POS_CHECKOUT;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasPosCheckoutE2ECredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
