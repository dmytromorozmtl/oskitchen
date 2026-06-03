/**
 * Bill splitting E2E policy (QA-32).
 *
 * POS tab splits: equal, percentage, seat, item — share totals must reconcile ±1%.
 *
 * @see e2e/bill-splitting-e2e.spec.ts
 * @see lib/pos/bill-splitting.ts
 * @see docs/BILL_SPLITTING.md
 */

import {
  BILL_SPLIT_MODES,
  type BillSplitMode,
} from "@/lib/pos/bill-splitting";

export const BILL_SPLITTING_E2E_POLICY_ID = "bill-splitting-e2e-v1" as const;

export const BILL_SPLITTING_SLI_ID = "pos.bill_split_total_accuracy" as const;

/** Split share totals must reconcile within ±1% of bill grand total. */
export const BILL_SPLIT_ACCURACY_TOLERANCE_RATIO = 0.01 as const;

export const POS_TABS_PATH = "/dashboard/pos/tabs" as const;

export const BILL_SPLIT_PANEL_TESTID = "bill-split-panel" as const;
export const BILL_SPLIT_GUEST_COUNT_TESTID = "bill-split-guest-count" as const;
export const BILL_SPLIT_ITEM_ASSIGN_TESTID = "bill-split-item-assign" as const;
export const BILL_SPLIT_SHARE_TESTID = "bill-split-share" as const;

export const BILL_SPLIT_NO_OPEN_TABS_TEXT = "No open tabs" as const;

export function billSplitModeTestId(mode: BillSplitMode): string {
  return `bill-split-mode-${mode}`;
}

export function billSplitExpectedGrandTotal(input: {
  subtotal: number;
  taxRate: number;
  tipTotal: number;
}): number {
  const tax = Math.round(input.subtotal * input.taxRate * 100) / 100;
  return Math.round((input.subtotal + tax + input.tipTotal) * 100) / 100;
}

export function billSplitWithinAccuracyTolerance(
  expectedTotal: number,
  actualTotal: number,
  toleranceRatio: number = BILL_SPLIT_ACCURACY_TOLERANCE_RATIO,
): boolean {
  if (expectedTotal === 0) return actualTotal === 0;
  const delta = Math.abs(actualTotal - expectedTotal);
  const pennyFloor = 0.01;
  return delta <= expectedTotal * toleranceRatio + pennyFloor;
}

export function allBillSplitModesCovered(modes: readonly string[]): boolean {
  return BILL_SPLIT_MODES.every((mode) => modes.includes(mode));
}
