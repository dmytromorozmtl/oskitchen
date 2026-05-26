import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveRateLimitAdapterName } from "@/lib/rate-limit/rate-limit-env";

describe("resolveRateLimitAdapterName production auto-select", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("auto-selects upstash in production when creds present and adapter unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    delete process.env.RATE_LIMIT_ADAPTER;
    expect(resolveRateLimitAdapterName()).toBe("upstash");
  });

  it("respects explicit memory in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_ADAPTER", "memory");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    expect(resolveRateLimitAdapterName()).toBe("memory");
  });
});
