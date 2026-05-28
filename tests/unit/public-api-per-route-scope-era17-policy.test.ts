import { describe, expect, it } from "vitest";

import {
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_BACKLOG_ID,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_FORBIDDEN_CLAIMS,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID,
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_PROOF_STATUS,
} from "@/lib/api-public/public-api-per-route-scope-era17-policy";

describe("public API per-route scope era17 policy", () => {
  it("locks era17 public API per-route scope policy id", () => {
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID).toBe(
      "era17-public-api-per-route-scope-v1",
    );
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_PROOF_STATUS).toBe("per_route_scope_enforced");
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_BACKLOG_ID).toBe("KOS-E17-019");
  });

  it("does not claim production SLA or full scope admin UI", () => {
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE.claimsProductionSla).toBe(false);
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE.claimsFullScopeAdminUi).toBe(false);
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE.enforcedRouteCount).toBeGreaterThan(0);
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE.highRiskRouteCount).toBe(3);
  });

  it("forbids inflated public API claims", () => {
    expect(PUBLIC_API_PER_ROUTE_SCOPE_ERA17_FORBIDDEN_CLAIMS).toContain(
      "production sla for public api",
    );
  });
});
