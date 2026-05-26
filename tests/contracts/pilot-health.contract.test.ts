import { describe, expect, it } from "vitest";
import { z } from "zod";

const pilotHealthSchema = z.object({
  ok: z.boolean(),
  pilotsActive: z.number().int().optional(),
  issues: z.array(z.string()).optional(),
});

describe("pilot daily health contract", () => {
  it("accepts healthy report", () => {
    expect(pilotHealthSchema.safeParse({ ok: true, pilotsActive: 3, issues: [] }).success).toBe(true);
  });
});
