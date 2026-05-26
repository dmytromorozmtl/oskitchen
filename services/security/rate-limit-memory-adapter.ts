import { checkRateLimit } from "@/lib/rate-limit/rate-limit";
import type { RateLimitPolicy } from "@/lib/rate-limit/rate-limit-policies";
import type { RateLimitAdapter, RateLimitCheckResult } from "@/lib/rate-limit/rate-limit-adapter-types";

export class RateLimitMemoryAdapter implements RateLimitAdapter {
  readonly kind = "memory" as const;

  async check(bucketKey: string, policy: RateLimitPolicy): Promise<RateLimitCheckResult> {
    const res = checkRateLimit(bucketKey, policy);
    if (!res.ok) {
      return { ok: false, retryAfterMs: res.retryAfterMs ?? policy.windowMs, reason: "limited" };
    }
    return { ok: true };
  }
}
