import { describe, expect, it } from "vitest";

import { quoteStorefrontShipping } from "@/lib/storefront/shipping-engine";

describe("quoteStorefrontShipping", () => {
  const base = {
    deliveryEnabled: true,
    storefrontDeliveryFee: 8,
    freeDeliveryThreshold: 100,
    deliveryZonesJson: [
      {
        name: "Downtown",
        enabled: true,
        fee: 5,
        postalCodes: ["M5V"],
      },
    ],
  };

  it("returns zero fee for pickup", () => {
    const q = quoteStorefrontShipping(base, {
      fulfillmentType: "PICKUP",
      subtotal: 40,
    });
    expect(q.ok).toBe(true);
    expect(q.deliveryFee).toBe(0);
  });

  it("matches zone postal code", () => {
    const q = quoteStorefrontShipping(base, {
      fulfillmentType: "DELIVERY",
      deliveryAddress: "123 Main St, Toronto ON M5V 2T6",
      subtotal: 40,
    });
    expect(q.ok).toBe(true);
    expect(q.deliveryFee).toBe(5);
    expect(q.matchedZoneName).toBe("Downtown");
  });

  it("rejects address outside zones when matchers exist", () => {
    const q = quoteStorefrontShipping(base, {
      fulfillmentType: "DELIVERY",
      deliveryAddress: "999 Remote Rd, Calgary AB T2P 1J9",
      subtotal: 40,
    });
    expect(q.ok).toBe(false);
  });
});
