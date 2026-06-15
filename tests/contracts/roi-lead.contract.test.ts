import { describe, expect, it } from "vitest";
import { z } from "zod";

const roiResponseSchema = z.object({
  ok: z.boolean(),
  error: z.string().optional(),
});

describe("POST /api/leads/roi contract", () => {
  it("validates response envelope", () => {
    expect(roiResponseSchema.safeParse({ ok: true }).success).toBe(true);
    expect(roiResponseSchema.safeParse({ ok: false, error: "Invalid payload" }).success).toBe(true);
  });
});
