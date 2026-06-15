export type RateLimitAdapterName = "memory" | "upstash" | "redis";

/**
 * Resolve rate-limit backend. In production, prefer distributed Redis when
 * credentials are present even if RATE_LIMIT_ADAPTER is unset (Vercel multi-instance).
 */
export function resolveRateLimitAdapterName(): RateLimitAdapterName {
  const raw = process.env.RATE_LIMIT_ADAPTER?.trim().toLowerCase();
  if (raw === "upstash") return "upstash";
  if (raw === "redis") return "redis";
  if (raw === "memory") return "memory";
  if (isNodeProduction()) {
    if (upstashRedisConfigured()) return "upstash";
    if (redisUrlConfigured()) return "redis";
  }
  return "memory";
}

export function isNodeProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function upstashRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

export function redisUrlConfigured(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

/** True when the configured adapter can use a shared Redis counter (not in-process memory). */
export function distributedRateLimitBackendReady(): boolean {
  const name = resolveRateLimitAdapterName();
  if (name === "upstash") return upstashRedisConfigured();
  if (name === "redis") return redisUrlConfigured();
  return false;
}
