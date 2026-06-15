import type { NavGroupDef } from "@/lib/navigation/nav-types";

import {
  filterNavGroupsForPilotTier,
  isPilotDeepLinkHiddenHref,
  isPilotTierNavHref,
  PILOT_TIER_NAV_HREFS,
} from "@/lib/navigation/navigation-release-profile-policy";

export { PILOT_TIER_NAV_HREFS, isPilotTierNavHref };

/**
 * @deprecated Prefer `isPilotDeepLinkHiddenHref` — pilot tier uses a 20-page allowlist.
 * Kept for deep-link banner + legacy docs; true when href is outside pilot allowlist.
 */
export const PILOT_HIDDEN_HREF_PREFIXES: readonly string[] = [
  "/dashboard/forecast",
  "/dashboard/purchasing",
  "/dashboard/costing",
  "/dashboard/reports",
  "/dashboard/copilot",
  "/dashboard/meal-plans",
  "/dashboard/catering-quotes",
  "/dashboard/training",
  "/dashboard/partner",
  "/dashboard/developer",
  "/dashboard/executive",
  "/dashboard/import-export",
  "/dashboard/growth",
  "/dashboard/workspace/experiments",
  "/dashboard/beta-applications",
  "/dashboard/implementation/enterprise",
];

export function isPilotHiddenHref(href: string): boolean {
  return isPilotDeepLinkHiddenHref(href);
}

export function filterNavGroupsForPilotRelease(groups: NavGroupDef[]): NavGroupDef[] {
  return filterNavGroupsForPilotTier(groups);
}
