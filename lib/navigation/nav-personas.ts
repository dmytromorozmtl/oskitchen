import type { StaffRoleType, UserRole } from "@prisma/client";

import type { NavGroupDef } from "@/lib/navigation/nav-types";
import type { OperatorHomePersona } from "@/lib/navigation/operator-home-era18";

/**
 * DES-10 — role-based nav personas for focused sidebar IA.
 *
 * Owners and platform super-admins bypass persona filtering.
 * Staff operators pick (or auto-resolve) a persona to surface a daily-ops strip.
 *
 * @see lib/navigation/operator-home-era18.ts
 * @see lib/briefing/owner-daily-briefing-role-packs-era19.ts
 */

export const NAV_PERSONAS_POLICY_ID = "nav-personas-des10-v1" as const;

/** Sidebar persona — extends operator home personas with packer + support_admin. */
export type NavPersona = OperatorHomePersona | "packer" | "support_admin";

export type NavPersonaSelection = NavPersona | "auto";

export const NAV_PERSONA_OPTIONS: readonly Exclude<NavPersona, "owner">[] = [
  "manager",
  "kitchen",
  "cashier",
  "packer",
  "support_admin",
] as const;

export const NAV_PERSONA_LABEL: Record<NavPersona, string> = {
  owner: "Owner",
  manager: "Manager",
  kitchen: "Kitchen",
  cashier: "Cashier",
  packer: "Packer",
  support_admin: "Support admin",
};

export const NAV_PERSONA_HEADLINE: Record<Exclude<NavPersona, "owner">, string> = {
  manager: "Shift ops — orders, POS, kitchen, staff, and exceptions.",
  kitchen: "Line focus — KDS, production, packing handoff.",
  cashier: "Register focus — POS terminal, orders, and today.",
  packer: "Fulfillment — packing waves, verify, and routes.",
  support_admin: "Triage — integration health, system health, and pilot blockers.",
};

type AllowRule = {
  path: string;
  exact?: boolean;
};

const KITCHEN_STAFF_ROLES = new Set<StaffRoleType>([
  "KITCHEN_LEAD",
  "PREP_COOK",
  "LINE_COOK",
]);

const NAV_PERSONA_ALLOW_RULES: Record<Exclude<NavPersona, "owner">, readonly AllowRule[]> = {
  manager: [
    { path: "/dashboard/today" },
    { path: "/dashboard/orders" },
    { path: "/dashboard/pos" },
    { path: "/dashboard/kitchen" },
    { path: "/dashboard/production" },
    { path: "/dashboard/packing" },
    { path: "/dashboard/routes" },
    { path: "/dashboard/tasks" },
    { path: "/dashboard/calendar" },
    { path: "/dashboard/locations" },
    { path: "/dashboard/customers" },
    { path: "/dashboard/menus" },
    { path: "/dashboard/products" },
    { path: "/dashboard/storefront" },
    { path: "/dashboard/sales-channels" },
    { path: "/dashboard/order-hub" },
    { path: "/dashboard/orders/hub" },
    { path: "/dashboard/integration-health" },
    { path: "/dashboard/reports" },
    { path: "/dashboard/staff" },
    { path: "/dashboard/settings" },
    { path: "/dashboard/support" },
    { path: "/dashboard/launch-wizard" },
    { path: "/dashboard/implementation" },
    { path: "/dashboard/import-center" },
    { path: "/dashboard/food-safety" },
    { path: "/dashboard/inventory/demand" },
    { path: "/dashboard/inventory/waste" },
    { path: "/dashboard/inventory/counts" },
    { path: "/dashboard/analytics" },
  ],
  kitchen: [
    { path: "/dashboard/today" },
    { path: "/dashboard/kitchen" },
    { path: "/dashboard/production" },
    { path: "/dashboard/packing" },
    { path: "/dashboard/orders" },
    { path: "/dashboard/order-hub" },
    { path: "/dashboard/orders/hub" },
    { path: "/dashboard/tasks" },
    { path: "/dashboard/calendar" },
    { path: "/dashboard/production/calendar" },
    { path: "/dashboard/menus" },
    { path: "/dashboard/products" },
    { path: "/dashboard/food-safety" },
    { path: "/dashboard/settings" },
    { path: "/dashboard/support" },
  ],
  cashier: [
    { path: "/dashboard/today" },
    { path: "/dashboard/pos" },
    { path: "/dashboard/orders" },
    { path: "/dashboard/order-hub" },
    { path: "/dashboard/orders/hub" },
    { path: "/dashboard/customers" },
    { path: "/dashboard/settings" },
    { path: "/dashboard/support" },
  ],
  packer: [
    { path: "/dashboard/today" },
    { path: "/dashboard/packing" },
    { path: "/dashboard/kitchen" },
    { path: "/dashboard/production" },
    { path: "/dashboard/routes" },
    { path: "/dashboard/orders" },
    { path: "/dashboard/order-hub" },
    { path: "/dashboard/tasks" },
    { path: "/dashboard/settings" },
    { path: "/dashboard/support" },
  ],
  support_admin: [
    { path: "/dashboard/today" },
    { path: "/dashboard/integration-health" },
    { path: "/dashboard/implementation" },
    { path: "/dashboard/launch-wizard" },
    { path: "/dashboard/system-health" },
    { path: "/dashboard/error-recovery" },
    { path: "/dashboard/audit-logs" },
    { path: "/dashboard/support" },
    { path: "/dashboard/settings" },
    { path: "/dashboard/growth" },
    { path: "/dashboard/beta-applications" },
    { path: "/dashboard/demo" },
  ],
};

