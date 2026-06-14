import { createHash } from "node:crypto";

import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { publicApiRateLimitKey } from "@/lib/rate-limit/rate-limit-keys";
import { resolveBurstPolicyForApiKey } from "@/lib/developer/developer-api-sandbox-p2-75";
import {
  enforceRateLimit,
  type EnforceRateLimitResult,
} from "@/lib/rate-limit";
import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";

/** SHA-256 fingerprint of bearer token — never log or persist the raw secret. */
export function fingerprintPublicApiBearer(authHeader: string | null): string {
  if (!authHeader?.startsWith("Bearer ")) return "anonymous";
  const token = authHeader.slice(7).trim();
  if (!token) return "anonymous";
  return createHash("sha256").update(token, "utf8").digest("hex").slice(0, 24);
}

export type PublicApiRateLimitInput = {
  request: Request;
  routeKey: string;
  userId: string;
  policyKey: RateLimitPolicyKey;
};

/**
 * Dual-bucket enforcement: per-API-key global burst + per-route user+IP window.
 * Returns the route-level snapshot for X-RateLimit-* headers on success.
 */
export async function enforcePublicApiRateLimits(
  input: PublicApiRateLimitInput,
): Promise<EnforceRateLimitResult> {
  const ip = getClientIpFromRequest(input.request);
  const authHeader = input.request.headers.get("authorization");
  const keyFingerprint = fingerprintPublicApiBearer(authHeader);
  const rawToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const burstPolicy = rawToken ? resolveBurstPolicyForApiKey(rawToken) : "public_api_key_burst";

  const keyBurst = await enforceRateLimit(
    `public_api:key:${keyFingerprint}`,
    burstPolicy,
  );
  if (!keyBurst.ok) {
    return keyBurst;
  }

  return enforceRateLimit(
    publicApiRateLimitKey(input.routeKey, input.userId, ip),
    input.policyKey,
  );
}

export const PUBLIC_API_RATE_LIMIT_DOC = {
  burstPolicy: "public_api_key_burst",
  sandboxBurstPolicy: "public_api_sandbox_key_burst",
  burstWindow: "60s",
  burstMax: 600,
  sandboxBurstMax: 120,
  routePolicies: [
    "public_api_v1_get",
    "public_api_v1_post",
    "public_api_orders_get",
    "public_api_orders_post",
    "public_api_customers_get",
  ],
  headers: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"],
} as const;
