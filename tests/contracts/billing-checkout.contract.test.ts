import { describe, expect, it } from "vitest";
import { z } from "zod";

const checkoutErrorSchema = z.object({
  error: z.string(),
});

const checkoutOkSchema = z.object({
  url: z.string().url().optional(),
  sessionId: z.string().optional(),
});

describe("billing checkout contract", () => {
  it("accepts error envelope", () => {
    expect(checkoutErrorSchema.safeParse({ error: "Unauthorized" }).success).toBe(true);
  });

  it("accepts redirect session", () => {
    expect(
      checkoutOkSchema.safeParse({
        url: "https://checkout.stripe.com/c/pay/cs_test",
        sessionId: "cs_test_123",
      }).success,
    ).toBe(true);
  });
});
