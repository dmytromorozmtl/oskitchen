import { describe, expect, it } from "vitest";
import { z } from "zod";

const cronOkSchema = z.object({
  ok: z.literal(true),
});

describe("cron route ack contract", () => {
  it("accepts standard ok payload", () => {
    expect(cronOkSchema.safeParse({ ok: true }).success).toBe(true);
  });
});
