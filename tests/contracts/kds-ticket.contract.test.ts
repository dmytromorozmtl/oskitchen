import { describe, expect, it } from "vitest";
import { z } from "zod";

const kdsOrderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  elapsedSeconds: z.number().int().nonnegative(),
  items: z.array(z.string()),
  status: z.string(),
  createdAt: z.string(),
  tableName: z.string().optional(),
  priority: z.enum(["high", "normal", "low"]),
  hasAllergenConflict: z.boolean().optional(),
});

describe("KDS daily order contract", () => {
  it("accepts active ticket with full v1 fields", () => {
    expect(
      kdsOrderSchema.safeParse({
        id: "ord-1",
        customerName: "Alex",
        elapsedSeconds: 420,
        items: ["Bowl x2"],
        status: "PREPARING",
        createdAt: "2026-05-27T12:00:00.000Z",
        priority: "normal",
      }).success,
    ).toBe(true);
  });

  it("accepts allergen conflict flag", () => {
    expect(
      kdsOrderSchema.safeParse({
        id: "ord-2",
        customerName: "Sam",
        elapsedSeconds: 90,
        items: ["PB wrap"],
        status: "PREPARING",
        createdAt: "2026-05-27T12:05:00.000Z",
        tableName: "T4",
        priority: "high",
        hasAllergenConflict: true,
      }).success,
    ).toBe(true);
  });
});
