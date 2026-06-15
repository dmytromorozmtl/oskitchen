import { describe, expect, it } from "vitest";

import { resolveUnitPrice } from "@/services/marketplace/marketplace-product-detail-service";

describe("marketplace product detail pricing", () => {
  it("applies volume tiers by quantity", () => {
    const price = resolveUnitPrice(
      {
        basePrice: 10,
        volumePricing: [
          { minQuantity: 10, price: 9 },
          { minQuantity: 50, price: 8 },
        ],
      },
      50,
      null,
    );
    expect(price).toBe(8);
  });

  it("prefers variant price when provided", () => {
    const price = resolveUnitPrice(
      {
        basePrice: 10,
        volumePricing: [{ minQuantity: 10, price: 9 }],
      },
      100,
      12.5,
    );
    expect(price).toBe(12.5);
  });
});
