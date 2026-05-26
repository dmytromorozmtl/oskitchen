import { describe, expect, it } from "vitest";
import { z } from "zod";

const kdsOrderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  elapsedSeconds: z.number().int().nonnegative(),
  items: z.array(z.string()),
});

describe("KDS daily order contract", () => {
  it("accepts active ticket", () => {
    expect(
      kdsOrderSchema.safeParse({
        id: "ord-1",
        customerName: "Alex",
        elapsedSeconds: 420,
        items: ["Bowl x2"],
      }).success,
    ).toBe(true);
  });
});
