/**
 * Shift report accuracy metrics for QA-36 E2E contract proof.
 */

import {
  type ShiftReportAccuracyInput,
  evaluateShiftReportAccuracy,
  shiftReportAccuracyWithinContract as isShiftReportContractValid,
} from "@/lib/pos/shift-report-accuracy-e2e-policy";
import { computeShiftCloseout } from "@/lib/pos/pos-shift-closeout-math";

export type ShiftReportAccuracySummary = ReturnType<typeof evaluateShiftReportAccuracy> & {
  withinContract: boolean;
  matchesCloseoutMath: boolean;
};

export function summarizeShiftReportAccuracy(
  input: ShiftReportAccuracyInput,
): ShiftReportAccuracySummary {
  const contract = evaluateShiftReportAccuracy(input);
  const closeout = computeShiftCloseout({
    openingCash: input.openingCash,
    cashSalesTotals: [input.cashSalesTotal],
    closingCash: input.closingCash,
  });

  return {
    ...contract,
    withinContract: isShiftReportContractValid(contract),
    matchesCloseoutMath:
      Math.abs(contract.expectedCash - closeout.expectedCash) <= 0.01 &&
      Math.abs(contract.variance - closeout.variance) <= 0.01,
  };
}

export function shiftReportAccuracyWithinContract(input: ShiftReportAccuracyInput): boolean {
  const summary = summarizeShiftReportAccuracy(input);
  return summary.withinContract && summary.matchesCloseoutMath;
}
