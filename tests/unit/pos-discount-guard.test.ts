import { describe, expect, it } from "vitest";

import {
  buildPosDiscountAuditMetadata,
  computePosCheckoutDiscountTotal,
  resolvePosDiscountGuard,
  validateExplicitPosDiscountAmount,
} from "@/lib/pos/pos-discount-guard";

describe("resolvePosDiscountGuard", () => {
  it("does not require manager discount for standard checkout", () => {
    expect(
      resolvePosDiscountGuard({ paymentMode: "CASH", discountAmount: 0 }),
    ).toEqual({
      requiresManagerDiscount: false,
      reason: "no_discount_or_comp",
      explicitDiscountAmount: 0,
      paymentMode: "CASH",
    });
  });

  it("requires manager discount for explicit positive discount", () => {
    expect(
      resolvePosDiscountGuard({ paymentMode: "CASH", discountAmount: 2.5 }),
    ).toEqual({
      requiresManagerDiscount: true,
      reason: "explicit_discount",
      explicitDiscountAmount: 2.5,
      paymentMode: "CASH",
    });
  });

  it("requires manager discount for COMPED even without explicit discount", () => {
    expect(
      resolvePosDiscountGuard({ paymentMode: "COMPED", discountAmount: 0 }),
    ).toEqual({
      requiresManagerDiscount: true,
      reason: "comped_payment_mode",
      explicitDiscountAmount: 0,
      paymentMode: "COMPED",
    });
  });

  it("treats undefined discountAmount as zero", () => {
    expect(resolvePosDiscountGuard({ paymentMode: "CARD_TERMINAL_PLACEHOLDER" })).toEqual({
      requiresManagerDiscount: false,
      reason: "no_discount_or_comp",
      explicitDiscountAmount: 0,
      paymentMode: "CARD_TERMINAL_PLACEHOLDER",
    });
  });
});

describe("buildPosDiscountAuditMetadata", () => {
  it("includes guard reason for comped checkout", () => {
    const guard = resolvePosDiscountGuard({ paymentMode: "COMPED" });
    expect(buildPosDiscountAuditMetadata(guard)).toEqual({
      paymentMode: "COMPED",
      explicitDiscountAmount: 0,
      guardReason: "comped_payment_mode",
    });
  });
});

describe("validateExplicitPosDiscountAmount", () => {
  it("accepts valid amounts", () => {
    expect(validateExplicitPosDiscountAmount(undefined)).toBeNull();
    expect(validateExplicitPosDiscountAmount(0)).toBeNull();
    expect(validateExplicitPosDiscountAmount(12.5)).toBeNull();
  });

  it("rejects negative and non-finite amounts", () => {
    expect(validateExplicitPosDiscountAmount(-0.01)).toMatch(/negative/i);
    expect(validateExplicitPosDiscountAmount(Number.NaN)).toMatch(/valid number/i);
  });

  it("rejects amounts above maximum", () => {
    expect(validateExplicitPosDiscountAmount(10_000_001)).toMatch(/maximum/i);
  });
});

describe("computePosCheckoutDiscountTotal", () => {
  it("stacks explicit, gift card, and loyalty discounts", () => {
    expect(
      computePosCheckoutDiscountTotal({
        explicitDiscountAmount: 2,
        giftCardApplied: 3,
        loyaltyDiscountApplied: 1.5,
      }),
    ).toBe(6.5);
  });

  it("defaults missing components to zero", () => {
    expect(computePosCheckoutDiscountTotal({})).toBe(0);
  });
});
