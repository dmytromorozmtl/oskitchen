import { describe, expect, it } from "vitest";
import { z } from "zod";

const kbArticleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.string().optional(),
});

describe("KB article contract", () => {
  it("accepts article metadata", () => {
    expect(
      kbArticleSchema.safeParse({
        slug: "kds-overdue",
        title: "KDS overdue alerts",
        category: "kitchen",
      }).success,
    ).toBe(true);
  });
});
