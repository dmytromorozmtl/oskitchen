import { NextRequest } from "next/server";

import { resolveDashboardLoginReturnPath } from "@/lib/auth/dashboard-login-return-path";
import {
  enforcePreviewRouteGuard,
  isBlockedPreviewDashboardRoute,
  previewRouteRedirectUrl,
} from "@/lib/navigation/preview-route-guard";
import { PREVIEW_ROUTE_GUARD_REDIRECT_PATH } from "@/lib/navigation/preview-route-guard-policy";

export type PreviewRouteRedirectRegressionCaseResult = {
  sourcePath: string;
  blocked: boolean;
  guardStatus: number | null;
  redirectPathname: string;
  previewParam: string | null;
  redirectParam: string | null;
  loginReturnPath: string;
  passed: boolean;
};

function requestFor(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

function expectedDeepLink(sourcePath: string): string {
  const url = new URL(sourcePath, "http://localhost:3000");
  return `${url.pathname}${url.search}`;
}

/** Assert preview=blocked redirect chain preserves deep link for one route. */
export function assertPreviewRouteRedirectRegression(
  sourcePath: string,
): PreviewRouteRedirectRegressionCaseResult {
  const request = requestFor(sourcePath);
  const deepLink = expectedDeepLink(sourcePath);
  const blocked = isBlockedPreviewDashboardRoute(request.nextUrl.pathname);
  const redirectUrl = previewRouteRedirectUrl(request);
  const guardResponse = enforcePreviewRouteGuard(request);
  const bounceRequest = requestFor(redirectUrl.toString());
  const loginReturnPath = resolveDashboardLoginReturnPath(bounceRequest);

  const previewParam = redirectUrl.searchParams.get("preview");
  const redirectParam = redirectUrl.searchParams.get("redirect");

  const passed =
    blocked &&
    redirectUrl.pathname === PREVIEW_ROUTE_GUARD_REDIRECT_PATH &&
    previewParam === "blocked" &&
    redirectParam === deepLink &&
    loginReturnPath === deepLink &&
    guardResponse !== null &&
    guardResponse.status >= 300 &&
    guardResponse.status < 400;

  return {
    sourcePath: deepLink,
    blocked,
    guardStatus: guardResponse?.status ?? null,
    redirectPathname: redirectUrl.pathname,
    previewParam,
    redirectParam,
    loginReturnPath,
    passed,
  };
}

/** Run regression for all canonical routes; returns per-route results. */
export function runPreviewRouteRedirectRegression(
  routes: readonly string[],
): PreviewRouteRedirectRegressionCaseResult[] {
  return routes.map((route) => assertPreviewRouteRedirectRegression(route));
}

export function allPreviewRouteRedirectRegressionPassed(
  results: PreviewRouteRedirectRegressionCaseResult[],
): boolean {
  return results.length > 0 && results.every((row) => row.passed);
}
