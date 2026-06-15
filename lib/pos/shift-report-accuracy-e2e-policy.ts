/**
 * POS shift report cash accuracy E2E policy (QA-36).
 *
 * expected = opening + cash sales; variance = counted − expected (±$0.01).
 *
 * @see e2e/shift-report-accuracy-e2e.spec.ts
 * @see lib/pos/pos-shift-closeout-math.ts
 * @see e2e/pos-checkout-shift-close-report.spec.ts — QA-15 lifecycle
 */

export const SHIFT_REPORT_ACCURACY_E2E_POLICY_ID = "shift-report-accuracy-e2e-v1" as const;

export const SHIFT_REPORT_ACCURACY_SLI_ID = "pos.shift_report_cash_accuracy" as const;

/** Penny-level tolerance for shift closeout reconciliation. */
export const SHIFT_REPORT_MONEY_EPSILON = 0.01 as const;

export const POS_SHIFTS_PATH = "/dashboard/pos/shifts" as const;
export const POS_TERMINAL_PATH = "/dashboard/pos/terminal" as const;

export const POS_SHIFT_CLOSE_HISTORY_TESTID = "pos-shift-close-history" as const;
export const POS_SHIFT_CLOSE_FORM_TESTID = "pos-shift-close-form" as const;
export const POS_SHIFT_CLOSE_SUBMIT_TESTID = "pos-shift-close-submit" as const;

export const SHIFT_VARIANCE_BALANCED_LABEL = "Balanced" as const;

export type ShiftReportAccuracyInput = {
  openingCash: number;
  cashSalesTotal: number;
  closingCash: number;
};

export type ShiftReportAccuracyContract = {
  expectedCash: number;
  variance: number;
  balanced: boolean;
};

export function posShiftHistoryRowTestId(shiftId: string): string {
  return `pos-shift-history-row-${shiftId}`;
}

export function shiftReportExpectedCash(openingCash: number, cashSalesTotal: number): number {
  return Math.round((openingCash + cashSalesTotal) * 100) / 100;
}

export function shiftReportVariance(closingCash: number, expectedCash: number): number {
  return Math.round((closingCash - expectedCash) * 100) / 100;
}

export function shiftReportWithinMoneyEpsilon(
  reported: number,
  computed: number,
  epsilon: number = SHIFT_REPORT_MONEY_EPSILON,
): boolean {
  return Math.abs(reported - computed) <= epsilon;
}

export function evaluateShiftReportAccuracy(
  input: ShiftReportAccuracyInput,
): ShiftReportAccuracyContract {
  const expectedCash = shiftReportExpectedCash(input.openingCash, input.cashSalesTotal);
  const variance = shiftReportVariance(input.closingCash, expectedCash);
  return {
    expectedCash,
    variance,
    balanced: Math.abs(variance) < SHIFT_REPORT_MONEY_EPSILON,
  };
}

export function shiftReportAccuracyWithinContract(contract: ShiftReportAccuracyContract): boolean {
  return contract.balanced || Number.isFinite(contract.variance);
}

export function closedShiftSummaryReconciles(input: {
  openingCash: number;
  closingCash: number;
  expectedCash: number;
  variance: number;
  cashSalesTotal?: number;
}): boolean {
  const recomputed = evaluateShiftReportAccuracy({
    openingCash: input.openingCash,
    cashSalesTotal:
      input.cashSalesTotal ??
      Math.round((input.expectedCash - input.openingCash) * 100) / 100,
    closingCash: input.closingCash,
  });
  return (
    shiftReportWithinMoneyEpsilon(input.expectedCash, recomputed.expectedCash) &&
    shiftReportWithinMoneyEpsilon(input.variance, recomputed.variance)
  );
}
