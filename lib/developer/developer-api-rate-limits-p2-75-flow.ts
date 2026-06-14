import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit/rate-limit-policies";
import {
  productionBurstMax,
  resolveBurstPolicyForApiKey,
  sandboxBurstMax,
} from "@/lib/developer/developer-api-sandbox-p2-75";

export type RateLimitBucketSim = {
  keyFingerprint: string;
  count: number;
  max: number;
  windowMs: number;
};

export type RateLimitSimResult =
  | { ok: true; bucket: RateLimitBucketSim; remaining: number }
  | { ok: false; bucket: RateLimitBucketSim; error: string };

function fingerprintKey(raw: string): string {
  return raw.slice(0, 16);
}

export function simulatePerKeyBurstLimit(
  apiKey: string,
  currentCount: number,
): RateLimitSimResult {
  const policyKey = resolveBurstPolicyForApiKey(apiKey);
  const policy = RATE_LIMIT_POLICIES[policyKey];
  const bucket: RateLimitBucketSim = {
    keyFingerprint: fingerprintKey(apiKey),
    count: currentCount,
    max: policy.max,
    windowMs: policy.windowMs,
  };

  if (currentCount >= policy.max) {
    return { ok: false, bucket, error: "Rate limit exceeded (429)" };
  }

  return { ok: true, bucket, remaining: policy.max - currentCount - 1 };
}

export function simulateRouteLimit(
  routeKey: string,
  policyKey: keyof typeof RATE_LIMIT_POLICIES,
  currentCount: number,
): RateLimitSimResult {
  const policy = RATE_LIMIT_POLICIES[policyKey];
  const bucket: RateLimitBucketSim = {
    keyFingerprint: routeKey,
    count: currentCount,
    max: policy.max,
    windowMs: policy.windowMs,
  };

  if (currentCount >= policy.max) {
    return { ok: false, bucket, error: "Route rate limit exceeded (429)" };
  }

  return { ok: true, bucket, remaining: policy.max - currentCount - 1 };
}

export function simulateDualBucketPublicApiLimit(input: {
  apiKey: string;
  routeKey: string;
  keyCount: number;
  routeCount: number;
  routePolicy?: keyof typeof RATE_LIMIT_POLICIES;
}): { ok: boolean; keyRemaining?: number; routeRemaining?: number; error?: string } {
  const keyResult = simulatePerKeyBurstLimit(input.apiKey, input.keyCount);
  if (!keyResult.ok) return { ok: false, error: keyResult.error };

  const routeResult = simulateRouteLimit(
    input.routeKey,
    input.routePolicy ?? "public_api_v1_get",
    input.routeCount,
  );
  if (!routeResult.ok) return { ok: false, error: routeResult.error };

  return {
    ok: true,
    keyRemaining: keyResult.remaining,
    routeRemaining: routeResult.remaining,
  };
}

export { productionBurstMax, sandboxBurstMax };
