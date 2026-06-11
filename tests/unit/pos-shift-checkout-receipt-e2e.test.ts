import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditPosShiftCheckoutReceiptE2E } from "@/lib/pos/pos-shift-checkout-receipt-e2e-audit";
import {
  POS_RECEIPT_PANEL_TEST_ID,
  POS_SHIFT_CHECKOUT_RECEIPT_AUDIT_SCRIPT,
  POS_SHIFT_CHECKOUT_RECEIPT_CI_WORKFLOW,
  POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID,
  POS_SHIFT_CHECKOUT_RECEIPT_E2E_SPEC,
  POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS,
  POS_SHIFT_CHECKOUT_RECEIPT_NPM_SCRIPT,
  POS_SHIFT_CHECKOUT_RECEIPT_UNIT_TEST,
  POS_SHIFTS_PATH,
  POS_TERMINAL_PATH,
  hasPosShiftCheckoutReceiptCredentials,
  parsePosReceiptCheckoutStatus,
} from "@/lib/pos/pos-shift-checkout-receipt-e2e-policy";
import { receiptTotalsConsistent } from "@/lib/pos/pos-shift-closeout-math";

const ROOT = process.cwd();

describe("POS shift → checkout → receipt E2E (P1-42)", () => {
  it("locks policy id and money path routes", () => {
    expect(POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID).toBe(
      "pos-shift-checkout-receipt-e2e-v1",
    );
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(POS_RECEIPT_PANEL_TEST_ID).toBe("pos-receipt-panel");
    expect(POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS).toHaveLength(4);
  });

  it("parses checkout receipt status with order prefix and receipt ref", () => {
    const parsed = parsePosReceiptCheckoutStatus(
      "Sale complete — order deadbeef… receipt R-9001",
    );
    expect(parsed.saleComplete).toBe(true);
    expect(parsed.orderPrefix).toBe("deadbeef");
    expect(parsed.receiptRef).toBe("R-9001");
  });

  it("receipt line totals reconcile to subtotal", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 25,
        discount: 2.5,
        tax: 1.8,
        total: 24.3,
        lineTotals: [15, 10],
      }),
    ).toBe(true);
  });

  it("audits E2E spec, flow helper, and receipt panel wiring", () => {
    const summary = auditPosShiftCheckoutReceiptE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.receiptPanelWired).toBe(true);
    expect(summary.terminalPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, POS_SHIFT_CHECKOUT_RECEIPT_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, POS_SHIFT_CHECKOUT_RECEIPT_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, POS_SHIFT_CHECKOUT_RECEIPT_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[POS_SHIFT_CHECKOUT_RECEIPT_NPM_SCRIPT]).toContain(
      "audit-pos-shift-checkout-receipt-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:pos-shift-checkout-receipt-e2e"]).toContain(
      POS_SHIFT_CHECKOUT_RECEIPT_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, POS_SHIFT_CHECKOUT_RECEIPT_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:pos-shift-checkout-receipt-e2e");
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasPosShiftCheckoutReceiptCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
