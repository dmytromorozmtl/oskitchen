import { expect, type Page } from "@playwright/test";

import {
  POS_SHIFT_BALANCED_VARIANCE_LABEL,
  POS_SHIFT_CLOSEOUT_PREVIEW_TEST_ID,
  POS_SHIFT_OPEN_CLOSE_FLOW_STEPS,
  POS_SHIFT_OPEN_CLOSE_VISIBLE_MS,
  POS_SHIFTS_PATH,
  closedShiftHistoryShowsBalanced,
  parseCashSalesTotalFromPreview,
  parseExpectedCashFromPreview,
  posShiftHistoryRowTestId,
  type PosShiftOpenCloseFlowStep,
} from "@/lib/qa/pos-shift-open-close-e2e-policy";

import { assertNoDashboardRscFailure } from "./dashboard-smoke";
import {
  assertClosedShiftReport,
  closeShiftWithExpectedCash,
  completePosCashSale,
  ensureOpenShift,
  preparePosTerminal,
} from "./pos-checkout-shift-flow";

export type PosShiftOpenCloseFlowResult = {
  shiftId: string;
  cashSalesTotal: number;
  expectedCash: number;
  steps: PosShiftOpenCloseFlowStep[];
};

export async function readShiftCloseoutPreviewTotals(page: Page): Promise<{
  cashSalesTotal: number;
  expectedCash: number;
}> {
  await page.goto(POS_SHIFTS_PATH);
  const preview = page.getByTestId(POS_SHIFT_CLOSEOUT_PREVIEW_TEST_ID);
  await expect(preview).toBeVisible({ timeout: POS_SHIFT_OPEN_CLOSE_VISIBLE_MS });

  const text = (await preview.textContent()) ?? "";
  const cashSalesTotal = parseCashSalesTotalFromPreview(text);
  const expectedCash = parseExpectedCashFromPreview(text);

  if (cashSalesTotal === null || expectedCash === null) {
    throw new Error(`Could not parse closeout preview totals from: ${text.slice(0, 240)}`);
  }

  expect(cashSalesTotal).toBeGreaterThan(0);
  expect(expectedCash).toBeGreaterThanOrEqual(cashSalesTotal);

  return { cashSalesTotal, expectedCash };
}

export async function assertClosedShiftTotalsBalanced(
  page: Page,
  shiftId: string,
): Promise<string> {
  await assertClosedShiftReport(page, shiftId);
  await assertNoDashboardRscFailure(page);

  const row = page.getByTestId(posShiftHistoryRowTestId(shiftId));
  await expect(row).toBeVisible({ timeout: POS_SHIFT_OPEN_CLOSE_VISIBLE_MS });

  const rowText = (await row.textContent()) ?? "";
  expect(rowText).toMatch(/\$/);
  expect(closedShiftHistoryShowsBalanced(rowText)).toBe(true);
  expect(rowText).toContain(POS_SHIFT_BALANCED_VARIANCE_LABEL);

  return rowText;
}

export async function runPosShiftOpenCloseFlow(page: Page): Promise<PosShiftOpenCloseFlowResult> {
  const steps: PosShiftOpenCloseFlowStep[] = [];

  const shiftId = await ensureOpenShift(page);
  steps.push("open_shift");

  await preparePosTerminal(page);
  await completePosCashSale(page);
  steps.push("cash_sale");

  const previewTotals = await readShiftCloseoutPreviewTotals(page);
  await closeShiftWithExpectedCash(page, shiftId);
  steps.push("close_shift");

  await assertClosedShiftTotalsBalanced(page, shiftId);
  steps.push("verify_history_totals");

  if (steps.length !== POS_SHIFT_OPEN_CLOSE_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    shiftId,
    cashSalesTotal: previewTotals.cashSalesTotal,
    expectedCash: previewTotals.expectedCash,
    steps,
  };
}
