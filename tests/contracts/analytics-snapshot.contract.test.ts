import { describe, expect, it } from "vitest";
import { z } from "zod";

const snapshotSchema = z.object({
  id: z.string().uuid(),
  snapshotDate: z.coerce.date(),
  orderCount: z.number().int(),
  grossRevenue: z.union([z.number(), z.string()]),
});

describe("analytics snapshot contract", () => {
  it("accepts snapshot summary", () => {
    expect(
      snapshotSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000001",
        snapshotDate: "2026-05-24",
        orderCount: 42,
        grossRevenue: "1250.00",
      }).success,
    ).toBe(true);
  });
});
