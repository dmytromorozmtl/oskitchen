import type { NextRequest } from "next/server";

import { safeInternalNextPath } from "@/lib/auth/safe-redirect";

/** Pathname + query for the current middleware request (relative, no origin). */
export function buildInternalPathWithSearch(request: NextRequest): string {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  return search ? `${path}${search}` : path;
}

/**
 * Post-login return target when an unauthenticated user hits a dashboard route.
 * Honors `?redirect=` from preview=blocked bounce so deep links survive the chain.
 */
export function resolveDashboardLoginReturnPath(request: NextRequest): string {
  const current = buildInternalPathWithSearch(request);
  const embeddedDeepLink = request.nextUrl.searchParams.get("redirect");
  if (embeddedDeepLink?.trim()) {
    return safeInternalNextPath(embeddedDeepLink, current);
  }
  return safeInternalNextPath(current, "/dashboard/today");
}
