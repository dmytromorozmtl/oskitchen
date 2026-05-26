import { NextResponse } from "next/server";

import { resolveEnterpriseApiUserId } from "@/lib/api-public/resolve-enterprise-api";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

export type PublicApiGuardResult =
  | { userId: string }
  | { response: NextResponse };

export async function guardPublicApi(
  request: Request,
  rateLimitKey: string,
  policyKey: RateLimitPolicyKey = "public_api_v1_get",
): Promise<PublicApiGuardResult> {
  const userId = await resolveEnterpriseApiUserId(request.headers.get("authorization"));
  if (!userId) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const ip = getClientIpFromRequest(request);
  const rl = await consumeRateLimitToken(`${rateLimitKey}:${userId}:${ip}`, policyKey);
  if (!rl.ok) {
    if (rl.reason === "misconfigured") {
      return {
        response: NextResponse.json(
          { error: "Public API temporarily unavailable: distributed rate limiting is not configured." },
          { status: 503 },
        ),
      };
    }
    return {
      response: NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        },
      ),
    };
  }

  return { userId };
}

export function isGuardError(
  result: PublicApiGuardResult,
): result is { response: NextResponse } {
  return "response" in result;
}
