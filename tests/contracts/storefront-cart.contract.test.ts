import { describe, expect, it } from "vitest";
import { z } from "zod";

const cartLineSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const cartSchema = z.object({
  lines: z.array(cartLineSchema),
  subtotal: z.number().optional(),
});

describe("storefront cart contract", () => {
  it("accepts cart with lines", () => {
    expect(
      cartSchema.safeParse({
        lines: [{ productId: "p-1", quantity: 2 }],
        subtotal: 24.5,
      }).success,
    ).toBe(true);
  });
});
