import { describe, expect, it } from "vitest";

import { getFilteredNavGroups } from "@/lib/business-modes";
import { getBusinessModeExperience } from "@/lib/business-mode-registry";

function hrefsFor(
  input: Parameters<typeof getFilteredNavGroups>[0],
  disabledModuleKeys?: Parameters<typeof getFilteredNavGroups>[1]["disabledModuleKeys"],
): string[] {
  return getFilteredNavGroups(input, { disabledModuleKeys }).flatMap((group) =>
    group.links.map((link) => link.href),
  );
}

describe("business-mode nav presets", () => {
  it("hides advanced modules for meal prep in focused mode", () => {
    const hidden = getBusinessModeExperience("MEAL_PREP").hiddenByDefaultModuleKeys;
    expect(hidden.length).toBeGreaterThan(0);

    const hrefs = hrefsFor({
      businessType: "MEAL_PREP",
      navScopeAll: false,
      fullNavAccess: false,
      isOwner: true,
    });
    for (const key of hidden) {
      const exp = getBusinessModeExperience("MEAL_PREP");
      const mod = exp.hiddenByDefaultModuleKeys;
      expect(mod).toContain(key);
    }
    expect(hrefs.some((h) => h.includes("/dashboard/implementation"))).toBe(false);
    expect(hrefs.some((h) => h.includes("/dashboard/executive"))).toBe(false);
  });

  it("shows all nav groups when navScopeAll is true", () => {
    const focused = hrefsFor({
      businessType: "MEAL_PREP",
      navScopeAll: false,
      fullNavAccess: false,
      isOwner: true,
    });
    const all = hrefsFor({
      businessType: "MEAL_PREP",
      navScopeAll: true,
      fullNavAccess: false,
      isOwner: true,
    });
    const focusedCount = focused.length;
    const allCount = all.length;
    expect(allCount).toBeGreaterThanOrEqual(focusedCount);
  });

  it("strips billing and developer navigation for staff while keeping operational modules", () => {
    const hrefs = hrefsFor({
      businessType: "MEAL_PREP",
      navScopeAll: true,
      fullNavAccess: false,
      isOwner: false,
      userRole: "STAFF",
    });

    expect(hrefs).toContain("/dashboard/orders");
    expect(hrefs).toContain("/dashboard/settings");
    expect(hrefs).not.toContain("/dashboard/billing");
    expect(hrefs).not.toContain("/dashboard/developer");
  });

  it("allows GTM surfaces for staff with dedicated growth access but keeps owner-only admin links hidden", () => {
    const hrefs = hrefsFor({
      businessType: "MEAL_PREP",
      navScopeAll: true,
      fullNavAccess: false,
      isOwner: false,
      userRole: "STAFF",
      gtmSurfaceAccess: true,
    });

    expect(hrefs).toContain("/dashboard/growth");
    expect(hrefs).toContain("/dashboard/beta-applications");
    expect(hrefs).not.toContain("/dashboard/developer");
  });

  it("lets platform super-admins bypass both disabled modules and owner-only filtering", () => {
    const hrefs = hrefsFor(
      {
        businessType: "MEAL_PREP",
        navScopeAll: true,
        fullNavAccess: true,
        isPlatformSuper: true,
        isOwner: false,
        userRole: "STAFF",
      },
      new Set(["copilot"]),
    );

    expect(hrefs).toContain("/dashboard/copilot");
    expect(hrefs).toContain("/dashboard/developer");
    expect(hrefs).toContain("/dashboard/billing");
  });
});
