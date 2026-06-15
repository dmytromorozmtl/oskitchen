import { describe, expect, it } from "vitest";

import {
  auditPreviewRoutesHiddenInFilteredNav,
  auditPreviewRoutesHiddenInFocusedNav,
  listPreviewSidebarLinks,
  PREVIEW_ROUTE_HIDING_CONFIRMATION_POLICY_ID,
  PREVIEW_REVEAL_DIALOG_TITLE,
} from "@/lib/navigation/preview-route-hiding-confirmation-policy";
import {
  filterNavGroupsByMaturityGovernance,
  shouldShowNavLinkByMaturity,
} from "@/lib/navigation/nav-maturity-governance";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";

describe("preview route hiding confirmation (DES-11)", () => {
  it("defines confirmation policy id and dialog copy", () => {
    expect(PREVIEW_ROUTE_HIDING_CONFIRMATION_POLICY_ID).toBe(
      "preview-route-hiding-confirmation-des11-v1",
    );
    expect(PREVIEW_REVEAL_DIALOG_TITLE).toContain("preview");
  });

  it("lists preview and placeholder sidebar links", () => {
    const links = listPreviewSidebarLinks();
    expect(links.length).toBeGreaterThan(10);
    expect(links.some((l) => l.href === "/dashboard/integrations/doordash")).toBe(true);
    expect(links.some((l) => l.href === "/dashboard/copilot")).toBe(true);
    expect(links.every((l) => l.exposure === "preview" || l.exposure === "placeholder")).toBe(
      true,
    );
  });

  it("hides preview sidebar links in focused nav maturity filter", () => {
    const audit = auditPreviewRoutesHiddenInFocusedNav();
    expect(audit.previewSidebarLinkCount).toBeGreaterThan(0);
    expect(audit.hiddenInFocusedNav).toBe(audit.previewSidebarLinkCount);
    expect(audit.gaps).toEqual([]);
    expect(audit.passed).toBe(true);
  });

  it("reveals preview links when navScopeAll is enabled", () => {
    const audit = auditPreviewRoutesHiddenInFocusedNav();
    expect(audit.visibleWhenExpanded).toBeGreaterThan(0);

    const expanded = filterNavGroupsByMaturityGovernance(FINAL_NAVIGATION_GROUPS, {
      fullNavAccess: false,
      navScopeAll: true,
      gtmSurfaceAccess: false,
    });
    const hrefs = expanded.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs).toContain("/dashboard/copilot");
  });

  it("passes full filtered nav audit for owner focused mode", () => {
    const audit = auditPreviewRoutesHiddenInFilteredNav();
    expect(audit.passed).toBe(true);
    expect(audit.gaps).toEqual([]);
  });

  it("keeps individual preview hrefs gated until expanded", () => {
    expect(
      shouldShowNavLinkByMaturity("/dashboard/pos/tabs", {
        fullNavAccess: false,
        navScopeAll: false,
        gtmSurfaceAccess: false,
      }),
    ).toBe(false);
    expect(
      shouldShowNavLinkByMaturity("/dashboard/pos/tabs", {
        fullNavAccess: false,
        navScopeAll: true,
        gtmSurfaceAccess: false,
      }),
    ).toBe(true);
  });
});
