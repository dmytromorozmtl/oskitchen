import { describe, expect, it } from "vitest";
import { z } from "zod";

const betaLeadSchema = z.object({
  ok: z.literal(true).optional(),
  id: z.string().uuid().optional(),
  error: z.string().optional(),
});

describe("beta / pilot lead API contract", () => {
  it("accepts created lead id", () => {
    expect(
      betaLeadSchema.safeParse({
        ok: true,
        id: "00000000-0000-4000-8000-000000000001",
      }).success,
    ).toBe(true);
  });
});
