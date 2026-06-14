import { describe, expect, it } from "vitest";

import {
  filterNavGroupsByMaturityGovernance,
  getNavMaturityExposure,
  navMaturityBadgeForHref,
  shouldShowNavLinkByMaturity,
} from "@/lib/navigation/nav-maturity-governance";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";

describe("nav maturity governance", () => {
  it("classifies marketplace integrations by maturity", () => {
    expect(getNavMaturityExposure("/dashboard/integrations/doordash")).toBe("preview");
    expect(getNavMaturityExposure("/dashboard/integrations/uber-eats")).toBe("preview");
    expect(getNavMaturityExposure("/dashboard/integrations/grubhub")).toBe("preview");
    expect(navMaturityBadgeForHref("/dashboard/integrations/uber-eats")).toBe("Beta");
    expect(navMaturityBadgeForHref("/dashboard/integrations/doordash")).toBe("Beta");
  });

  it("hides preview and placeholder integrations from focused default nav", () => {
    expect(
      shouldShowNavLinkByMaturity("/dashboard/integrations/doordash", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(false);
    expect(
      shouldShowNavLinkByMaturity("/dashboard/integrations/doordash", {
        fullNavAccess: false,
        navScopeAll: true,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
  });

  it("labels preview POS surfaces", () => {
    expect(getNavMaturityExposure("/dashboard/pos/tabs")).toBe("preview");
    expect(getNavMaturityExposure("/dashboard/pos/handheld")).toBe("preview");
    expect(navMaturityBadgeForHref("/dashboard/pos/handheld")).toBe("Preview");
  });

  it("labels era14 gap-closure preview nav routes", () => {
    expect(getNavMaturityExposure("/dashboard/staff/payroll")).toBe("preview");
    expect(getNavMaturityExposure("/dashboard/marketing/email-campaigns")).toBe("preview");
    expect(navMaturityBadgeForHref("/dashboard/staff/payroll")).toBe("Preview");
  });

  it("keeps core commerce routes visible in focused nav", () => {
    expect(
      shouldShowNavLinkByMaturity("/dashboard/storefront", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
    expect(
      shouldShowNavLinkByMaturity("/dashboard/kitchen", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
  });

  it("filters placeholder and preview links from default sidebar groups", () => {
    const filtered = filterNavGroupsByMaturityGovernance(FINAL_NAVIGATION_GROUPS, {
      fullNavAccess: false,
      navScopeAll: false,
      gtmSurfaceAccess: false,
    });
    const hrefs = filtered.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs).not.toContain("/dashboard/integrations/doordash");
    expect(hrefs).not.toContain("/dashboard/integrations/grubhub");
    expect(hrefs).not.toContain("/dashboard/pos/tabs");
    expect(hrefs).not.toContain("/dashboard/copilot");
    expect(hrefs).not.toContain("/dashboard/go-live");
    expect(hrefs).not.toContain("/dashboard/integrations/extensions");
    expect(hrefs).not.toContain("/dashboard/gift-cards");
    expect(hrefs).toContain("/dashboard/customers/loyalty");
    expect(hrefs).toContain("/dashboard/storefront/loyalty");
    expect(hrefs).toContain("/dashboard/onboarding-hub");
    expect(hrefs).not.toContain("/dashboard/launch-wizard");
  });

  it("shows loyalty LIVE routes in default nav; hides gift card previews", () => {
    expect(
      shouldShowNavLinkByMaturity("/dashboard/integrations/extensions", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(false);
    expect(
      shouldShowNavLinkByMaturity("/dashboard/storefront/loyalty", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
    expect(
      shouldShowNavLinkByMaturity("/dashboard/customers/loyalty", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
  });

  it("shows go-live when navScopeAll is enabled", () => {
    const filtered = filterNavGroupsByMaturityGovernance(FINAL_NAVIGATION_GROUPS, {
      fullNavAccess: false,
      navScopeAll: true,
      gtmSurfaceAccess: false,
    });
    const hrefs = filtered.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs).toContain("/dashboard/go-live");
  });

  it("shows preview routes when navScopeAll is enabled", () => {
    expect(
      shouldShowNavLinkByMaturity("/dashboard/pos/tabs", {
        fullNavAccess: false,
        navScopeAll: true,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
  });

  it("hides go-live from default nav — Launch Wizard is primary entry", () => {
    expect(getNavMaturityExposure("/dashboard/go-live")).toBe("hidden_default");
    expect(
      shouldShowNavLinkByMaturity("/dashboard/go-live", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(false);
  });
});
