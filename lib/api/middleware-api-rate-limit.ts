import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getApiRoutePolicy, type ApiRouteClass } from "@/lib/api/route-registry";
import {
  enforceRateLimit,
  rateLimitedJsonResponse,
  type EnforceRateLimitResult,
} from "@/lib/rate-limit";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";

export const API_MUTATION_RATE_LIMIT_POLICY = "api_mutation" as const;

const MUTATION_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

/** Route classes with dedicated rate-limit stacks (webhooks, storefront, public API, cron). */
export const API_MUTATION_RATE_LIMIT_EXEMPT_ROUTE_CLASSES: readonly ApiRouteClass[] = [
  "webhook_signed",
  "cron_secret",
  "health",
  "storefront_public",
  "public_api_key",
];

export function isApiMutationMethod(method: string): boolean {
  return MUTATION_METHODS.has(method.toUpperCase());
}

/** Stable scope key for mutation buckets — e.g. mutation:integrations.shopify.sync-products */
export function apiMutationScopeKey(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "") || "/api";
  const suffix = normalized.startsWith("/api/")
    ? normalized.slice("/api/".length)
    : normalized.replace(/^\/api\/?/, "");
  return `mutation:${suffix.replace(/\//g, ".") || "root"}`;
}

export function isApiMutationRateLimitExempt(pathname: string): boolean {
  if (!pathname.startsWith("/api/")) return true;
  const policy = getApiRoutePolicy(pathname);
  if (!policy) return false;
  return API_MUTATION_RATE_LIMIT_EXEMPT_ROUTE_CLASSES.includes(policy.routeClass);
}

export async function enforceApiRateLimit(
  request: Request,
  scopeKey: string,
): Promise<EnforceRateLimitResult> {
  const ip = getClientIpFromRequest(request);
  return enforceRateLimit(`api:${scopeKey}:${ip}`, API_MUTATION_RATE_LIMIT_POLICY);
}

export function apiRateLimitExceededResponse(result: EnforceRateLimitResult): NextResponse {
  const status =
    result.reason === "misconfigured" || result.reason === "backend_unavailable" ? 503 : 429;
  return rateLimitedJsonResponse(
    {
      error:
        status === 503
          ? "Rate limiting is temporarily unavailable."
          : "Too many requests. Please slow down.",
    },
    status,
    result.headers,
  );
}

/** Returns 429/503 JSON when limited; otherwise null (continue to handler). */
export async function enforceApiRateLimitOrNull(
  request: Request,
  scopeKey: string,
): Promise<NextResponse | null> {
  const limited = await enforceApiRateLimit(request, scopeKey);
  if (limited.ok) return null;
  return apiRateLimitExceededResponse(limited);
}

/** Edge middleware gate for non-exempt /api mutation methods. */
export async function enforceApiMutationRateLimitMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) return null;
  if (!isApiMutationMethod(request.method)) return null;
  if (isApiMutationRateLimitExempt(pathname)) return null;

  return enforceApiRateLimitOrNull(request, apiMutationScopeKey(pathname));
}
