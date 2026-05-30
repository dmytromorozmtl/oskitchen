import { NextResponse } from "next/server";

import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import {
  RATE_LIMIT_POLICIES,
  type RateLimitPolicyKey,
} from "@/lib/rate-limit/rate-limit-policies";
import {
  checkWebhookIngestDistributedLimit,
  consumeRateLimitToken,
} from "@/services/security/rate-limit-service";

export { RATE_LIMIT_POLICIES, type RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";
export { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";

export type RateLimitSnapshot = {
  limit: number;
  remaining: number;
  /** Unix epoch seconds when the window resets. */
  resetAt: number;
};

export type EnforceRateLimitResult =
  | { ok: true; snapshot: RateLimitSnapshot; headers: Record<string, string> }
  | {
      ok: false;
      retryAfterMs: number;
      reason?: "misconfigured" | "limited" | "backend_unavailable";
      snapshot: RateLimitSnapshot;
      headers: Record<string, string>;
    };

/** Fixed-window reset timestamp (seconds) aligned to policy windowMs. */
export function computeResetAt(windowMs: number, nowMs = Date.now()): number {
  const windowStart = Math.floor(nowMs / windowMs) * windowMs;
  return Math.ceil((windowStart + windowMs) / 1000);
}

export function buildRateLimitHeaders(
  snapshot: RateLimitSnapshot,
  retryAfterMs?: number,
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(snapshot.limit),
    "X-RateLimit-Remaining": String(Math.max(0, snapshot.remaining)),
    "X-RateLimit-Reset": String(snapshot.resetAt),
  };
  if (retryAfterMs != null && retryAfterMs > 0) {
    headers["Retry-After"] = String(Math.max(1, Math.ceil(retryAfterMs / 1000)));
  }
  return headers;
}

export function snapshotForPolicy(
  policyKey: RateLimitPolicyKey,
  opts: { ok: boolean; retryAfterMs?: number; remaining?: number },
  nowMs = Date.now(),
): RateLimitSnapshot {
  const policy = RATE_LIMIT_POLICIES[policyKey];
  return {
    limit: policy.max,
    remaining: opts.ok ? Math.max(0, opts.remaining ?? policy.max) : 0,
    resetAt: computeResetAt(policy.windowMs, nowMs),
  };
}

/** Configurable fixed-window limit via active adapter (memory / Upstash / Redis). */
export async function enforceRateLimit(
  bucketKey: string,
  policyKey: RateLimitPolicyKey,
): Promise<EnforceRateLimitResult> {
  const result = await consumeRateLimitToken(bucketKey, policyKey);
  if (result.ok) {
    const snapshot = snapshotForPolicy(policyKey, { ok: true });
    return { ok: true, snapshot, headers: buildRateLimitHeaders(snapshot) };
  }

  const snapshot = snapshotForPolicy(policyKey, {
    ok: false,
    retryAfterMs: result.retryAfterMs,
  });
  const headers = buildRateLimitHeaders(snapshot, result.retryAfterMs);
  return {
    ok: false,
    retryAfterMs: result.retryAfterMs,
    reason: result.reason,
    snapshot,
    headers,
  };
}

export function rateLimitedJsonResponse(
  body: Record<string, unknown>,
  status: 429 | 503,
  headers: Record<string, string>,
): NextResponse {
  return NextResponse.json(body, { status, headers });
}

/** Connection-scoped webhook ingest ceiling (WooCommerce / Shopify). */
export async function enforceWebhookIngestRateLimit(params: {
  provider: string;
  connectionId: string;
  topic: string;
}): Promise<EnforceRateLimitResult> {
  const result = await checkWebhookIngestDistributedLimit(params);
  if (result.ok) {
    const snapshot = snapshotForPolicy("webhook_ingest", { ok: true });
    return { ok: true, snapshot, headers: buildRateLimitHeaders(snapshot) };
  }

  const snapshot = snapshotForPolicy("webhook_ingest", {
    ok: false,
    retryAfterMs: result.retryAfterMs,
  });
  const headers = buildRateLimitHeaders(snapshot, result.retryAfterMs);
  return {
    ok: false,
    retryAfterMs: result.retryAfterMs,
    reason: "limited",
    snapshot,
    headers,
  };
}

/** Provider + IP webhook ingress limit (Stripe, Resend, unsigned routes). */
export async function enforceWebhookIpRateLimit(
  request: Request,
  provider: string,
): Promise<EnforceRateLimitResult> {
  const ip = getClientIpFromRequest(request);
  return enforceRateLimit(`webhook_ip:${provider}:${ip}`, "webhook_ingest");
}
