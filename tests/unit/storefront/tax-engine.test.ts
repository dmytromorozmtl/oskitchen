import { describe, expect, it } from "vitest";

import { computeCheckoutTotals } from "@/lib/storefront/checkout-totals";
import { computeStorefrontTax } from "@/lib/storefront/tax-engine";
import type { StorefrontTaxSettings } from "@/lib/storefront/tax-settings";

describe("computeStorefrontTax", () => {
  const usSettings: StorefrontTaxSettings = {
    mode: "us_sales",
    taxIncludedInPrices: false,
    components: [
      { id: "federal", label: "Federal", ratePercent: 2, appliesTo: "goods" },
      { id: "state", label: "CA Sales Tax", ratePercent: 8.25, appliesTo: "goods" },
    ],
  };

  it("stacks US federal + state on taxable goods", () => {
    const r = computeStorefrontTax({
      subtotal: 100,
      discountAmount: 10,
      deliveryFee: 5,
      settings: usSettings,
    });
    expect(r.taxTotal).toBe(9.23);
    expect(r.lines).toHaveLength(2);
    expect(r.lines[0]?.amount).toBe(1.8);
    expect(r.lines[1]?.amount).toBe(7.43);
  });

  it("EU VAT included does not add to payable total via checkout totals", () => {
    const eu: StorefrontTaxSettings = {
      mode: "eu_vat",
      taxIncludedInPrices: true,
      components: [{ id: "vat", label: "VAT", ratePercent: 20, appliesTo: "goods" }],
    };
    const totals = computeCheckoutTotals({
      subtotal: 100,
      deliveryFee: 0,
      discountAmount: 0,
      taxSettings: eu,
      tipAmount: 0,
      depositAmount: 0,
    });
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(100);
    expect(totals.taxBreakdown[0]?.amount).toBe(20);
  });
});
