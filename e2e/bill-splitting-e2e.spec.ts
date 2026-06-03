import { expect, test } from "@playwright/test";

import {
  BILL_SPLITTING_E2E_POLICY_ID,
  BILL_SPLITTING_SLI_ID,
  BILL_SPLIT_ACCURACY_TOLERANCE_RATIO,
  POS_TABS_PATH,
  allBillSplitModesCovered,
  billSplitExpectedGrandTotal,
  billSplitModeTestId,
  billSplitWithinAccuracyTolerance,
} from "@/lib/pos/bill-splitting-e2e-policy";
import { billSplitAccuracyWithinContract, summarizeBillSplitAccuracy } from "@/lib/pos/bill-splitting-metrics";
import {
  BILL_SPLIT_MODES,
  billSplitTotals,
  computeBillSplit,
  defaultParticipants,
  normalizeParticipantPercentages,
  seatParticipants,
} from "@/lib/pos/bill-splitting";

import { runBillSplitPanelSmokeFlow } from "./helpers/bill-splitting-flow";
import { skipBillSplittingIfNotAuthed } from "./helpers/bill-splitting-ready";

/**
 * Bill splitting E2E (QA-32).
 *
 * @see docs/BILL_SPLITTING.md
 * @see e2e/bill-splitting.spec.ts
 */

const sampleItems = [
  { id: "a", label: "Burger", quantity: 1, unitPrice: 12, totalPrice: 12, participantId: null },
  { id: "b", label: "Fries", quantity: 1, unitPrice: 5, totalPrice: 5, participantId: null },
  { id: "c", label: "Beer", quantity: 2, unitPrice: 6, totalPrice: 12, participantId: null },
];

test.describe("bill splitting policy", () => {
  test("exports four-mode split contract and accuracy tolerance", () => {
    expect(BILL_SPLITTING_E2E_POLICY_ID).toBe("bill-splitting-e2e-v1");
    expect(BILL_SPLITTING_SLI_ID).toBe("pos.bill_split_total_accuracy");
    expect(BILL_SPLIT_ACCURACY_TOLERANCE_RATIO).toBe(0.01);
    expect(POS_TABS_PATH).toBe("/dashboard/pos/tabs");
    expect(allBillSplitModesCovered(BILL_SPLIT_MODES)).toBe(true);
    expect(billSplitModeTestId("equal")).toBe("bill-split-mode-equal");
  });

  test("evaluates ±1% grand total tolerance", () => {
    expect(billSplitExpectedGrandTotal({ subtotal: 29, taxRate: 0.08, tipTotal: 5 })).toBe(36.32);
    expect(billSplitWithinAccuracyTolerance(36.32, 36.32)).toBe(true);
    expect(billSplitWithinAccuracyTolerance(100, 100.5)).toBe(true);
    expect(billSplitWithinAccuracyTolerance(100, 102)).toBe(false);
  });
});

test.describe("bill splitting compute accuracy", () => {
  const billSubtotal = 29;
  const taxRate = 0.08;
  const tipTotal = 5;

  test("equal mode reconciles share totals within tolerance", () => {
    const shares = computeBillSplit({
      mode: "equal",
      items: sampleItems,
      participants: defaultParticipants(2),
      taxRate,
      tipTotal,
    });
    const summary = summarizeBillSplitAccuracy({ billSubtotal, taxRate, tipTotal, shares });
    expect(summary.shareCount).toBe(2);
    expect(summary.withinTolerance).toBe(true);
    expect(billSplitAccuracyWithinContract({ billSubtotal, taxRate, tipTotal, shares })).toBe(true);
    expect(billSplitTotals(shares).total).toBe(summary.expectedGrandTotal);
  });

  test("percentage mode reconciles share totals within tolerance", () => {
    const shares = computeBillSplit({
      mode: "percentage",
      items: sampleItems,
      participants: normalizeParticipantPercentages([
        { id: "guest-1", label: "Guest 1", percentage: 60 },
        { id: "guest-2", label: "Guest 2", percentage: 40 },
      ]),
      taxRate,
      tipTotal,
    });
    expect(billSplitAccuracyWithinContract({ billSubtotal, taxRate, tipTotal, shares })).toBe(true);
  });

  test("seat mode reconciles assigned items within tolerance", () => {
    const shares = computeBillSplit({
      mode: "seat",
      items: [
        { ...sampleItems[0], participantId: "seat-1" },
        { ...sampleItems[1], participantId: "seat-2" },
        { ...sampleItems[2], participantId: "seat-1" },
      ],
      participants: seatParticipants(2),
      taxRate,
      tipTotal,
    });
    expect(billSplitAccuracyWithinContract({ billSubtotal, taxRate, tipTotal, shares })).toBe(true);
    expect(shares.find((share) => share.participantId === "seat-1")?.subtotal).toBe(24);
  });

  test("item mode reconciles per-guest assignments within tolerance", () => {
    const shares = computeBillSplit({
      mode: "item",
      items: [
        { ...sampleItems[0], participantId: "guest-1" },
        { ...sampleItems[1], participantId: "guest-2" },
        { ...sampleItems[2], participantId: "guest-2" },
      ],
      participants: defaultParticipants(2),
      taxRate,
      tipTotal,
    });
    expect(billSplitAccuracyWithinContract({ billSubtotal, taxRate, tipTotal, shares })).toBe(true);
  });
});

test.describe("bill splitting UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Bill splitting UI runs in chromium-authed project only",
    );
    skipBillSplittingIfNotAuthed();
  });

  test("split panel shows all four modes on open tab", async ({ page }) => {
    await runBillSplitPanelSmokeFlow(page);
  });
});
