import { describe, expect, it } from "vitest";
import { z } from "zod";

const mealPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CANCELLED"]).optional(),
});

describe("meal plan contract", () => {
  it("accepts active plan", () => {
    expect(mealPlanSchema.safeParse({ id: "mp-1", name: "Weekly prep", status: "ACTIVE" }).success).toBe(
      true,
    );
  });
});
