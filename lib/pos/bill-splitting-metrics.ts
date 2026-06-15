/**
 * Bill split accuracy metrics for QA-32 E2E contract proof.
 */

import {
  BILL_SPLIT_ACCURACY_TOLERANCE_RATIO,
  billSplitExpectedGrandTotal,
  billSplitWithinAccuracyTolerance,
} from "@/lib/pos/bill-splitting-e2e-policy";
import { billSplitTotals, type BillSplitShare } from "@/lib/pos/bill-splitting";

export type BillSplitAccuracySummary = {
  expectedGrandTotal: number;
  actualGrandTotal: number;
  subtotal: number;
  tax: number;
  tip: number;
  shareCount: number;
  withinTolerance: boolean;
  toleranceRatio: number;
};

export function summarizeBillSplitAccuracy(input: {
  billSubtotal: number;
  taxRate: number;
  tipTotal: number;
  shares: BillSplitShare[];
}): BillSplitAccuracySummary {
  const totals = billSplitTotals(input.shares);
  const expectedGrandTotal = billSplitExpectedGrandTotal({
    subtotal: input.billSubtotal,
    taxRate: input.taxRate,
    tipTotal: input.tipTotal,
  });

  return {
    expectedGrandTotal,
    actualGrandTotal: totals.total,
    subtotal: totals.subtotal,
    tax: totals.tax,
    tip: totals.tip,
    shareCount: input.shares.length,
    withinTolerance: billSplitWithinAccuracyTolerance(expectedGrandTotal, totals.total),
    toleranceRatio: BILL_SPLIT_ACCURACY_TOLERANCE_RATIO,
  };
}

export function billSplitAccuracyWithinContract(input: {
  billSubtotal: number;
  taxRate: number;
  tipTotal: number;
  shares: BillSplitShare[];
}): boolean {
  return summarizeBillSplitAccuracy(input).withinTolerance;
}
