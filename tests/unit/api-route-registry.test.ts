import { describe, expect, it } from "vitest";

import {
  getApiRoutePolicy,
  isApiRouteExemptFromMiddleware,
  routeUsesDashboardSession,
} from "@/lib/api/route-registry";

describe("api route registry", () => {
  it("classifies public API routes explicitly", () => {
    expect(getApiRoutePolicy("/api/public/v1/orders")).toEqual({
      routeClass: "public_api_key",
      authStrategy: "handler_api_key",
    });
    expect(isApiRouteExemptFromMiddleware("/api/public/v1/orders")).toBe(true);
  });

  it("keeps handler-authenticated dashboard routes out of middleware exemptions only", () => {
    expect(getApiRoutePolicy("/api/billing/subscription")).toEqual({
      routeClass: "dashboard_session",
      authStrategy: "handler_session",
    });
    expect(isApiRouteExemptFromMiddleware("/api/billing/subscription")).toBe(true);
    expect(routeUsesDashboardSession("/api/billing/subscription")).toBe(true);
  });

  it("fails coverage for unknown api subtrees", () => {
    expect(getApiRoutePolicy("/api/unknown/new-route")).toBeNull();
  });
});
