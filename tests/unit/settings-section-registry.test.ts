import { describe, expect, it } from "vitest";

import {
  auditSettingsSectionRegistry,
  findSettingsRegistryCoverageGaps,
  listSettingsPageRoutes,
  SETTINGS_SECTION_REGISTRY_POLICY_ID,
  settingsSectionsForCommandPalette,
} from "@/lib/settings/section-registry-audit";
import {
  resolveSettingsSectionForPathname,
  SETTINGS_SECTIONS,
} from "@/lib/settings/section-registry";
import { searchSettingsSections } from "@/lib/settings/settings-navigation";

describe("settings section registry (DES-13)", () => {
  it("defines registry policy and at least 28 sections", () => {
    expect(SETTINGS_SECTION_REGISTRY_POLICY_ID).toBe("settings-section-registry-des13-v1");
    expect(SETTINGS_SECTIONS.length).toBeGreaterThanOrEqual(28);
  });

  it("covers all settings page routes on disk", () => {
    const audit = auditSettingsSectionRegistry();
    expect(audit.routeCount).toBeGreaterThanOrEqual(30);
    expect(audit.gaps).toEqual([]);
    expect(audit.passed).toBe(true);
  });

  it("resolves nested routes to parent sections", () => {
    expect(resolveSettingsSectionForPathname("/dashboard/settings/notifications/push")?.key).toBe(
      "notifications",
    );
    expect(resolveSettingsSectionForPathname("/dashboard/settings/security/sso")?.key).toBe(
      "security",
    );
    expect(resolveSettingsSectionForPathname("/dashboard/settings/profile")?.key).toBe("profile");
  });

  it("includes new profile, delivery zones, and white-label sections", () => {
    const keys = SETTINGS_SECTIONS.map((section) => section.key);
    expect(keys).toContain("profile");
    expect(keys).toContain("delivery_zones");
    expect(keys).toContain("white_label");
    expect(findSettingsRegistryCoverageGaps(listSettingsPageRoutes()).length).toBe(0);
  });

  it("exports command palette routes from registry", () => {
    const routes = settingsSectionsForCommandPalette();
    expect(routes.some((route) => route.href === "/dashboard/settings/profile")).toBe(true);
    expect(routes.every((route) => route.href.startsWith("/dashboard/settings/"))).toBe(true);
  });

  it("ranks exact label matches first in settings search", () => {
    const ranked = searchSettingsSections("Profile", SETTINGS_SECTIONS);
    expect(ranked[0]?.key).toBe("profile");
  });
});
