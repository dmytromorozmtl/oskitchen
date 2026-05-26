import { afterEach, describe, expect, it, vi } from "vitest";

import { rateLimitProductionWarning } from "@/services/security/rate-limit-adapter";

describe("rateLimitProductionWarning", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(rateLimitProductionWarning()).toBeNull();
  });

  it("warns in production when Upstash is not active", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_ADAPTER", "memory");
    const w = rateLimitProductionWarning();
    expect(w).toContain("in-memory");
  });

  it("returns null in production when Upstash is configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_ADAPTER", "upstash");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    expect(rateLimitProductionWarning()).toBeNull();
  });

  it("warns in production when redis adapter selected but REDIS_URL missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_ADAPTER", "redis");
    expect(rateLimitProductionWarning()).toContain("REDIS_URL");
  });

  it("returns null in production when redis adapter and REDIS_URL are set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_ADAPTER", "redis");
    vi.stubEnv("REDIS_URL", "redis://127.0.0.1:6379");
    expect(rateLimitProductionWarning()).toBeNull();
  });
});
