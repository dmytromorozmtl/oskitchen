import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit/rate-limit";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

describe("checkRateLimit", () => {
  it("blocks after max within window", () => {
    const key = `t:${Math.random()}`;
    expect(checkRateLimit(key, { windowMs: 60_000, max: 2 }).ok).toBe(true);
    expect(checkRateLimit(key, { windowMs: 60_000, max: 2 }).ok).toBe(true);
    expect(checkRateLimit(key, { windowMs: 60_000, max: 2 }).ok).toBe(false);
  });
});

describe("consumeRateLimitToken (memory adapter)", () => {
  it("blocks after policy max within window", async () => {
    const key = `async:${Math.random()}`;
    for (let i = 0; i < 6; i++) {
      expect((await consumeRateLimitToken(key, "book_demo")).ok).toBe(true);
    }
    expect((await consumeRateLimitToken(key, "book_demo")).ok).toBe(false);
  });

  it("accepts first token for POS CRM search policy", async () => {
    const key = `pos-crm:${Math.random()}`;
    expect((await consumeRateLimitToken(key, "pos_crm_customer_search")).ok).toBe(true);
  });
});
