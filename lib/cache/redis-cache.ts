import { Redis } from "@upstash/redis";

import { upstashRedisConfigured } from "@/lib/rate-limit/rate-limit-env";

let redisSingleton: Redis | null = null;

function getRedis(): Redis | null {
  if (!upstashRedisConfigured()) return null;
  if (!redisSingleton) {
    redisSingleton = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!.trim(),
      token: process.env.UPSTASH_REDIS_REST_TOKEN!.trim(),
    });
  }
  return redisSingleton;
}

const CACHE_PREFIX = "kos:cache:v1:";

/**
 * Upstash-backed cache with in-process fallback when Redis is not configured.
 */
export async function cachedApiCall<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  const fullKey = `${CACHE_PREFIX}${key}`;

  if (redis) {
    try {
      const cached = await redis.get<T>(fullKey);
      if (cached != null) return cached;
    } catch {
      /* fall through to origin */
    }
  }

  const fresh = await fn();

  if (redis) {
    try {
      await redis.set(fullKey, fresh, { ex: ttlSeconds });
    } catch {
      /* non-fatal */
    }
  }

  return fresh;
}

/** Best-effort invalidation by key prefix (small keyspaces only). */
export async function invalidateCache(pattern: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  const fullPattern = pattern.startsWith(CACHE_PREFIX) ? pattern : `${CACHE_PREFIX}${pattern}`;
  try {
    const keys = await redis.keys(fullPattern);
    if (!keys.length) return 0;
    await redis.del(...keys);
    return keys.length;
  } catch {
    return 0;
  }
}
