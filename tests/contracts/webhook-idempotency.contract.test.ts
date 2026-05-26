import { describe, expect, it } from "vitest";
import { z } from "zod";

const webhookAckSchema = z.object({
  ok: z.literal(true),
  duplicate: z.boolean().optional(),
  externalOrderId: z.string().optional(),
});

describe("integration webhook ack contract", () => {
  it("accepts idempotent duplicate ack", () => {
    expect(webhookAckSchema.safeParse({ ok: true, duplicate: true }).success).toBe(true);
  });

  it("accepts first-process ack with external id", () => {
    expect(
      webhookAckSchema.safeParse({ ok: true, externalOrderId: "ue-12345" }).success,
    ).toBe(true);
  });
});
