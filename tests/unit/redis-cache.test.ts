import { afterEach, describe, expect, it, vi } from "vitest";

const redisGet = vi.hoisted(() => vi.fn());
const redisSet = vi.hoisted(() => vi.fn());

vi.mock("@upstash/redis", () => ({
  Redis: class MockRedis {
    get = redisGet;
    set = redisSet;
    keys = vi.fn();
    del = vi.fn();
  },
}));

vi.mock("@/lib/rate-limit/rate-limit-env", () => ({
  upstashRedisConfigured: vi.fn(() => false),
}));

import { upstashRedisConfigured } from "@/lib/rate-limit/rate-limit-env";
import { cachedApiCall } from "@/lib/cache/redis-cache";

describe("cachedApiCall", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    redisGet.mockReset();
    redisSet.mockReset();
  });

  it("calls fn when redis is not configured", async () => {
    vi.mocked(upstashRedisConfigured).mockReturnValue(false);
    const fn = vi.fn(async () => ({ ok: true }));
    const result = await cachedApiCall("test-key", 60, fn);
    expect(result).toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(redisGet).not.toHaveBeenCalled();
  });

  it("returns cached value when redis hit", async () => {
    vi.mocked(upstashRedisConfigured).mockReturnValue(true);
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    redisGet.mockResolvedValue({ cached: 1 });
    const fn = vi.fn(async () => ({ fresh: 1 }));
    const result = await cachedApiCall("hit", 30, fn);
    expect(result).toEqual({ cached: 1 });
    expect(fn).not.toHaveBeenCalled();
  });
});
