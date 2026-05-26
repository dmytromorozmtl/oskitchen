import { webhookReceiverRateLimitKey } from "@/lib/rate-limit/rate-limit-keys";
import {
  RATE_LIMIT_POLICIES,
  isProductionCriticalRateLimitPolicy,
  type RateLimitPolicyKey,
} from "@/lib/rate-limit/rate-limit-policies";

import {
  getActiveRateLimitAdapter,
  rateLimitProductionFailure,
} from "./rate-limit-adapter";

export async function consumeRateLimitToken(
  bucketKey: string,
  policyKey: RateLimitPolicyKey,
): Promise<
  | { ok: true }
  | { ok: false; retryAfterMs: number; reason?: "misconfigured" | "limited" | "backend_unavailable" }
> {
  const policy = RATE_LIMIT_POLICIES[policyKey];
  const adapter = getActiveRateLimitAdapter();
  if (adapter.kind === "memory" && isProductionCriticalRateLimitPolicy(policyKey)) {
    const failure = rateLimitProductionFailure();
    if (failure) {
      return { ok: false, retryAfterMs: policy.windowMs, reason: "misconfigured" };
    }
  }
  const res = await adapter.check(bucketKey, policy);
  if (!res.ok) {
    if (res.reason === "backend_unavailable") {
      if (isProductionCriticalRateLimitPolicy(policyKey)) {
        return {
          ok: false,
          retryAfterMs: res.retryAfterMs ?? policy.windowMs,
          reason: "backend_unavailable",
        };
      }
      return { ok: true };
    }
    return {
      ok: false,
      retryAfterMs: res.retryAfterMs ?? policy.windowMs,
      reason: res.reason ?? "limited",
    };
  }
  return { ok: true };
}

export { checkRateLimit } from "@/lib/rate-limit/rate-limit";

/** Distributed ceiling for signed webhook ingress — no-op unless a distributed adapter (Upstash or TCP Redis) is active. */
export async function checkWebhookIngestDistributedLimit(params: {
  provider: string;
  connectionId: string;
  topic: string;
}): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  if (getActiveRateLimitAdapter().kind === "memory") {
    const failure = rateLimitProductionFailure();
    if (!failure) {
      return { ok: true };
    }
    return { ok: false, retryAfterMs: RATE_LIMIT_POLICIES.webhook_ingest.windowMs };
  }
  const bucket = webhookReceiverRateLimitKey(params.provider, params.connectionId, params.topic);
  return consumeRateLimitToken(bucket, "webhook_ingest");
}
