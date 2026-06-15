import { describe, expect, it } from "vitest";

import {
  computeShiftCloseout,
  formatShiftCloseoutSummary,
  receiptTotalsConsistent,
  sumCashTransactionTotals,
} from "@/lib/pos/pos-shift-closeout-math";

describe("pos shift closeout math", () => {
  it("computes expected cash and variance from opening plus cash sales", () => {
    expect(
      computeShiftCloseout({
        openingCash: 50,
        cashSalesTotals: [20, 10],
        closingCash: 75,
      }),
    ).toEqual({
      cashSalesTotal: 30,
      expectedCash: 80,
      variance: -5,
    });
  });

  it("sums cash transaction totals with rounding", () => {
    expect(sumCashTransactionTotals([10.005, 10.004])).toBe(20.01);
  });

  it("handles zero opening float", () => {
    expect(
      computeShiftCloseout({
        openingCash: 0,
        cashSalesTotals: [15.5],
        closingCash: 15.5,
      }),
    ).toEqual({
      cashSalesTotal: 15.5,
      expectedCash: 15.5,
      variance: 0,
    });
  });

  it("ignores non-cash modes at call site — empty cash list yields opening-only expected", () => {
    expect(
      computeShiftCloseout({
        openingCash: 100,
        cashSalesTotals: [],
        closingCash: 100,
      }).expectedCash,
    ).toBe(100);
  });

  it("formats closeout summary for operator notes", () => {
    const summary = formatShiftCloseoutSummary({
      openingCash: 50,
      cashSalesTotals: [20, 10],
      closingCash: 75,
      cashSalesTotal: 30,
      expectedCash: 80,
      variance: -5,
    });
    expect(summary).toContain("variance -5.00");
    expect(summary).toContain("expected 80.00");
  });
});

describe("receiptTotalsConsistent", () => {
  it("accepts subtotal - discount + tax = total", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 12,
        discount: 2,
        tax: 1,
        total: 11,
        lineTotals: [7, 5],
      }),
    ).toBe(true);
  });

  it("rejects mismatched total", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 10,
        discount: 0,
        tax: 0.8,
        total: 12,
      }),
    ).toBe(false);
  });

  it("rejects line totals that do not sum to subtotal", () => {
    expect(
      receiptTotalsConsistent({
        subtotal: 10,
        discount: 0,
        tax: 0,
        total: 10,
        lineTotals: [4, 4],
      }),
    ).toBe(false);
  });
});
