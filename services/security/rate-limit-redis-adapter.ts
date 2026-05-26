import { Redis } from "@upstash/redis";

import type { RateLimitAdapter, RateLimitCheckResult } from "@/lib/rate-limit/rate-limit-adapter-types";
import { hashRateLimitKey } from "@/lib/rate-limit/rate-limit-keys";
import type { RateLimitPolicy } from "@/lib/rate-limit/rate-limit-policies";

let redisSingleton: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  if (!redisSingleton) {
    redisSingleton = new Redis({ url, token });
  }
  return redisSingleton;
}

/** Fixed-window counter using Upstash REST (distributed). */
export class RateLimitUpstashAdapter implements RateLimitAdapter {
  readonly kind = "upstash" as const;

  async check(bucketKey: string, policy: RateLimitPolicy): Promise<RateLimitCheckResult> {
    const redis = getRedis();
    if (!redis) {
      return { ok: false, retryAfterMs: policy.windowMs, reason: "backend_unavailable" };
    }
    try {
      const windowId = Math.floor(Date.now() / policy.windowMs);
      const key = `rl:v1:${hashRateLimitKey(bucketKey)}:${windowId}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, policy.windowMs);
      }
      if (count > policy.max) {
        const retryAfterMs = policy.windowMs - (Date.now() % policy.windowMs);
        return { ok: false, retryAfterMs: Math.max(0, retryAfterMs), reason: "limited" };
      }
      return { ok: true };
    } catch {
      return { ok: false, retryAfterMs: policy.windowMs, reason: "backend_unavailable" };
    }
  }
}
