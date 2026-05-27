import type { BusinessType, UserRole } from "@prisma/client";

import type { NavGroupDef } from "@/lib/nav-config";
import { NAV_GROUPS } from "@/lib/nav-config";
import { getBusinessModeExperience, recommendedHrefsForBusinessType } from "@/lib/business-mode-registry";
import { MODULE_REGISTRY_ENTRIES } from "@/lib/modules/module-registry";
import type { ModuleKey } from "@/lib/module-visibility";
import { navigationHrefDisabled } from "@/lib/module-visibility";
import { filterNavGroupsForUserRole } from "@/lib/nav-role-filter";
import {
  filterNavGroupsByMaturityGovernance,
} from "@/lib/navigation/nav-maturity-governance";

/** Stable ordering for selects (onboarding, settings, growth forms). */
export const ALL_BUSINESS_TYPES_ORDERED = [
  "MEAL_PREP",
  "CATERING",
  "GHOST_KITCHEN",
  "CLOUD_KITCHEN",
  "MULTI_BRAND",
  "BAKERY",
  "RESTAURANT",
  "CAFE",
  "BAR",
  "OTHER",
] as const satisfies readonly BusinessType[];

/** Human-readable labels for selects and admin tables. */
export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  MEAL_PREP: "Meal prep",
  CATERING: "Catering",
  GHOST_KITCHEN: "Ghost kitchen",
  CLOUD_KITCHEN: "Cloud kitchen",
  MULTI_BRAND: "Multi-brand operator",
  BAKERY: "Bakery",
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar / lounge",
  OTHER: "Other",
};

export function resolveBusinessType(value: BusinessType | null | undefined): BusinessType {
  return value ?? "MEAL_PREP";
}

function focusedHiddenHrefSet(mode: BusinessType): Set<string> {
  const keys = getBusinessModeExperience(mode).hiddenByDefaultModuleKeys;
  const out = new Set<string>();
  for (const k of keys) {
    const e = MODULE_REGISTRY_ENTRIES.find((x) => x.key === k);
    if (e) for (const p of e.pathPrefixes) out.add(p);
  }
  return out;
}

/**
 * Deep links surfaced in setup / “next best action” — sourced from the business-mode registry.
 */
export const RECOMMENDED_MODULE_HREFS = Object.fromEntries(
  ALL_BUSINESS_TYPES_ORDERED.map((t) => [t, recommendedHrefsForBusinessType(t)]),
) as Record<BusinessType, readonly string[]>;

export type NavRoleContext = {
  /** Platform super-admin — show every module without business-mode hiding. */
  fullNavAccess: boolean;
  isOwner: boolean;
  /** Workspace role from `UserProfile.role` (OWNER | STAFF today). */
  userRole?: UserRole;
  /** Same signal as `fullNavAccess` for role-strip bypass — set explicitly for clarity. */
  isPlatformSuper?: boolean;
  /** Growth / beta / founder GTM surfaces (platform roles + superadmin), without workspace ownership. */
  gtmSurfaceAccess?: boolean;
};

export type NavFilterContext = NavRoleContext & {
  businessType: BusinessType | null | undefined;
  /**
   * When true, user chose “All modules” in the sidebar (localStorage).
   * Focused mode hides {@link getBusinessModeExperience} `hiddenByDefaultModuleKeys` routes until “Show all modules”.
   */
  navScopeAll: boolean;
};

export function getFilteredNavGroups(
  ctx: NavFilterContext,
  options?: { disabledModuleKeys?: ReadonlySet<ModuleKey> },
): NavGroupDef[] {
  const platformSuper = Boolean(ctx.isPlatformSuper ?? ctx.fullNavAccess);
  const base = (() => {
    if (ctx.fullNavAccess || ctx.navScopeAll) {
      return filterOwnerGrowthLinks(NAV_GROUPS, ctx.isOwner, Boolean(ctx.gtmSurfaceAccess), platformSuper);
    }
    const mode = resolveBusinessType(ctx.businessType);
    const hidden = focusedHiddenHrefSet(mode);

    return filterOwnerGrowthLinks(
      NAV_GROUPS.map((g) => ({
        ...g,
        links: g.links.filter((l) => !hidden.has(l.href)),
      })).filter((g) => g.links.length > 0),
      ctx.isOwner,
      Boolean(ctx.gtmSurfaceAccess),
      platformSuper,
    );
  })();

  const disabled = options?.disabledModuleKeys;
  const afterDisabled =
    !disabled || disabled.size === 0 || ctx.fullNavAccess
      ? base
      : base
          .map((g) => ({
            ...g,
            links: g.links.filter((l) => !navigationHrefDisabled(l.href, disabled)),
          }))
          .filter((g) => g.links.length > 0);

  const afterMaturity = filterNavGroupsByMaturityGovernance(afterDisabled, {
    fullNavAccess: ctx.fullNavAccess,
    navScopeAll: ctx.navScopeAll,
    gtmSurfaceAccess: Boolean(ctx.gtmSurfaceAccess),
  });

  return filterNavGroupsForUserRole(
    afterMaturity,
    ctx.userRole ?? "OWNER",
    Boolean(ctx.isPlatformSuper ?? ctx.fullNavAccess),
    Boolean(ctx.gtmSurfaceAccess),
  );
}

function filterOwnerGrowthLinks(
  groups: NavGroupDef[],
  isOwner: boolean,
  gtmSurfaceAccess = false,
  platformSuper = false,
): NavGroupDef[] {
  return groups.map((g) => {
    if (g.id !== "internal") return g;
    return {
      ...g,
      links: g.links.filter((l) =>
        l.ownerOnly ? isOwner || gtmSurfaceAccess || platformSuper : true,
      ),
    };
  });
}

export function isRecommendedModuleHref(
  businessType: BusinessType | null | undefined,
  href: string,
): boolean {
  const mode = resolveBusinessType(businessType);
  return RECOMMENDED_MODULE_HREFS[mode].includes(href);
}

export function dashboardModeSummaryLines(
  businessType: BusinessType | null | undefined,
): string[] {
  const mode = resolveBusinessType(businessType);
  const lines: Record<BusinessType, string[]> = {
    MEAL_PREP: [
      "Prioritize weekly menus, preorder windows, packing, routes, and nutrition labels.",
      "Watch ingredient demand and forecast as the menu fills.",
    ],
    CATERING: [
      "Pipeline: quotes → calendar events → production → routes → invoicing.",
      "CRM and tasks keep staffing and logistics aligned with guest counts.",
    ],
    GHOST_KITCHEN: [
      "Multiple brands share one kitchen — lean on brands, order hub, and production.",
      "Channel mapping and integration health are first-class.",
    ],
    CLOUD_KITCHEN: [
      "Treat locations and brands as the spine; production and analytics follow volume.",
    ],
    MULTI_BRAND: [
      "Executive and analytics compare concepts; brands/locations filter everything downstream.",
    ],
    RESTAURANT: [
      "Daily service: orders, prep/production, purchasing, costing, and staff tasks.",
    ],
    CAFE: [
      "Daily menus and specials, retail + preorder pickup, purchasing, and light CRM.",
    ],
    BAR: [
      "Drinks-led menu, costing & pour discipline, events, inventory, and staff tasks.",
    ],
    BAKERY: [
      "Preorder windows, batch production, packing/labels, and pickup or route fulfillment.",
    ],
    OTHER: [
      "Pick the modules that match how you sell — adjust business type anytime in Settings.",
    ],
  };
  return lines[mode] ?? lines.OTHER;
}
