import { describe, expect, it } from "vitest";

import {
  BILL_SPLITTING_E2E_POLICY_ID,
  BILL_SPLIT_ACCURACY_TOLERANCE_RATIO,
  allBillSplitModesCovered,
  billSplitExpectedGrandTotal,
  billSplitModeTestId,
  billSplitWithinAccuracyTolerance,
} from "@/lib/pos/bill-splitting-e2e-policy";
import {
  billSplitAccuracyWithinContract,
  summarizeBillSplitAccuracy,
} from "@/lib/pos/bill-splitting-metrics";
import {
  BILL_SPLIT_MODES,
  computeBillSplit,
  defaultParticipants,
} from "@/lib/pos/bill-splitting";

describe("bill splitting E2E policy (QA-32)", () => {
  it("exports four-mode POS tab split contract", () => {
    expect(BILL_SPLITTING_E2E_POLICY_ID).toBe("bill-splitting-e2e-v1");
    expect(BILL_SPLIT_ACCURACY_TOLERANCE_RATIO).toBe(0.01);
    expect(allBillSplitModesCovered(BILL_SPLIT_MODES)).toBe(true);
    expect(billSplitModeTestId("item")).toBe("bill-split-mode-item");
  });

  it("computes expected grand total with tax and tip", () => {
    expect(billSplitExpectedGrandTotal({ subtotal: 50, taxRate: 0.1, tipTotal: 8 })).toBe(63);
    expect(billSplitWithinAccuracyTolerance(63, 63.01)).toBe(true);
  });
});

describe("bill splitting accuracy contract (QA-32)", () => {
  const items = [
    { id: "1", label: "Steak", quantity: 1, unitPrice: 32, totalPrice: 32, participantId: null },
    { id: "2", label: "Salad", quantity: 1, unitPrice: 11, totalPrice: 11, participantId: null },
  ];
  const billSubtotal = 43;
  const taxRate = 0.08;
  const tipTotal = 6;

  it("equal split shares reconcile to bill grand total ±1%", () => {
    const shares = computeBillSplit({
      mode: "equal",
      items,
      participants: defaultParticipants(3),
      taxRate,
      tipTotal,
    });
    const summary = summarizeBillSplitAccuracy({ billSubtotal, taxRate, tipTotal, shares });
    expect(summary.shareCount).toBe(3);
    expect(summary.withinTolerance).toBe(true);
    expect(billSplitAccuracyWithinContract({ billSubtotal, taxRate, tipTotal, shares })).toBe(true);
  });
});