const GTM_SURFACE_PREFIXES: readonly string[] = ["/dashboard/growth", "/dashboard/beta-applications"];

function normalizeHref(href: string): string {
  return href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
}

function hrefMatchesRule(href: string, rule: AllowRule): boolean {
  const h = normalizeHref(href);
  if (rule.exact) return h === rule.path;
  return h === rule.path || h.startsWith(`${rule.path}/`);
}

function hrefUnderPrefixes(href: string, prefixes: readonly string[]): boolean {
  const h = normalizeHref(href);
  return prefixes.some((p) => h === p || h.startsWith(`${p}/`));
}

export function hrefAllowedForNavPersona(
  href: string,
  persona: Exclude<NavPersona, "owner">,
  options?: { gtmSurfaceAccess?: boolean },
): boolean {
  const rules = NAV_PERSONA_ALLOW_RULES[persona];
  if (rules.some((rule) => hrefMatchesRule(href, rule))) return true;
  if (options?.gtmSurfaceAccess && hrefUnderPrefixes(href, GTM_SURFACE_PREFIXES)) return true;
  return false;
}

export function resolveNavPersonaFromStaffRole(input: {
  workspaceRole: UserRole;
  staffRoleType: StaffRoleType | null;
  platformBypass?: boolean;
}): NavPersona {
  if (input.platformBypass || input.workspaceRole === "OWNER") {
    return "owner";
  }

  const staff = input.staffRoleType;
  if (staff === "MANAGER") return "manager";
  if (staff === "PACKER") return "packer";
  if (staff && KITCHEN_STAFF_ROLES.has(staff)) return "kitchen";
  if (staff === "CUSTOMER_SERVICE" || staff === "CATERING_COORDINATOR") return "cashier";
  if (staff === "DRIVER") return "packer";

  return "manager";
}

export function resolveEffectiveNavPersona(input: {
  selection: NavPersonaSelection;
  workspaceRole: UserRole;
  staffRoleType: StaffRoleType | null;
  platformBypass?: boolean;
}): NavPersona {
  if (input.platformBypass || input.workspaceRole === "OWNER") {
    return "owner";
  }
  if (input.selection !== "auto") {
    return input.selection;
  }
  return resolveNavPersonaFromStaffRole(input);
}

export function shouldApplyNavPersonaFilter(input: {
  persona: NavPersona;
  fullNavAccess: boolean;
  navScopeAll: boolean;
  workspaceRole: UserRole;
}): boolean {
  if (input.fullNavAccess || input.workspaceRole === "OWNER") return false;
  if (input.navScopeAll) return false;
  return input.persona !== "owner";
}

export function filterNavGroupsForNavPersona(
  groups: NavGroupDef[],
  persona: Exclude<NavPersona, "owner">,
  options?: { gtmSurfaceAccess?: boolean },
): NavGroupDef[] {
  return groups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) =>
        hrefAllowedForNavPersona(link.href, persona, options),
      ),
    }))
    .filter((group) => group.links.length > 0);
}

export function isDashboardPathAllowedForNavPersona(
  pathname: string,
  persona: NavPersona,
  options?: { gtmSurfaceAccess?: boolean },
): boolean {
  if (persona === "owner") return true;
  return hrefAllowedForNavPersona(pathname, persona, options);
}
