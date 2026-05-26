import { describe, expect, it } from "vitest";
import { z } from "zod";

const quoteListItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  status: z.string().optional(),
  total: z.number().optional(),
});

describe("catering quote list contract", () => {
  it("accepts quote summary row", () => {
    expect(
      quoteListItemSchema.safeParse({
        id: "q-1",
        title: "Corporate lunch",
        status: "DRAFT",
        total: 1200,
      }).success,
    ).toBe(true);
  });
});
