import { expect, test } from "@playwright/test";

import {
  computeShiftCloseout,
  receiptTotalsConsistent,
} from "@/lib/pos/pos-shift-closeout-math";
import {
  SHIFT_REPORT_ACCURACY_E2E_POLICY_ID,
  SHIFT_REPORT_ACCURACY_SLI_ID,
  SHIFT_REPORT_MONEY_EPSILON,
  SHIFT_VARIANCE_BALANCED_LABEL,
  POS_SHIFTS_PATH,
  closedShiftSummaryReconciles,
  evaluateShiftReportAccuracy,
  posShiftHistoryRowTestId,
  shiftReportWithinMoneyEpsilon,
} from "@/lib/pos/shift-report-accuracy-e2e-policy";
import {
  shiftReportAccuracyWithinContract,
  summarizeShiftReportAccuracy,
} from "@/lib/pos/shift-report-accuracy-metrics";

import { runBalancedShiftReportAccuracyFlow } from "./helpers/shift-report-accuracy-flow";
import {
  skipShiftReportAccuracyIfNoDb,
  skipShiftReportAccuracyIfNotAuthed,
} from "./helpers/shift-report-accuracy-ready";

/**
 * Shift report cash accuracy E2E (QA-36).
 *
 * @see e2e/pos-checkout-shift-close-report.spec.ts — QA-15
 * @see lib/pos/pos-shift-closeout-math.ts
 */

test.describe("shift report accuracy policy", () => {
  test("exports cash reconciliation contract and history testids", () => {
    expect(SHIFT_REPORT_ACCURACY_E2E_POLICY_ID).toBe("shift-report-accuracy-e2e-v1");
    expect(SHIFT_REPORT_ACCURACY_SLI_ID).toBe("pos.shift_report_cash_accuracy");
    expect(SHIFT_REPORT_MONEY_EPSILON).toBe(0.01);
    expect(POS_SHIFTS_PATH).toBe("/dashboard/pos/shifts");
    expect(posShiftHistoryRowTestId("shift-1")).toBe("pos-shift-history-row-shift-1");
    expect(SHIFT_VARIANCE_BALANCED_LABEL).toBe("Balanced");
  });

  test("evaluates expected cash and variance within penny tolerance", () => {
    const contract = evaluateShiftReportAccuracy({
      openingCash: 100,
      cashSalesTotal: 47.25,
      closingCash: 147.25,
    });
    expect(contract.expectedCash).toBe(147.25);
    expect(contract.variance).toBe(0);
    expect(contract.balanced).toBe(true);
    expect(shiftReportWithinMoneyEpsilon(147.25, contract.expectedCash)).toBe(true);
  });
});

test.describe("shift report closeout math accuracy", () => {
  test("computeShiftCloseout matches policy expected and variance", () => {
    const input = { openingCash: 50, cashSalesTotals: [12.5, 7.25], closingCash: 69.75 };
    const closeout = computeShiftCloseout(input);
    const summary = summarizeShiftReportAccuracy({
      openingCash: input.openingCash,
      cashSalesTotal: closeout.cashSalesTotal,
      closingCash: input.closingCash,
    });

    expect(closeout.cashSalesTotal).toBe(19.75);
    expect(closeout.expectedCash).toBe(69.75);
    expect(closeout.variance).toBe(0);
    expect(summary.balanced).toBe(true);
    expect(summary.matchesCloseoutMath).toBe(true);
    expect(shiftReportAccuracyWithinContract({
      openingCash: input.openingCash,
      cashSalesTotal: closeout.cashSalesTotal,
      closingCash: input.closingCash,
    })).toBe(true);
  });

  test("short and over variance reconcile with closed shift summary fields", () => {
    const short = evaluateShiftReportAccuracy({
      openingCash: 100,
      cashSalesTotal: 20,
      closingCash: 118,
    });
    expect(short.variance).toBe(-2);
    expect(short.balanced).toBe(false);

    expect(
      closedShiftSummaryReconciles({
        openingCash: 100,
        closingCash: 118,
        expectedCash: 120,
        variance: -2,
        cashSalesTotal: 20,
      }),
    ).toBe(true);

    const over = evaluateShiftReportAccuracy({
      openingCash: 80,
      cashSalesTotal: 15,
      closingCash: 96.5,
    });
    expect(over.variance).toBe(1.5);
    expect(
      closedShiftSummaryReconciles({
        openingCash: 80,
        closingCash: 96.5,
        expectedCash: 95,
        variance: 1.5,
        cashSalesTotal: 15,
      }),
    ).toBe(true);
  });

  test("receipt totals consistency gate for shift report line items", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 24,
        tax: 2.4,
        discount: 1,
        total: 25.4,
        lineTotals: [14, 10],
      }),
    ).toBe(true);
    expect(
      receiptTotalsConsistent({
        subtotal: 10,
        tax: 1,
        discount: 0,
        total: 12,
      }),
    ).toBe(false);
  });
});

test.describe("shift report accuracy UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Shift report accuracy UI runs in chromium-authed project only",
    );
    skipShiftReportAccuracyIfNotAuthed();
    skipShiftReportAccuracyIfNoDb();
  });

  test("cash sale and balanced close show accurate shift history row", async ({ page }) => {
    await runBalancedShiftReportAccuracyFlow(page);
  });
});
