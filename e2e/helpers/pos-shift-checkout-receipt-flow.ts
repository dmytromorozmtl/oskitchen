import { expect, type Page } from "@playwright/test";

import {
  POS_CHECKOUT_STATUS_TEST_ID,
  POS_RECEIPT_PANEL_TEST_ID,
  POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS,
  POS_SHIFT_CHECKOUT_RECEIPT_VISIBLE_MS,
  parsePosReceiptCheckoutStatus,
  type PosShiftCheckoutReceiptFlowStep,
} from "@/lib/pos/pos-shift-checkout-receipt-e2e-policy";

import { assertNoDashboardRscFailure } from "./dashboard-smoke";
import {
  completePosCashSale,
  ensureOpenShift,
  preparePosTerminal,
} from "./pos-checkout-shift-flow";

export type PosShiftCheckoutReceiptFlowResult = {
  shiftId: string;
  orderPrefix: string;
  receiptRef: string;
  statusText: string;
  steps: PosShiftCheckoutReceiptFlowStep[];
};

export async function runPosShiftCheckoutReceiptFlow(
  page: Page,
): Promise<PosShiftCheckoutReceiptFlowResult> {
  const steps: PosShiftCheckoutReceiptFlowStep[] = [];

  const shiftId = await ensureOpenShift(page);
  steps.push("open_shift");

  await preparePosTerminal(page);
  await expect(page.getByTestId(POS_RECEIPT_PANEL_TEST_ID)).toBeVisible({
    timeout: POS_SHIFT_CHECKOUT_RECEIPT_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);
  steps.push("terminal_ready");

  await completePosCashSale(page);
  steps.push("checkout");

  const status = page.getByTestId(POS_CHECKOUT_STATUS_TEST_ID);
  await expect(status).toBeVisible({ timeout: POS_SHIFT_CHECKOUT_RECEIPT_VISIBLE_MS });
  const statusText = (await status.textContent()) ?? "";
  const parsed = parsePosReceiptCheckoutStatus(statusText);

  if (!parsed.saleComplete || !parsed.orderPrefix || !parsed.receiptRef) {
    throw new Error(
      `Expected sale complete receipt status with order + receipt, got: ${statusText.slice(0, 240)}`,
    );
  }

  await assertNoDashboardRscFailure(page);
  steps.push("receipt");

  if (steps.length !== POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    shiftId,
    orderPrefix: parsed.orderPrefix,
    receiptRef: parsed.receiptRef,
    statusText,
    steps,
  };
}
