import { expect, test } from "@playwright/test";

import {
  POS_CHECKOUT_E2E_FLOW_STEPS,
  POS_CHECKOUT_E2E_POLICY_ID,
  POS_SHIFTS_PATH,
  POS_TERMINAL_PATH,
  parsePosReceiptCheckoutStatus,
} from "@/lib/pos/pos-checkout-e2e-policy";
import { receiptTotalsConsistent } from "@/lib/pos/pos-shift-closeout-math";

import { runPosCheckoutE2EFlow } from "./helpers/pos-checkout-e2e-flow";
import {
  skipPosCheckoutE2EIfGateDisabled,
  skipPosCheckoutE2EIfNoDb,
  skipPosCheckoutE2EIfNotAuthed,
} from "./helpers/pos-checkout-e2e-ready";

/**
 * POS checkout full scenario — shift → item → discount → checkout → receipt → refund → void → close.
 *
 * @see e2e/pos-shift-checkout-receipt.spec.ts
 * @see e2e/pos-checkout-shift-close-report.spec.ts
 * @see e2e/refund-flow-e2e.spec.ts
 */

test.describe("pos checkout e2e policy", () => {
  test("exports full money path flow steps", () => {
    expect(POS_CHECKOUT_E2E_POLICY_ID).toBe("pos-checkout-e2e-p1-20-v1");
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(POS_CHECKOUT_E2E_FLOW_STEPS).toEqual([
      "open_shift",
      "add_item",
      "apply_discount",
      "checkout",
      "receipt",
      "refund",
      "void_sale",
      "close_shift",
    ]);
  });

  test("parses discounted sale receipt status", () => {
    const parsed = parsePosReceiptCheckoutStatus(
      "Sale complete — order a1b2c3d4… receipt R-2042",
    );
    expect(parsed.saleComplete).toBe(true);
    expect(parsed.orderPrefix).toBe("a1b2c3d4");
    expect(parsed.receiptRef).toBe("R-2042");
  });

  test("discounted checkout totals stay consistent", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 20,
        discount: 2,
        tax: 1.44,
        total: 19.44,
        lineTotals: [20],
      }),
    ).toBe(true);
  });
});

test.describe("pos checkout e2e (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "POS checkout E2E runs in chromium-authed project only",
    );
    skipPosCheckoutE2EIfGateDisabled();
    skipPosCheckoutE2EIfNotAuthed();
    skipPosCheckoutE2EIfNoDb();
  });

  test("shift discount checkout receipt refund void and close", async ({ page }) => {
    const result = await runPosCheckoutE2EFlow(page);
    expect(result.steps).toEqual(POS_CHECKOUT_E2E_FLOW_STEPS);
    expect(result.shiftId.length).toBeGreaterThan(0);
    expect(result.discountedOrderId.length).toBeGreaterThan(0);
    expect(result.voidOrderId.length).toBeGreaterThan(0);
    expect(result.receiptRef.length).toBeGreaterThan(0);
  });
});
