/**
 * Absolute Final Task 30 — Navigation release profile: Pilot 20 pages, Enterprise full.
 *
 * @see lib/navigation/release-navigation.ts
 * @see services/modules/module-release-service.ts
 * @see docs/pilot-week1-roadmap.md
 */

import type { NavGroupDef } from "@/lib/navigation/nav-types";

export const NAV_RELEASE_PROFILE_POLICY_ID = "navigation-release-profile-absolute-final-v1" as const;

export const NAV_RELEASE_PROFILE_PILOT_PAGE_COUNT = 20 as const;

/** Golden-path sidebar routes for paid pilot tier (exact href match). */
export const PILOT_TIER_NAV_HREFS = [
  "/dashboard/today",
  "/dashboard/launch-wizard",
  "/dashboard/order-hub",
  "/dashboard/orders",
  "/dashboard/pos",
  "/dashboard/kitchen",
  "/dashboard/production",
  "/dashboard/packing",
  "/dashboard/menus",
  "/dashboard/products",
  "/dashboard/storefront",
  "/dashboard/sales-channels",
  "/dashboard/integration-health",
  "/dashboard/import-center",
  "/dashboard/settings",
  "/dashboard/staff",
  "/dashboard/customers",
  "/dashboard/marketplace",
  "/dashboard/analytics",
  "/dashboard/playbooks",
] as const;

export type PilotTierNavHref = (typeof PILOT_TIER_NAV_HREFS)[number];

export const NAV_RELEASE_PROFILES = ["pilot", "enterprise"] as const;

export type NavigationReleaseProfileName = (typeof NAV_RELEASE_PROFILES)[number];

export const NAV_RELEASE_PROFILE_CI_SCRIPTS = ["test:ci:navigation-release-profile"] as const;

export function normalizeNavHref(href: string): string {
  if (href.endsWith("/") && href.length > 1) return href.slice(0, -1);
  return href;
}

export function isPilotTierNavHref(href: string): boolean {
  const h = normalizeNavHref(href);
  return (PILOT_TIER_NAV_HREFS as readonly string[]).includes(h);
}

/** Deep-linked dashboard routes outside the pilot allowlist (sidebar hidden, URL still works). */
export function isPilotDeepLinkHiddenHref(href: string): boolean {
  const h = normalizeNavHref(href);
  if (!h.startsWith("/dashboard")) return false;
  return !isPilotTierNavHref(h);
}

export function filterNavGroupsForPilotTier(groups: NavGroupDef[]): NavGroupDef[] {
  return groups
    .map((g) => ({
      ...g,
      links: g.links.filter((l) => isPilotTierNavHref(l.href)),
    }))
    .filter((g) => g.links.length > 0);
}

export type NavigationReleaseProfileAudit = {
  policyId: typeof NAV_RELEASE_PROFILE_POLICY_ID;
  pilotPageCount: number;
  uniquePilotHrefs: number;
  passed: boolean;
};

export function auditNavigationReleaseProfilePolicy(): NavigationReleaseProfileAudit {
  const unique = new Set(PILOT_TIER_NAV_HREFS);
  const pilotPageCount = PILOT_TIER_NAV_HREFS.length;

  return {
    policyId: NAV_RELEASE_PROFILE_POLICY_ID,
    pilotPageCount,
    uniquePilotHrefs: unique.size,
    passed:
      pilotPageCount === NAV_RELEASE_PROFILE_PILOT_PAGE_COUNT &&
      unique.size === NAV_RELEASE_PROFILE_PILOT_PAGE_COUNT,
  };
}
