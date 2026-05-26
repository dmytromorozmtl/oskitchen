import type { NavGroupDef } from "@/lib/navigation/nav-types";

/**
 * Secondary / deep modules hidden for **pilot** navigation profile to reduce shallow-surface risk.
 * Routes remain reachable by direct URL and module preferences — this only affects the default sidebar IA.
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
  const h = href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
  return PILOT_HIDDEN_HREF_PREFIXES.some(
    (p) => h === p || h.startsWith(`${p}/`),
  );
}

export function filterNavGroupsForPilotRelease(groups: NavGroupDef[]): NavGroupDef[] {
  return groups
    .map((g) => ({
      ...g,
      links: g.links.filter((l) => !isPilotHiddenHref(l.href)),
    }))
    .filter((g) => g.links.length > 0);
}
