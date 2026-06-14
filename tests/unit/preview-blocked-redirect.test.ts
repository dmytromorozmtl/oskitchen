import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { resolveDashboardLoginReturnPath } from "@/lib/auth/dashboard-login-return-path";
import { previewRouteRedirectUrl } from "@/lib/navigation/preview-route-guard";
import { PREVIEW_ROUTE_GUARD_REDIRECT_PATH } from "@/lib/navigation/preview-route-guard-policy";

function requestFor(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("preview=blocked deep link preservation (P0-5)", () => {
  it("adds redirect param when blocking preview dashboard routes", () => {
    const url = previewRouteRedirectUrl(requestFor("/dashboard/copilot"));
    expect(url.pathname).toBe(PREVIEW_ROUTE_GUARD_REDIRECT_PATH);
    expect(url.searchParams.get("preview")).toBe("blocked");
    expect(url.searchParams.get("redirect")).toBe("/dashboard/copilot");
  });

  it("preserves query string in redirect deep link", () => {
    const url = previewRouteRedirectUrl(requestFor("/dashboard/quick-start?phase=2"));
    expect(url.searchParams.get("redirect")).toBe("/dashboard/quick-start?phase=2");
  });

  it("passes embedded redirect through dashboard login gate", () => {
    const returnPath = resolveDashboardLoginReturnPath(
      requestFor(
        `${PREVIEW_ROUTE_GUARD_REDIRECT_PATH}?preview=blocked&redirect=${encodeURIComponent("/dashboard/enterprise/multi-location")}`,
      ),
    );
    expect(returnPath).toBe("/dashboard/enterprise/multi-location");
  });

  it("falls back to current dashboard path when no embedded redirect", () => {
    expect(resolveDashboardLoginReturnPath(requestFor("/dashboard/settings/billing"))).toBe(
      "/dashboard/settings/billing",
    );
  });
});
