import { expect, test } from "@playwright/test";

import { computeShiftCloseout } from "@/lib/pos/pos-shift-closeout-math";
import {
  POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID,
  POS_SHIFT_OPEN_CLOSE_FLOW_STEPS,
  POS_SHIFTS_PATH,
  POS_TERMINAL_PATH,
  closedShiftHistoryShowsBalanced,
  parseCashSalesTotalFromPreview,
  parseExpectedCashFromPreview,
  posShiftHistoryRowTestId,
} from "@/lib/qa/pos-shift-open-close-e2e-policy";

import { runPosShiftOpenCloseFlow } from "./helpers/pos-shift-open-close-flow";
import {
  skipPosShiftOpenCloseIfGateDisabled,
  skipPosShiftOpenCloseIfNotAuthed,
} from "./helpers/pos-shift-open-close-ready";

/**
 * POS shift open → close golden path — full shift cycle with balanced totals.
 *
 * Open shift → cash sale → close with expected cash → verify history totals.
 *
 * @see e2e/pos-shift-checkout-receipt.spec.ts
 * @see e2e/pos-checkout-shift-close-report.spec.ts
 */

test.describe("pos shift open close policy", () => {
  test("exports shift lifecycle routes and flow steps", () => {
    expect(POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID).toBe("pos-shift-open-close-e2e-v1");
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(POS_SHIFT_OPEN_CLOSE_FLOW_STEPS).toEqual([
      "open_shift",
      "cash_sale",
      "close_shift",
      "verify_history_totals",
    ]);
    expect(posShiftHistoryRowTestId("shift-1")).toBe("pos-shift-history-row-shift-1");
  });

  test("parses closeout preview cash sales and expected drawer totals", () => {
    const previewText =
      "Closeout preview Cash sales (1) $12.50 Opening float $100.00 Expected in drawer $112.50";
    expect(parseCashSalesTotalFromPreview(previewText)).toBe(12.5);
    expect(parseExpectedCashFromPreview(previewText)).toBe(112.5);
  });

  test("balanced closeout math matches preview totals", () => {
    const result = computeShiftCloseout({
      openingCash: 100,
      cashSalesTotals: [12.5],
      closingCash: 112.5,
    });
    expect(result.cashSalesTotal).toBe(12.5);
    expect(result.expectedCash).toBe(112.5);
    expect(result.variance).toBe(0);
  });

  test("closed shift history row shows balanced variance", () => {
    expect(
      closedShiftHistoryShowsBalanced(
        "Jun 9, 2026 Register 1 $112.50 $112.50 Balanced Review notes Owner",
      ),
    ).toBe(true);
  });
});

test.describe("pos shift open close (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "POS shift open → close runs in chromium-authed project only",
    );
    skipPosShiftOpenCloseIfGateDisabled();
    skipPosShiftOpenCloseIfNotAuthed();
  });

  test("open shift cash sale closes with balanced totals in history", async ({ page }) => {
    const result = await runPosShiftOpenCloseFlow(page);
    expect(result.steps).toEqual(POS_SHIFT_OPEN_CLOSE_FLOW_STEPS);
    expect(result.shiftId.length).toBeGreaterThan(0);
    expect(result.cashSalesTotal).toBeGreaterThan(0);
    expect(result.expectedCash).toBeGreaterThanOrEqual(result.cashSalesTotal);
  });
});
