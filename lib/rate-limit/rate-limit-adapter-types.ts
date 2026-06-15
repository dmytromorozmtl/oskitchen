import type { RateLimitPolicy } from "@/lib/rate-limit/rate-limit-policies";
export type RateLimitCheckFailureReason = "limited" | "backend_unavailable";

export type RateLimitCheckResult =
  | { ok: true }
  | { ok: false; retryAfterMs?: number; reason?: RateLimitCheckFailureReason };

export interface RateLimitAdapter {
  readonly kind: "memory" | "upstash" | "redis";
  check(bucketKey: string, policy: RateLimitPolicy): Promise<RateLimitCheckResult>;
}
