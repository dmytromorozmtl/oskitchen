/**
 * POS checkout → shift close → report E2E policy (QA-15).
 *
 * @see e2e/pos-checkout-shift-close-report.spec.ts
 * @see app/dashboard/pos/shifts/page.tsx
 */

export const POS_CHECKOUT_SHIFT_REPORT_E2E_POLICY_ID =
  "pos-checkout-shift-close-report-e2e-v1" as const;

export const POS_TERMINAL_PATH = "/dashboard/pos/terminal" as const;
export const POS_SHIFTS_PATH = "/dashboard/pos/shifts" as const;

export const POS_SHIFT_CLOSE_FORM_TEST_ID = "pos-shift-close-form" as const;
export const POS_SHIFT_CLOSE_SUBMIT_TEST_ID = "pos-shift-close-submit" as const;
export const POS_SHIFT_CLOSE_HISTORY_TEST_ID = "pos-shift-close-history" as const;

export function posShiftHistoryRowTestId(shiftId: string): string {
  return `pos-shift-history-row-${shiftId}`;
}

export function posShiftHistoryRowSelector(shiftId: string): string {
  return `[data-testid="${posShiftHistoryRowTestId(shiftId)}"]`;
}
