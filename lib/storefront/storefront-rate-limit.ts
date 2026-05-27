import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { getRequestClientIp } from "@/lib/rate-limit/client-ip";
import {
  RATE_LIMIT_POLICIES,
  type RateLimitPolicyKey,
} from "@/lib/rate-limit/rate-limit-policies";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";
import {
  STOREFRONT_ROUTE_POLICY,
  type StorefrontRateLimitRouteKey,
} from "@/lib/storefront/rate-limit-config";

function bucket(scope: string, ip: string, extra?: string): string {
  return extra ? `storefront:${scope}:${ip}:${extra}` : `storefront:${scope}:${ip}`;
}

export async function enforceStorefrontRateLimit(
  policyKey: RateLimitPolicyKey,
  opts?: { ip?: string; scopeSuffix?: string },
): Promise<{ ok: true } | { ok: false; retryAfterMs: number; message: string }> {
  const ip = opts?.ip ?? (await getRequestClientIp());
  const key = bucket(policyKey, ip, opts?.scopeSuffix);
  const res = await consumeRateLimitToken(key, policyKey);
  if (res.ok) return { ok: true };
  if (res.reason === "misconfigured") {
    return {
      ok: false,
      retryAfterMs: res.retryAfterMs,
      message:
        "Online ordering is temporarily unavailable while storefront rate limiting is being configured.",
    };
  }
  const sec = Math.ceil(res.retryAfterMs / 1000);
  return {
    ok: false,
    retryAfterMs: res.retryAfterMs,
    message: `Too many requests. Try again in ${sec} second${sec === 1 ? "" : "s"}.`,
  };
}

export async function enforceStorefrontRateLimitFromRequest(
  request: Request,
  policyKey: RateLimitPolicyKey,
  scopeSuffix?: string,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number; message: string }> {
  const ip = getClientIpFromRequest(request);
  return enforceStorefrontRateLimit(policyKey, { ip, scopeSuffix });
}

/** Rate limit by storefront route key (see lib/storefront/rate-limit-config.ts). */
export async function enforceStorefrontRouteRateLimit(
  request: Request,
  routeKey: StorefrontRateLimitRouteKey,
  scopeSuffix?: string,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number; message: string }> {
  return enforceStorefrontRateLimitFromRequest(request, STOREFRONT_ROUTE_POLICY[routeKey], scopeSuffix);
}

export function storefrontRateLimitPolicySummary(): Record<string, { windowMs: number; max: number }> {
  return {
    storefront_checkout_submit: RATE_LIMIT_POLICIES.storefront_checkout_submit,
    storefront_checkout_retry: RATE_LIMIT_POLICIES.storefront_checkout_retry,
    storefront_analytics_ingest: RATE_LIMIT_POLICIES.storefront_analytics_ingest,
    storefront_contact_submit: RATE_LIMIT_POLICIES.storefront_contact_submit,
  };
}
