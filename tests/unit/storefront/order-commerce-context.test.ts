import { describe, expect, it } from "vitest";

import { buildCartSnapshotEnvelope } from "@/lib/storefront/cart-snapshot";
import {
  buildOrderStorefrontCommerceContext,
  parseMarketIdFromOrderSource,
  resolveMarketIdFromStorefrontOrder,
} from "@/lib/storefront/order-commerce-context";

describe("order-commerce-context", () => {
  it("parses market id from source string", () => {
    expect(parseMarketIdFromOrderSource("storefront:market:weekday")).toBe("weekday");
    expect(parseMarketIdFromOrderSource("storefront")).toBeNull();
  });

  it("prefers cart envelope market over source", () => {
    const cart = buildCartSnapshotEnvelope({
      marketId: "weekend",
      lines: [{ productId: "p1", title: "Soup", quantity: 1, unitPrice: 10 }],
    });
    expect(
      resolveMarketIdFromStorefrontOrder({ cartJson: cart, source: "storefront:market:weekday" }),
    ).toBe("weekend");
  });

  it("builds dashboard commerce view with tax lines", () => {
    const cart = buildCartSnapshotEnvelope({
      marketId: "weekday",
      lines: [{ productId: "p1", title: "Bowl", quantity: 2, unitPrice: 12 }],
      taxBreakdown: [{ id: "gst", label: "GST", ratePercent: 5, amount: 1.14 }],
      taxMode: "ca_sales",
      taxRegionCode: "CA-ON",
    });
    const view = buildOrderStorefrontCommerceContext({
      storefrontOrder: {
        id: "sfo-1",
        orderNumber: "SF-ABC",
        publicToken: "tok123",
        source: "storefront:market:weekday",
        cartJson: cart,
        subtotal: { toString: () => "24" },
        tax: { toString: () => "1.14" },
        deliveryFee: { toString: () => "0" },
        discount: { toString: () => "0" },
        total: { toString: () => "25.14" },
        paymentMode: "PAY_LATER",
        paymentStatus: "NOT_REQUIRED",
        fulfillmentType: "PICKUP",
      },
      storeSlug: "hello",
      currency: "CAD",
      markets: [{ id: "weekday", name: "Weekday lunch", enabled: true }],
    });
    expect(view.marketName).toBe("Weekday lunch");
    expect(view.taxBreakdown).toHaveLength(1);
    expect(view.schemaVersion).toBe(2);
    expect(view.guestTrackingUrl).toContain("/s/hello/order/tok123");
    expect(view.reorderCartUrl).toContain("market=weekday");
  });
});
