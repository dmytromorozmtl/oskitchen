import type { RateLimitAdapter } from "@/lib/rate-limit/rate-limit-adapter-types";
import {
  distributedRateLimitBackendReady,
  isNodeProduction,
  redisUrlConfigured,
  resolveRateLimitAdapterName,
  upstashRedisConfigured,
} from "@/lib/rate-limit/rate-limit-env";

import { RateLimitMemoryAdapter } from "./rate-limit-memory-adapter";
import { RateLimitTcpRedisAdapter } from "./rate-limit-tcp-redis-adapter";
import { RateLimitUpstashAdapter } from "./rate-limit-redis-adapter";

export type { RateLimitAdapter, RateLimitCheckResult } from "@/lib/rate-limit/rate-limit-adapter-types";

const memory = new RateLimitMemoryAdapter();
const upstash = new RateLimitUpstashAdapter();
const tcpRedis = new RateLimitTcpRedisAdapter();

export function getActiveRateLimitAdapter(): RateLimitAdapter {
  const name = resolveRateLimitAdapterName();
  if (name === "redis" && redisUrlConfigured()) {
    return tcpRedis;
  }
  if (name === "upstash" && upstashRedisConfigured()) {
    return upstash;
  }
  return memory;
}

export function rateLimitProductionWarning(): string | null {
  if (!isNodeProduction()) return null;
  const name = resolveRateLimitAdapterName();
  if (name === "upstash") {
    if (!upstashRedisConfigured()) {
      return "RATE_LIMIT_ADAPTER=upstash but UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are missing — using in-memory rate limits per instance.";
    }
    return null;
  }
  if (name === "redis") {
    if (!redisUrlConfigured()) {
      return "RATE_LIMIT_ADAPTER=redis but REDIS_URL is missing — using in-memory rate limits per instance.";
    }
    return null;
  }
  if (!distributedRateLimitBackendReady()) {
    return "Rate limiting uses in-memory fixed windows per instance — set RATE_LIMIT_ADAPTER=upstash (+ REST creds) or redis (+ REDIS_URL) for distributed quotas.";
  }
  return null;
}

export function rateLimitProductionFailure(): string | null {
  const warning = rateLimitProductionWarning();
  if (!warning) return null;
  return isNodeProduction()
    ? "Distributed rate limiting is required in production for critical routes. Configure Upstash or Redis before serving traffic."
    : null;
}

export function hasCriticalRateLimitMisconfiguration(): boolean {
  return Boolean(rateLimitProductionFailure());
}
