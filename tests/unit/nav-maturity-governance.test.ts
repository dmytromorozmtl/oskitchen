import { describe, expect, it } from "vitest";

import {
  filterNavGroupsByMaturityGovernance,
  getNavMaturityExposure,
  navMaturityBadgeForHref,
  shouldShowNavLinkByMaturity,
} from "@/lib/navigation/nav-maturity-governance";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";

describe("nav maturity governance", () => {
  it("classifies marketplace placeholders", () => {
    expect(getNavMaturityExposure("/dashboard/integrations/doordash")).toBe("placeholder");
    expect(getNavMaturityExposure("/dashboard/integrations/grubhub")).toBe("placeholder");
    expect(getNavMaturityExposure("/dashboard/integrations/uber-eats")).toBe("placeholder");
    expect(navMaturityBadgeForHref("/dashboard/integrations/doordash")).toBe("Placeholder");
  });

  it("hides placeholder integrations from focused default nav", () => {
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

  it("filters placeholder links from default sidebar groups", () => {
    const filtered = filterNavGroupsByMaturityGovernance(FINAL_NAVIGATION_GROUPS, {
      fullNavAccess: false,
      navScopeAll: false,
      gtmSurfaceAccess: false,
    });
    const hrefs = filtered.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs).not.toContain("/dashboard/integrations/doordash");
    expect(hrefs).not.toContain("/dashboard/integrations/grubhub");
    expect(hrefs).toContain("/dashboard/pos/tabs");
  });
});
