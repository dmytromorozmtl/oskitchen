import { describe, expect, it } from "vitest";

import {
  getNavMaturityExposure,
  shouldShowNavLinkByMaturity,
} from "@/lib/navigation/nav-maturity-governance";
import { buildNavMaturityHideMetrics } from "@/lib/navigation/nav-maturity-hide-metrics";
import {
  isNavMaturityDynamicDetailRoute,
  isRouteHiddenFromFocusedNav,
  NAV_MATURITY_HIDE_TARGET,
  summarizeNavMaturityHideCoverage,
} from "@/lib/navigation/nav-maturity-hide-registry";
import { listDashboardPageRoutes } from "@/lib/navigation/nav-maturity-hide-metrics";

describe("nav maturity hide registry (DES-09)", () => {
  it("hides dynamic [id] detail routes from focused nav", () => {
    expect(isNavMaturityDynamicDetailRoute("/dashboard/orders/[orderId]")).toBe(true);
    expect(isRouteHiddenFromFocusedNav("/dashboard/customers/[customerId]")).toBe(true);
    expect(getNavMaturityExposure("/dashboard/menus/[menuId]")).toBe("hidden_default");
  });

  it("hides orphan sprawl and preview modules from focused nav", () => {
    expect(getNavMaturityExposure("/dashboard/accounting/invoices")).toBe("hidden_default");
    expect(getNavMaturityExposure("/dashboard/playbooks")).toBe("hidden_default");
    expect(getNavMaturityExposure("/dashboard/analytics/margin")).toBe("hidden_default");
    expect(getNavMaturityExposure("/dashboard/settings/voice")).toBe("hidden_default");
    expect(getNavMaturityExposure("/dashboard/integrations/quickbooks")).toBe("hidden_default");
    expect(
      shouldShowNavLinkByMaturity("/dashboard/forecast", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(false);
  });

  it("keeps pilot daily-ops routes visible in focused nav", () => {
    expect(getNavMaturityExposure("/dashboard/today")).toBe("default");
    expect(getNavMaturityExposure("/dashboard/orders")).toBe("default");
    expect(getNavMaturityExposure("/dashboard/kitchen")).toBe("default");
    expect(getNavMaturityExposure("/dashboard/analytics")).toBe("default");
    expect(getNavMaturityExposure("/dashboard/settings")).toBe("default");
    expect(getNavMaturityExposure("/dashboard/launch-wizard")).toBe("default");
    expect(
      shouldShowNavLinkByMaturity("/dashboard/marketplace", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
  });

  it(`covers at least ${NAV_MATURITY_HIDE_TARGET} dashboard routes hidden from focused nav`, () => {
    const routes = listDashboardPageRoutes();
    const coverage = summarizeNavMaturityHideCoverage(routes);
    expect(coverage.totalDashboardRoutes).toBeGreaterThan(500);
    expect(coverage.hiddenFromFocusedNav).toBeGreaterThanOrEqual(NAV_MATURITY_HIDE_TARGET);
    expect(coverage.targetMet).toBe(true);
  });

  it("builds hide metrics artifact contract", () => {
    const metrics = buildNavMaturityHideMetrics();
    expect(metrics.policyId).toBe("nav-maturity-hide-des09-v1");
    expect(metrics.targetMet).toBe(true);
    expect(metrics.hiddenFromFocusedNav).toBeGreaterThanOrEqual(NAV_MATURITY_HIDE_TARGET);
  });
});
