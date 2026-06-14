import { createClient, type RedisClientType } from "redis";

import type { RateLimitAdapter, RateLimitCheckResult } from "@/lib/rate-limit/rate-limit-adapter-types";
import { hashRateLimitKey } from "@/lib/rate-limit/rate-limit-keys";
import type { RateLimitPolicy } from "@/lib/rate-limit/rate-limit-policies";

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType | null> | null = null;

async function getConnectedClient(): Promise<RedisClientType | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!client) {
    client = createClient({ url });
    client.on("error", () => {
      /* avoid crashing Node on transient disconnects */
    });
  }
  if (!connecting) {
    connecting = client
      .connect()
      .then(() => client)
      .catch(() => {
        connecting = null;
        return null;
      });
  }
  return connecting;
}

/** Fixed-window counter using standard Redis (TCP `REDIS_URL`) — server runtime only. */
export class RateLimitTcpRedisAdapter implements RateLimitAdapter {
  readonly kind = "redis" as const;

  async check(bucketKey: string, policy: RateLimitPolicy): Promise<RateLimitCheckResult> {
    const redis = await getConnectedClient();
    if (!redis) {
      return { ok: false, retryAfterMs: policy.windowMs, reason: "backend_unavailable" };
    }
    try {
      const windowId = Math.floor(Date.now() / policy.windowMs);
      const key = `rl:v1:${hashRateLimitKey(bucketKey)}:${windowId}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pExpire(key, policy.windowMs);
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
