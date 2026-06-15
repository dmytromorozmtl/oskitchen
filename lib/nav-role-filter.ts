import type { UserRole } from "@prisma/client";

import type { NavGroupDef } from "@/lib/nav-config";

/**
 * Workspace roles are currently OWNER | STAFF in Prisma.
 * STAFF gets an operations-focused strip so the sidebar stays usable without exposing billing/strategy.
 */
type AllowRule = {
  path: string;
  exact?: boolean;
};

const STAFF_ALLOW_RULES: readonly AllowRule[] = [
  { path: "/dashboard", exact: true },
  { path: "/dashboard/today" },
  { path: "/dashboard/orders" },
  { path: "/dashboard/pos" },
  { path: "/dashboard/menus" },
  { path: "/dashboard/products" },
  { path: "/dashboard/brands" },
  { path: "/dashboard/storefront" },
  { path: "/dashboard/sales-channels" },
  { path: "/dashboard/order-hub" },
  { path: "/dashboard/kitchen" },
  { path: "/dashboard/production" },
  { path: "/dashboard/tasks" },
  { path: "/dashboard/settings" },
  { path: "/dashboard/support" },
  { path: "/dashboard/error-recovery" },
  { path: "/dashboard/system-health" },
  { path: "/dashboard/integration-health" },
  { path: "/dashboard/reports" },
  { path: "/dashboard/packing" },
  { path: "/dashboard/routes" },
  { path: "/dashboard/demo" },
  { path: "/dashboard/customers" },
  { path: "/dashboard/meal-plans" },
  { path: "/dashboard/catering-quotes" },
  { path: "/dashboard/calendar" },
  { path: "/dashboard/locations" },
  { path: "/dashboard/nutrition-labels" },
];

const GTM_SURFACE_PREFIXES: readonly string[] = ["/dashboard/growth", "/dashboard/beta-applications"];

function hrefUnderPrefixes(href: string, prefixes: readonly string[]): boolean {
  const h = href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
  return prefixes.some((p) => h === p || h.startsWith(`${p}/`));
}

function hrefMatchesRule(href: string, rule: AllowRule): boolean {
  const h = href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
  if (rule.exact) return h === rule.path;
  return h === rule.path || h.startsWith(`${rule.path}/`);
}

function hrefAllowedForStaff(href: string, gtmSurfaceAccess = false): boolean {
  if (STAFF_ALLOW_RULES.some((rule) => hrefMatchesRule(href, rule))) return true;
  if (gtmSurfaceAccess && hrefUnderPrefixes(href, GTM_SURFACE_PREFIXES)) return true;
  return false;
}

export function isDashboardPathAllowedForRole(
  pathname: string,
  role: UserRole,
  isPlatformSuper: boolean,
  gtmSurfaceAccess = false,
): boolean {
  if (isPlatformSuper || role === "OWNER") return true;
  if (role !== "STAFF") return true;
  return hrefAllowedForStaff(pathname, gtmSurfaceAccess);
}

export function filterNavGroupsForUserRole(
  groups: NavGroupDef[],
  role: UserRole,
  isPlatformSuper: boolean,
  gtmSurfaceAccess = false,
): NavGroupDef[] {
  if (isPlatformSuper || role === "OWNER") return groups;
  if (role !== "STAFF") return groups;
  return groups
    .map((g) => ({
      ...g,
      links: g.links.filter((l) => hrefAllowedForStaff(l.href, gtmSurfaceAccess)),
    }))
    .filter((g) => g.links.length > 0);
}
