import { describe, expect, it } from "vitest";

import {
  buildOrderConfirmationCommerce,
  orderConfirmationTotalsHtml,
} from "@/lib/storefront/order-confirmation-email";

describe("order-confirmation-email", () => {
  it("builds market and stacked tax lines", () => {
    const commerce = buildOrderConfirmationCommerce({
      marketName: "Weekday picks",
      marketId: "weekday",
      subtotal: 20,
      discount: 2,
      deliveryFee: 5,
      taxBreakdown: [
        { id: "gst", label: "GST", ratePercent: 5, amount: 0.9 },
        { id: "pst", label: "PST", ratePercent: 7, amount: 1.26 },
      ],
      taxTotal: 2.16,
    });

    expect(commerce.marketLabel).toBe("Weekday picks");
    expect(commerce.taxLines).toHaveLength(2);
    const html = orderConfirmationTotalsHtml(commerce);
    expect(html).toContain("Weekday picks");
    expect(html).toContain("GST");
    expect(html).toContain("PST");
  });
});
