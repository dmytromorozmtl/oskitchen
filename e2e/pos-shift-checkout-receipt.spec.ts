import { expect, test } from "@playwright/test";

import {
  POS_RECEIPT_PANEL_TEST_ID,
  POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID,
  POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS,
  POS_SHIFTS_PATH,
  POS_TERMINAL_PATH,
  parsePosReceiptCheckoutStatus,
} from "@/lib/pos/pos-shift-checkout-receipt-e2e-policy";
import { receiptTotalsConsistent } from "@/lib/pos/pos-shift-closeout-math";

import { runPosShiftCheckoutReceiptFlow } from "./helpers/pos-shift-checkout-receipt-flow";
import { skipPosShiftCheckoutReceiptIfNotAuthed } from "./helpers/pos-shift-checkout-receipt-ready";

/**
 * POS shift → checkout → receipt golden path.
 *
 * Open shift → terminal ready → cash sale → receipt status with order + receipt number.
 *
 * @see e2e/pos-checkout-flow.spec.ts
 * @see e2e/pos-checkout-shift-close-report.spec.ts
 */

test.describe("pos shift checkout receipt policy", () => {
  test("exports money path route and receipt contract", () => {
    expect(POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID).toBe(
      "pos-shift-checkout-receipt-e2e-v1",
    );
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(POS_RECEIPT_PANEL_TEST_ID).toBe("pos-receipt-panel");
    expect(POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS).toEqual([
      "open_shift",
      "terminal_ready",
      "checkout",
      "receipt",
    ]);
  });

  test("parses sale complete receipt status", () => {
    const parsed = parsePosReceiptCheckoutStatus(
      "Sale complete — order a1b2c3d4… receipt R-1042",
    );
    expect(parsed.saleComplete).toBe(true);
    expect(parsed.orderPrefix).toBe("a1b2c3d4");
    expect(parsed.receiptRef).toBe("R-1042");
  });

  test("receipt totals math stays consistent for checkout lines", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 12,
        discount: 0,
        tax: 0.96,
        total: 12.96,
        lineTotals: [8, 4],
      }),
    ).toBe(true);
  });
});

test.describe("pos shift checkout receipt (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "POS shift checkout receipt runs in chromium-authed project only",
    );
    skipPosShiftCheckoutReceiptIfNotAuthed();
  });

  test("open shift cash sale shows receipt panel success with order and receipt number", async ({
    page,
  }) => {
    const result = await runPosShiftCheckoutReceiptFlow(page);
    expect(result.steps).toEqual(POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS);
    expect(result.shiftId.length).toBeGreaterThan(0);
    expect(result.orderPrefix).toMatch(/^[a-f0-9]{8}$/i);
    expect(result.receiptRef.length).toBeGreaterThan(0);
    await expect(page.getByTestId(POS_RECEIPT_PANEL_TEST_ID)).toBeVisible();
  });
});
