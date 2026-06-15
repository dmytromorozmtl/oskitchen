import { describe, expect, it } from "vitest";
import { z } from "zod";

const integrationHealthRowSchema = z.object({
  provider: z.string(),
  status: z.string(),
  connectionId: z.string().optional(),
});

describe("integration health panel contract", () => {
  it("accepts provider status row", () => {
    expect(
      integrationHealthRowSchema.safeParse({
        provider: "UBER_EATS",
        status: "CONNECTED",
        connectionId: "00000000-0000-4000-8000-000000000001",
      }).success,
    ).toBe(true);
  });
});
