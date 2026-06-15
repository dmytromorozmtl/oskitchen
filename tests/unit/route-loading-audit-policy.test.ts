import { describe, expect, it } from "vitest";

import {
  auditRouteLoading,
  auditRouteLoadingModule,
  ROUTE_LOADING_AUDIT_POLICY_ID,
} from "@/lib/design/route-loading-audit-policy";
import {
  ROUTE_LOADING_CRITICAL_MODULES,
  ROUTE_LOADING_PATTERNS_POLICY_ID,
  ROUTE_LOADING_TEST_ID,
} from "@/lib/design/route-loading-patterns";

describe("route loading audit policy (DES-36)", () => {
  it("locks DES-36 policy id and critical module list", () => {
    expect(ROUTE_LOADING_PATTERNS_POLICY_ID).toBe("route-loading-patterns-des36-v1");
    expect(ROUTE_LOADING_AUDIT_POLICY_ID).toBe(ROUTE_LOADING_PATTERNS_POLICY_ID);
    expect(ROUTE_LOADING_TEST_ID).toBe("route-loading");
    expect(ROUTE_LOADING_CRITICAL_MODULES).toContain("components/dashboard/route-states.tsx");
    expect(ROUTE_LOADING_CRITICAL_MODULES).toContain("app/dashboard/analytics/advanced/loading.tsx");
  });

  it("passes route-states with LoadingState-backed RouteLoading", () => {
    const audit = auditRouteLoadingModule("components/dashboard/route-states.tsx");
    expect(audit.usesRouteLoadingPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes analytics advanced loading with RouteLoadingSimple", () => {
    const audit = auditRouteLoadingModule("app/dashboard/analytics/advanced/loading.tsx");
    expect(audit.usesRouteLoadingPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditRouteLoading();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
