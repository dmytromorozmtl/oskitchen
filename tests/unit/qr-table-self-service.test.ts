import { describe, expect, it } from "vitest";

import {
  calculateSplitBillShare,
  publicTableSelfServicePath,
  splitBillFullyPaid,
} from "@/lib/qr/table-self-service";

describe("qr table self-service", () => {
  it("calculates even split shares", () => {
    expect(calculateSplitBillShare(100, 4)).toBe(25);
    expect(calculateSplitBillShare(50, 3)).toBe(16.67);
  });

  it("builds table query path", () => {
    expect(publicTableSelfServicePath("my-cafe", "12")).toBe("/q/table?store=my-cafe&table=12");
  });

  it("detects fully paid split", () => {
    expect(splitBillFullyPaid({ guests: 4, shareAmount: 25, paidShares: 4, currency: "USD" })).toBe(
      true,
    );
    expect(splitBillFullyPaid({ guests: 4, shareAmount: 25, paidShares: 2, currency: "USD" })).toBe(
      false,
    );
  });
});
