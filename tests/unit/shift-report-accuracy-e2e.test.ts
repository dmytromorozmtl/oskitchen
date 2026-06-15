import { describe, expect, it } from "vitest";

import {
  computeShiftCloseout,
  receiptTotalsConsistent,
} from "@/lib/pos/pos-shift-closeout-math";
import {
  SHIFT_REPORT_ACCURACY_E2E_POLICY_ID,
  SHIFT_REPORT_MONEY_EPSILON,
  closedShiftSummaryReconciles,
  evaluateShiftReportAccuracy,
} from "@/lib/pos/shift-report-accuracy-e2e-policy";
import { shiftReportAccuracyWithinContract } from "@/lib/pos/shift-report-accuracy-metrics";

describe("shift report accuracy E2E policy (QA-36)", () => {
  it("exports penny-level cash reconciliation SLI", () => {
    expect(SHIFT_REPORT_ACCURACY_E2E_POLICY_ID).toBe("shift-report-accuracy-e2e-v1");
    expect(SHIFT_REPORT_MONEY_EPSILON).toBe(0.01);
  });
});

describe("shift report cash accuracy contract (QA-36)", () => {
  it("opening + cash sales equals expected drawer within epsilon", () => {
    const closeout = computeShiftCloseout({
      openingCash: 200,
      cashSalesTotals: [33.33, 16.67],
      closingCash: 250,
    });
    const contract = evaluateShiftReportAccuracy({
      openingCash: 200,
      cashSalesTotal: closeout.cashSalesTotal,
      closingCash: 250,
    });

    expect(closeout.expectedCash).toBe(250);
    expect(closeout.variance).toBe(0);
    expect(contract.balanced).toBe(true);
    expect(
      shiftReportAccuracyWithinContract({
        openingCash: 200,
        cashSalesTotal: closeout.cashSalesTotal,
        closingCash: 250,
      }),
    ).toBe(true);
  });

  it("closed shift summary fields reconcile with closeout math", () => {
    expect(
      closedShiftSummaryReconciles({
        openingCash: 75,
        closingCash: 92.5,
        expectedCash: 90,
        variance: 2.5,
        cashSalesTotal: 15,
      }),
    ).toBe(true);
  });

  it("rejects inconsistent receipt totals in shift report lines", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 18,
        tax: 1.44,
        discount: 0,
        total: 19.44,
      }),
    ).toBe(true);
    expect(
      receiptTotalsConsistent({
        subtotal: 18,
        tax: 1.44,
        discount: 0,
        total: 20,
      }),
    ).toBe(false);
  });
});
