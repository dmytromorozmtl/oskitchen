import { describe, expect, it } from "vitest";

import {
  computePosTerminalAmountDue,
  computePosTerminalDiscountAmount,
  filterPosTerminalPaymentModes,
  parsePosTerminalFixedDiscountInput,
  parsePosTerminalPercentDiscountInput,
} from "@/lib/pos/pos-terminal-discount-ui";

describe("pos terminal discount ui", () => {
  it("hides COMPED payment mode for cashiers without discount permission", () => {
    expect(filterPosTerminalPaymentModes(false)).not.toContain("COMPED");
    expect(filterPosTerminalPaymentModes(true)).toContain("COMPED");
  });

  it("computes fixed and percent discounts capped at subtotal", () => {
    expect(
      computePosTerminalDiscountAmount({
        cartSubtotal: 100,
        discountMode: "fixed",
        fixedAmount: 25,
        percentValue: 0,
        paymentMode: "CASH",
      }),
    ).toBe(25);
    expect(
      computePosTerminalDiscountAmount({
        cartSubtotal: 40,
        discountMode: "fixed",
        fixedAmount: 50,
        percentValue: 0,
        paymentMode: "CASH",
      }),
    ).toBe(40);
    expect(
      computePosTerminalDiscountAmount({
        cartSubtotal: 80,
        discountMode: "percent",
        fixedAmount: 0,
        percentValue: 10,
        paymentMode: "CASH",
      }),
    ).toBe(8);
  });

  it("treats COMPED mode as full discount regardless of discount mode", () => {
    expect(
      computePosTerminalDiscountAmount({
        cartSubtotal: 55.5,
        discountMode: "none",
        fixedAmount: 0,
        percentValue: 0,
        paymentMode: "COMPED",
      }),
    ).toBe(55.5);
    expect(
      computePosTerminalAmountDue({
        cartSubtotal: 55.5,
        discountAmount: 55.5,
        paymentMode: "COMPED",
      }),
    ).toBe(0);
  });

  it("parses discount input safely", () => {
    expect(parsePosTerminalFixedDiscountInput("12.5")).toBe(12.5);
    expect(parsePosTerminalFixedDiscountInput("-1")).toBeNull();
    expect(parsePosTerminalPercentDiscountInput("15")).toBe(15);
    expect(parsePosTerminalPercentDiscountInput("150")).toBeNull();
  });
});
