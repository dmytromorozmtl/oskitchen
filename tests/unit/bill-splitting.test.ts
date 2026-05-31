import { describe, expect, it } from "vitest";

import {
  billSplitTotals,
  computeBillSplit,
  defaultParticipants,
  normalizeParticipantPercentages,
  seatParticipants,
  unassignedItemCount,
} from "@/lib/pos/bill-splitting";

const items = [
  { id: "a", label: "Burger", quantity: 1, unitPrice: 12, totalPrice: 12, participantId: null },
  { id: "b", label: "Fries", quantity: 1, unitPrice: 5, totalPrice: 5, participantId: null },
  { id: "c", label: "Beer", quantity: 2, unitPrice: 6, totalPrice: 12, participantId: null },
];

describe("bill splitting", () => {
  it("splits equally across guests", () => {
    const shares = computeBillSplit({
      mode: "equal",
      items,
      participants: defaultParticipants(2),
      taxRate: 0.1,
      tipTotal: 5,
    });
    expect(shares).toHaveLength(2);
    expect(shares[0]?.subtotal).toBe(14.5);
    expect(shares[1]?.subtotal).toBe(14.5);
    expect(billSplitTotals(shares).total).toBe(36.9);
  });

  it("splits by percentage", () => {
    const shares = computeBillSplit({
      mode: "percentage",
      items,
      participants: normalizeParticipantPercentages([
        { id: "guest-1", label: "Guest 1", percentage: 60 },
        { id: "guest-2", label: "Guest 2", percentage: 40 },
      ]),
      taxRate: 0.08,
      tipTotal: 0,
    });
    expect(shares[0]?.subtotal).toBe(17.4);
    expect(shares[1]?.subtotal).toBe(11.6);
  });

  it("splits by seat assignments", () => {
    const shares = computeBillSplit({
      mode: "seat",
      items: [
        { ...items[0], participantId: "seat-1" },
        { ...items[1], participantId: "seat-2" },
        { ...items[2], participantId: "seat-1" },
      ],
      participants: seatParticipants(2),
      taxRate: 0.08,
      tipTotal: 2,
    });
    const seatOne = shares.find((share) => share.participantId === "seat-1");
    const seatTwo = shares.find((share) => share.participantId === "seat-2");
    expect(seatOne?.subtotal).toBe(24);
    expect(seatTwo?.subtotal).toBe(5);
    expect(seatOne?.itemIds).toEqual(["a", "c"]);
  });

  it("splits by item assignment", () => {
    const shares = computeBillSplit({
      mode: "item",
      items: [
        { ...items[0], participantId: "guest-1" },
        { ...items[1], participantId: "guest-2" },
        { ...items[2], participantId: "guest-2" },
      ],
      participants: defaultParticipants(2),
      taxRate: 0,
      tipTotal: 0,
    });
    expect(shares.find((share) => share.participantId === "guest-1")?.subtotal).toBe(12);
    expect(shares.find((share) => share.participantId === "guest-2")?.subtotal).toBe(17);
  });

  it("counts unassigned items", () => {
    expect(
      unassignedItemCount([
        { id: "1", label: "A", quantity: 1, unitPrice: 1, totalPrice: 1 },
        { id: "2", label: "B", quantity: 1, unitPrice: 1, totalPrice: 1, participantId: "guest-1" },
      ]),
    ).toBe(1);
  });
});
