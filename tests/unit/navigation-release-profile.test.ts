import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { FINAL_NAVIGATION_GROUPS } from "@/lib/navigation/final-navigation-groups";
import {
  auditNavigationReleaseProfilePolicy,
  isPilotDeepLinkHiddenHref,
  isPilotTierNavHref,
  NAV_RELEASE_PROFILE_PILOT_PAGE_COUNT,
  NAV_RELEASE_PROFILE_POLICY_ID,
  PILOT_TIER_NAV_HREFS,
} from "@/lib/navigation/navigation-release-profile-policy";
import { filterNavGroupsForPilotRelease } from "@/lib/navigation/release-navigation";
import {
  applyNavReleaseProfile,
  isEnterpriseNavReleaseProfile,
  navReleaseProfileFromEnv,
} from "@/services/modules/module-release-service";

const ROOT = process.cwd();

describe("Navigation release profile (Task 30)", () => {
  it("locks pilot tier to exactly 20 golden-path pages", () => {
    const audit = auditNavigationReleaseProfilePolicy();
    expect(NAV_RELEASE_PROFILE_POLICY_ID).toBe("navigation-release-profile-absolute-final-v1");
    expect(PILOT_TIER_NAV_HREFS).toHaveLength(NAV_RELEASE_PROFILE_PILOT_PAGE_COUNT);
    expect(audit.passed).toBe(true);
  });

  it("shows only pilot allowlist links in sidebar for pilot profile", () => {
    const filtered = applyNavReleaseProfile(FINAL_NAVIGATION_GROUPS, "pilot");
    const hrefs = filtered.flatMap((g) => g.links.map((l) => l.href));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.length).toBeLessThanOrEqual(NAV_RELEASE_PROFILE_PILOT_PAGE_COUNT);
    for (const href of hrefs) {
      expect(isPilotTierNavHref(href)).toBe(true);
    }
    expect(hrefs).toContain("/dashboard/today");
    expect(hrefs).toContain("/dashboard/kitchen");
    expect(hrefs).not.toContain("/dashboard/copilot");
    expect(hrefs).not.toContain("/dashboard/forecast");
  });

  it("passes through all groups for enterprise/full profile", () => {
    const full = applyNavReleaseProfile(FINAL_NAVIGATION_GROUPS, "full");
    const enterprise = applyNavReleaseProfile(FINAL_NAVIGATION_GROUPS, "enterprise");
    expect(full.length).toBe(FINAL_NAVIGATION_GROUPS.length);
    expect(enterprise.length).toBe(FINAL_NAVIGATION_GROUPS.length);
    expect(isEnterpriseNavReleaseProfile("full")).toBe(true);
    expect(isEnterpriseNavReleaseProfile("enterprise")).toBe(true);
    expect(isEnterpriseNavReleaseProfile("pilot")).toBe(false);
  });

  it("flags deep links outside pilot allowlist for route notice banner", () => {
    expect(isPilotDeepLinkHiddenHref("/dashboard/copilot")).toBe(true);
    expect(isPilotDeepLinkHiddenHref("/dashboard/copilot/settings")).toBe(true);
    expect(isPilotDeepLinkHiddenHref("/dashboard/today")).toBe(false);
    expect(isPilotDeepLinkHiddenHref("/dashboard/pos/tabs")).toBe(true);
    expect(filterNavGroupsForPilotRelease(FINAL_NAVIGATION_GROUPS).flatMap((g) => g.links).length)
      .toBeLessThanOrEqual(20);
  });

  it("reads enterprise alias from env documentation", () => {
    const envExample = readFileSync(join(ROOT, ".env.example"), "utf8");
    expect(envExample).toContain("NEXT_PUBLIC_NAV_RELEASE_PROFILE");
    expect(envExample.toLowerCase()).toContain("pilot");
    expect(envExample.toLowerCase()).toContain("enterprise");
    expect(navReleaseProfileFromEnv()).toBe("full");
  });
});
