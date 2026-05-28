import { describe, expect, it } from "vitest";

import {
  getRequiredScopeForPublicApiRoute,
  PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES,
  PUBLIC_API_V1_ROUTE_SCOPE_REQUIREMENTS,
} from "@/lib/api-public/public-api-v1-route-scopes";
import { PUBLIC_API_V1_RESOURCES } from "@/lib/api-public/public-api-v1-registry";

describe("public API v1 route scopes", () => {
  it("maps every registered resource method to a required scope", () => {
    for (const resource of PUBLIC_API_V1_RESOURCES) {
      for (const method of resource.methods) {
        const scope = getRequiredScopeForPublicApiRoute(resource.id, method);
        expect(resource.scopeHints).toContain(scope);
      }
    }
    expect(PUBLIC_API_V1_ROUTE_SCOPE_REQUIREMENTS.length).toBeGreaterThanOrEqual(10);
  });

  it("flags high-risk write routes for Era 17 enforcement", () => {
    expect(PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES.map((entry) => entry.requiredScope)).toEqual([
      "orders:write",
      "webhooks:receive",
      "menus:read",
    ]);
    expect(getRequiredScopeForPublicApiRoute("orders", "POST")).toBe("orders:write");
    expect(getRequiredScopeForPublicApiRoute("webhooks", "POST")).toBe("webhooks:receive");
  });
});
