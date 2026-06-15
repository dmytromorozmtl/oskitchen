import { afterEach, describe, expect, it, vi } from "vitest";

import { consumeRateLimitToken } from "@/services/security/rate-limit-service";
import * as rateLimitAdapter from "@/services/security/rate-limit-adapter";
import {
  rateLimitProductionFailure,
  rateLimitProductionWarning,
} from "@/services/security/rate-limit-adapter";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe("rate limit hardening", () => {
  it("fails critical production policies when only memory adapter is available", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.RATE_LIMIT_ADAPTER;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.REDIS_URL;

    expect(rateLimitProductionWarning()).toContain("in-memory");
    expect(rateLimitProductionFailure()).toContain("Distributed rate limiting is required");

    const res = await consumeRateLimitToken(
      "public_api_orders_post:user-1:127.0.0.1",
      "public_api_orders_post",
    );
    expect(res).toEqual({
      ok: false,
      retryAfterMs: 60_000,
      reason: "misconfigured",
    });
  });

  it("still allows non-critical policies in local memory mode", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.RATE_LIMIT_ADAPTER;

    const res = await consumeRateLimitToken("support_public:127.0.0.1", "support_public");
    expect(res).toEqual({ ok: true });
  });

  it("fails closed for critical policies when the distributed backend is unavailable", async () => {
    vi.spyOn(rateLimitAdapter, "getActiveRateLimitAdapter").mockReturnValue({
      kind: "upstash",
      check: vi.fn().mockResolvedValue({
        ok: false,
        retryAfterMs: 60_000,
        reason: "backend_unavailable",
      }),
    });

    const res = await consumeRateLimitToken(
      "public_api_orders_post:user-1:127.0.0.1",
      "public_api_orders_post",
    );
    expect(res).toEqual({
      ok: false,
      retryAfterMs: 60_000,
      reason: "backend_unavailable",
    });
  });

  it("fails open for non-critical policies when only the distributed backend is unavailable", async () => {
    vi.spyOn(rateLimitAdapter, "getActiveRateLimitAdapter").mockReturnValue({
      kind: "upstash",
      check: vi.fn().mockResolvedValue({
        ok: false,
        retryAfterMs: 60_000,
        reason: "backend_unavailable",
      }),
    });

    const res = await consumeRateLimitToken("support_public:127.0.0.1", "support_public");
    expect(res).toEqual({ ok: true });
  });
});
