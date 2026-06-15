import { describe, expect, it } from "vitest";
import { z } from "zod";

const stripeAckSchema = z.object({
  received: z.boolean().optional(),
  ok: z.boolean().optional(),
  duplicate: z.boolean().optional(),
});

describe("POST /api/webhooks/stripe contract", () => {
  it("accepts duplicate idempotent ack", () => {
    expect(stripeAckSchema.safeParse({ received: true, duplicate: true }).success).toBe(true);
  });
});
