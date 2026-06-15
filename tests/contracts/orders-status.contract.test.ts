import { describe, expect, it } from "vitest";
import { z } from "zod";

/** Public order lookup response shape (subset). */
const orderLookupSchema = z.object({
  id: z.string().uuid().optional(),
  status: z.string().optional(),
  customerName: z.string().optional(),
  publicLookupToken: z.string().optional(),
});

describe("order public lookup contract", () => {
  it("accepts minimal lookup payload", () => {
    const sample = {
      id: "00000000-0000-4000-8000-000000000001",
      status: "PREPARING",
      customerName: "Alex",
      publicLookupToken: "tok_abc",
    };
    expect(orderLookupSchema.safeParse(sample).success).toBe(true);
  });
});
