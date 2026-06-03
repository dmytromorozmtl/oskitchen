import { expect, test } from "@playwright/test";

import {
  POS_CHECKOUT_SHIFT_REPORT_E2E_POLICY_ID,
  POS_SHIFTS_PATH,
  POS_TERMINAL_PATH,
  posShiftHistoryRowTestId,
} from "@/lib/pos/pos-checkout-shift-report-e2e-policy";

import {
  assertClosedShiftReport,
  closeShiftWithExpectedCash,
  completePosCashSale,
  ensureOpenShift,
  preparePosTerminal,
} from "./helpers/pos-checkout-shift-flow";
import { skipPosCheckoutShiftIfNotAuthed } from "./helpers/pos-checkout-shift-ready";

/**
 * POS checkout → shift close → shift report E2E.
 *
 * Open shift (if needed) → cash sale on terminal → close with expected cash → history row.
 *
 * @see e2e/pos-checkout-flow.spec.ts
 * @see docs/POS_REGISTER_SHIFTS.md
 */

test.describe("pos checkout shift report policy", () => {
  test("exports route and testid contract", () => {
    expect(POS_CHECKOUT_SHIFT_REPORT_E2E_POLICY_ID).toBe(
      "pos-checkout-shift-close-report-e2e-v1",
    );
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(posShiftHistoryRowTestId("shift-1")).toBe("pos-shift-history-row-shift-1");
  });
});

test.describe("pos checkout shift close report (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "POS shift close report runs in chromium-authed project only",
    );
    skipPosCheckoutShiftIfNotAuthed();
  });

  test("cash sale, shift close, and closed shift history report", async ({ page }) => {
    const shiftId = await ensureOpenShift(page);
    await preparePosTerminal(page);
    await completePosCashSale(page);
    await closeShiftWithExpectedCash(page, shiftId);
    await assertClosedShiftReport(page, shiftId);
  });
});
