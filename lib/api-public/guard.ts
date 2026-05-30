import { NextResponse } from "next/server";

import { resolveEnterpriseApiCredential } from "@/lib/api-public/resolve-enterprise-api";
import { getRequiredScopeForPublicApiRoute } from "@/lib/api-public/public-api-v1-route-scopes";
import type {
  PublicApiV1HttpMethod,
  PublicApiV1ResourceId,
} from "@/lib/api-public/public-api-v1-registry";
import { findPublicApiV1Resource } from "@/lib/api-public/public-api-v1-registry";
import { apiKeyHasScope } from "@/lib/api-public/public-api-scopes";
import type { DeveloperApiScope } from "@/lib/developer/api-scopes";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { enforceRateLimit, rateLimitedJsonResponse } from "@/lib/rate-limit";
import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";

export type PublicApiGuardResult =
  | { userId: string }
  | { response: NextResponse };

export async function guardPublicApi(
  request: Request,
  rateLimitKey: string,
  policyKey: RateLimitPolicyKey = "public_api_v1_get",
  requiredScope?: DeveloperApiScope,
): Promise<PublicApiGuardResult> {
  const credential = await resolveEnterpriseApiCredential(
    request.headers.get("authorization"),
  );
  if (!credential) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (requiredScope && !apiKeyHasScope(credential.scopes, requiredScope)) {
    return {
      response: NextResponse.json(
        {
          error: "Forbidden",
          message: `API key missing required scope: ${requiredScope}`,
          requiredScope,
        },
        { status: 403 },
      ),
    };
  }

  const userId = credential.userId;

  const ip = getClientIpFromRequest(request);
  const rl = await enforceRateLimit(`${rateLimitKey}:${userId}:${ip}`, policyKey);
  if (!rl.ok) {
    if (rl.reason === "misconfigured") {
      return {
        response: rateLimitedJsonResponse(
          { error: "Public API temporarily unavailable: distributed rate limiting is not configured." },
          503,
          rl.headers,
        ),
      };
    }
    return {
      response: rateLimitedJsonResponse(
        { error: "Too many requests. Please slow down." },
        429,
        rl.headers,
      ),
    };
  }

  return { userId };
}

export async function guardPublicApiV1Resource(
  request: Request,
  resourceId: PublicApiV1ResourceId,
  method: PublicApiV1HttpMethod,
  rateLimitKey: string,
): Promise<PublicApiGuardResult> {
  const resource = findPublicApiV1Resource(resourceId);
  const policyKey =
    method === "POST"
      ? resource.postRateLimitPolicy ?? "public_api_v1_post"
      : resource.rateLimitPolicy;
  const requiredScope = getRequiredScopeForPublicApiRoute(resourceId, method);
  return guardPublicApi(request, rateLimitKey, policyKey, requiredScope);
}

export function isGuardError(
  result: PublicApiGuardResult,
): result is { response: NextResponse } {
  return "response" in result;
}
