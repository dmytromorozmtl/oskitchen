import { beforeEach, describe, expect, it, vi } from "vitest";

const consumeRateLimitToken = vi.hoisted(() => vi.fn());

vi.mock("@/services/security/rate-limit-service", () => ({ consumeRateLimitToken }));

import { enforceBillingApiRateLimit } from "@/lib/billing/billing-api-rate-limit";

describe("enforceBillingApiRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitToken.mockResolvedValue({ ok: true });
  });

  it("returns null when under limit", async () => {
    const result = await enforceBillingApiRateLimit(
      new Request("https://example.com"),
      "user-1",
      "billing_portal",
    );
    expect(result).toBeNull();
    expect(consumeRateLimitToken).toHaveBeenCalledWith(
      expect.stringMatching(/^billing_portal:user-1:/),
      "billing_portal",
    );
  });

  it("returns 429 when rate limited", async () => {
    consumeRateLimitToken.mockResolvedValue({ ok: false, retryAfterMs: 30_000 });

    const result = await enforceBillingApiRateLimit(
      new Request("https://example.com"),
      "user-1",
      "billing_portal",
    );

    expect(result?.status).toBe(429);
    await expect(result?.json()).resolves.toEqual({
      error: "Too many attempts. Please try again in a minute.",
    });
  });
});
