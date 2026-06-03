import { describe, expect, it } from "vitest";

import { getFilteredNavGroups } from "@/lib/business-modes";
import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  filterNavGroupsForNavPersona,
  hrefAllowedForNavPersona,
  NAV_PERSONA_OPTIONS,
  resolveEffectiveNavPersona,
  resolveNavPersonaFromStaffRole,
  shouldApplyNavPersonaFilter,
} from "@/lib/navigation/nav-personas";
import { parseNavPersona } from "@/services/navigation/navigation-preference-service";

describe("nav personas (DES-10)", () => {
  it("defines five operator personas plus owner bypass", () => {
    expect(NAV_PERSONA_OPTIONS).toEqual([
      "manager",
      "kitchen",
      "cashier",
      "packer",
      "support_admin",
    ]);
  });

  it("resolves staff roles to personas", () => {
    expect(
      resolveNavPersonaFromStaffRole({ workspaceRole: "STAFF", staffRoleType: "PACKER" }),
    ).toBe("packer");
    expect(
      resolveNavPersonaFromStaffRole({ workspaceRole: "STAFF", staffRoleType: "LINE_COOK" }),
    ).toBe("kitchen");
    expect(
      resolveNavPersonaFromStaffRole({ workspaceRole: "STAFF", staffRoleType: "CUSTOMER_SERVICE" }),
    ).toBe("cashier");
    expect(
      resolveNavPersonaFromStaffRole({ workspaceRole: "OWNER", staffRoleType: null }),
    ).toBe("owner");
  });

  it("cashier persona surfaces POS and hides kitchen from sidebar", () => {
    const filtered = filterNavGroupsForNavPersona(FINAL_NAVIGATION_GROUPS, "cashier");
    const hrefs = filtered.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs.some((h) => h.startsWith("/dashboard/pos"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("/dashboard/kitchen"))).toBe(false);
    expect(hrefAllowedForNavPersona("/dashboard/pos/terminal", "cashier")).toBe(true);
    expect(hrefAllowedForNavPersona("/dashboard/kitchen", "cashier")).toBe(false);
  });

  it("kitchen persona surfaces KDS and production", () => {
    const filtered = filterNavGroupsForNavPersona(FINAL_NAVIGATION_GROUPS, "kitchen");
    const hrefs = filtered.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs).toContain("/dashboard/kitchen");
    expect(hrefs).toContain("/dashboard/production");
    expect(hrefs.some((h) => h.startsWith("/dashboard/pos"))).toBe(false);
  });

  it("packer persona surfaces packing and routes", () => {
    expect(hrefAllowedForNavPersona("/dashboard/packing", "packer")).toBe(true);
    expect(hrefAllowedForNavPersona("/dashboard/routes", "packer")).toBe(true);
    expect(hrefAllowedForNavPersona("/dashboard/reports", "packer")).toBe(false);
  });

  it("support_admin persona surfaces integration health and system health", () => {
    const filtered = filterNavGroupsForNavPersona(FINAL_NAVIGATION_GROUPS, "support_admin");
    const hrefs = filtered.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs).toContain("/dashboard/integration-health");
    expect(hrefs).toContain("/dashboard/system-health");
    expect(hrefs.some((h) => h.startsWith("/dashboard/pos"))).toBe(false);
  });

  it("owner bypasses persona filter; show-all bypasses for staff", () => {
    expect(
      shouldApplyNavPersonaFilter({
        persona: "owner",
        fullNavAccess: false,
        navScopeAll: false,
        workspaceRole: "OWNER",
      }),
    ).toBe(false);

    expect(
      shouldApplyNavPersonaFilter({
        persona: "cashier",
        fullNavAccess: false,
        navScopeAll: true,
        workspaceRole: "STAFF",
      }),
    ).toBe(false);

    expect(
      shouldApplyNavPersonaFilter({
        persona: "cashier",
        fullNavAccess: false,
        navScopeAll: false,
        workspaceRole: "STAFF",
      }),
    ).toBe(true);
  });

  it("wires persona filter through getFilteredNavGroups for staff", () => {
    const cashierNav = getFilteredNavGroups({
      businessType: "RESTAURANT",
      navScopeAll: false,
      navPersona: "cashier",
      fullNavAccess: false,
      isOwner: false,
      userRole: "STAFF",
    });
    const hrefs = cashierNav.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs.some((h) => h.startsWith("/dashboard/pos"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("/dashboard/forecast"))).toBe(false);
  });

  it("auto selection defers to staff role type when provided", () => {
    expect(
      resolveEffectiveNavPersona({
        selection: "auto",
        workspaceRole: "STAFF",
        staffRoleType: "PACKER",
      }),
    ).toBe("packer");
  });

  it("parses persona persistence values", () => {
    expect(parseNavPersona("kitchen")).toBe("kitchen");
    expect(parseNavPersona(null)).toBe("auto");
    expect(parseNavPersona("invalid")).toBe("auto");
  });
});
