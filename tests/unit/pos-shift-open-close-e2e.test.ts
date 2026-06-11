import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditPosShiftOpenCloseE2E } from "@/lib/qa/pos-shift-open-close-e2e-audit";
import {
  POS_SHIFT_OPEN_CLOSE_AUDIT_SCRIPT,
  POS_SHIFT_OPEN_CLOSE_CI_WORKFLOW,
  POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID,
  POS_SHIFT_OPEN_CLOSE_E2E_SPEC,
  POS_SHIFT_OPEN_CLOSE_FLOW_STEPS,
  POS_SHIFT_OPEN_CLOSE_NPM_SCRIPT,
  POS_SHIFT_OPEN_CLOSE_UNIT_TEST,
  POS_SHIFTS_PATH,
  closedShiftHistoryShowsBalanced,
  hasPosShiftOpenCloseCredentials,
  isPosShiftOpenCloseE2EEnabled,
  parseCashSalesTotalFromPreview,
  parseExpectedCashFromPreview,
} from "@/lib/qa/pos-shift-open-close-e2e-policy";
import { computeShiftCloseout } from "@/lib/pos/pos-shift-closeout-math";

const ROOT = process.cwd();

describe("POS shift open → close E2E (P1-52)", () => {
  it("locks policy id and four-step shift lifecycle", () => {
    expect(POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID).toBe("pos-shift-open-close-e2e-v1");
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(POS_SHIFT_OPEN_CLOSE_FLOW_STEPS).toEqual([
      "open_shift",
      "cash_sale",
      "close_shift",
      "verify_history_totals",
    ]);
  });

  it("parses preview totals and validates balanced closeout math", () => {
    const preview =
      "Cash sales (2) $24.00 Opening float $50.00 Expected in drawer $74.00";
    expect(parseCashSalesTotalFromPreview(preview)).toBe(24);
    expect(parseExpectedCashFromPreview(preview)).toBe(74);

    const closeout = computeShiftCloseout({
      openingCash: 50,
      cashSalesTotals: [24],
      closingCash: 74,
    });
    expect(closeout.variance).toBe(0);
    expect(closedShiftHistoryShowsBalanced("Register A $74.00 $74.00 Balanced")).toBe(true);
  });

  it("audits E2E spec, shift flow, closeout preview, and history totals", () => {
    const summary = auditPosShiftOpenCloseE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.shiftFlowWired).toBe(true);
    expect(summary.closeoutPreviewWired).toBe(true);
    expect(summary.historyTotalsWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, POS_SHIFT_OPEN_CLOSE_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, POS_SHIFT_OPEN_CLOSE_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, POS_SHIFT_OPEN_CLOSE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[POS_SHIFT_OPEN_CLOSE_NPM_SCRIPT]).toContain(
      "audit-pos-shift-open-close-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:pos-shift-open-close-e2e"]).toContain(
      POS_SHIFT_OPEN_CLOSE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, POS_SHIFT_OPEN_CLOSE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:pos-shift-open-close-e2e");
  });

  it("E2E gate requires E2E_POS_SHIFT_OPEN_CLOSE flag", () => {
    const original = process.env.E2E_POS_SHIFT_OPEN_CLOSE;
    delete process.env.E2E_POS_SHIFT_OPEN_CLOSE;
    expect(isPosShiftOpenCloseE2EEnabled()).toBe(false);
    process.env.E2E_POS_SHIFT_OPEN_CLOSE = "true";
    expect(isPosShiftOpenCloseE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_POS_SHIFT_OPEN_CLOSE = original;
    else delete process.env.E2E_POS_SHIFT_OPEN_CLOSE;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasPosShiftOpenCloseCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
