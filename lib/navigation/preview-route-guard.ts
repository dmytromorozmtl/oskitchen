import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getNavMaturityExposure,
  type NavMaturityExposure,
} from "@/lib/navigation/nav-maturity-governance";
import {
  PREVIEW_ROUTE_BLOCK_EXPOSURES,
  PREVIEW_ROUTE_GUARD_BYPASS_COOKIE,
  PREVIEW_ROUTE_GUARD_BYPASS_VALUE,
  PREVIEW_ROUTE_GUARD_REDIRECT_PATH,
  type PreviewRouteBlockExposure,
} from "@/lib/navigation/preview-route-guard-policy";

export function isPreviewRouteBlockExposure(
  exposure: NavMaturityExposure,
): exposure is PreviewRouteBlockExposure {
  return (PREVIEW_ROUTE_BLOCK_EXPOSURES as readonly string[]).includes(exposure);
}

export function isBlockedPreviewDashboardRoute(pathname: string): boolean {
  if (!pathname.startsWith("/dashboard")) return false;
  const exposure = getNavMaturityExposure(pathname);
  return isPreviewRouteBlockExposure(exposure);
}

export function hasPreviewRouteBypass(request: NextRequest): boolean {
  const scope = request.cookies.get(PREVIEW_ROUTE_GUARD_BYPASS_COOKIE)?.value?.trim();
  return scope === PREVIEW_ROUTE_GUARD_BYPASS_VALUE;
}

export function previewRouteRedirectUrl(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  url.pathname = PREVIEW_ROUTE_GUARD_REDIRECT_PATH;
  url.searchParams.set("preview", "blocked");
  return url;
}

/** Returns redirect response when route is blocked; null when allowed. */
export function enforcePreviewRouteGuard(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  if (!isBlockedPreviewDashboardRoute(pathname)) return null;
  if (hasPreviewRouteBypass(request)) return null;
  return NextResponse.redirect(previewRouteRedirectUrl(request));
}
