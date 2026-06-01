import type { NavGroupDef } from "@/lib/navigation/nav-types";

/**
 * Nav exposure aligned with `docs/feature-maturity-matrix.md`.
 * `hidden_default`, `placeholder`, and `preview` links are omitted from focused sidebar IA
 * unless the operator enables “Show all modules” (`navScopeAll`).
 */
export type NavMaturityExposure =
  | "default"
  | "preview"
  | "placeholder"
  | "hidden_default"
  | "internal";

export type NavMaturityRule = {
  prefix: string;
  exposure: NavMaturityExposure;
  /** Canonical matrix family reference for doc audits. */
  matrixRef: string;
};

/** Longest-prefix wins — keep more specific paths before broader ones. */
export const NAV_MATURITY_RULES: readonly NavMaturityRule[] = [
  {
    prefix: "/dashboard/settings/security/sso",
    exposure: "preview",
    matrixRef: "Enterprise SSO pilot",
  },
  {
    prefix: "/dashboard/inventory/pos-impacts",
    exposure: "preview",
    matrixRef: "Inventory counts and waste",
  },
  {
    prefix: "/dashboard/costing/theft",
    exposure: "preview",
    matrixRef: "Costing and margin",
  },
  {
    prefix: "/dashboard/marketing/holiday-packages",
    exposure: "preview",
    matrixRef: "Growth campaigns",
  },
  {
    prefix: "/dashboard/integrations/7shifts",
    exposure: "preview",
    matrixRef: "7shifts scheduling sync",
  },
  {
    prefix: "/dashboard/integrations/doordash",
    exposure: "preview",
    matrixRef: "DoorDash marketplace BETA",
  },
  {
    prefix: "/dashboard/integrations/grubhub",
    exposure: "preview",
    matrixRef: "Grubhub marketplace BETA",
  },
  {
    prefix: "/dashboard/integrations/uber-eats",
    exposure: "preview",
    matrixRef: "Uber Eats marketplace BETA",
  },
  {
    prefix: "/dashboard/integrations/extensions",
    exposure: "preview",
    matrixRef: "App marketplace extensions catalog",
  },
  {
    prefix: "/dashboard/integrations/outbound-webhooks",
    exposure: "preview",
    matrixRef: "Partner outbound webhooks",
  },
  {
    prefix: "/dashboard/integrations/oauth-apps",
    exposure: "preview",
    matrixRef: "OAuth sandbox apps",
  },
  {
    prefix: "/dashboard/gift-cards",
    exposure: "preview",
    matrixRef: "Gift cards",
  },
  {
    prefix: "/dashboard/customers/loyalty",
    exposure: "preview",
    matrixRef: "Loyalty programs",
  },
  {
    prefix: "/dashboard/storefront/gift-cards",
    exposure: "preview",
    matrixRef: "Storefront gift cards",
  },
  {
    prefix: "/dashboard/storefront/loyalty",
    exposure: "preview",
    matrixRef: "Storefront loyalty",
  },
  {
    prefix: "/dashboard/meal-plans",
    exposure: "preview",
    matrixRef: "Meal subscriptions",
  },
  {
    prefix: "/dashboard/integrations/uber-direct",
    exposure: "placeholder",
    matrixRef: "Uber / DoorDash provider surfaces",
  },
  {
    prefix: "/dashboard/routes/uber-direct",
    exposure: "placeholder",
    matrixRef: "Uber / DoorDash provider surfaces",
  },
  {
    prefix: "/dashboard/demo/scenarios",
    exposure: "internal",
    matrixRef: "Platform admin and support",
  },
  {
    prefix: "/dashboard/growth",
    exposure: "internal",
    matrixRef: "Growth campaigns",
  },
  {
    prefix: "/dashboard/beta-applications",
    exposure: "internal",
    matrixRef: "Platform admin and support",
  },
  {
    prefix: "/dashboard/partner",
    exposure: "internal",
    matrixRef: "Platform admin and support",
  },
  {
    prefix: "/dashboard/developer",
    exposure: "internal",
    matrixRef: "Platform admin and support",
  },
  {
    prefix: "/dashboard/launch-wizard",
    exposure: "default",
    matrixRef: "Launch Wizard — primary onboarding entry",
  },
  {
    prefix: "/dashboard/go-live",
    exposure: "hidden_default",
    matrixRef: "Go-live projects — advanced validation (Launch Wizard primary)",
  },
  {
    prefix: "/dashboard/franchise",
    exposure: "hidden_default",
    matrixRef: "Experimental / roadmap surfaces",
  },
  {
    prefix: "/dashboard/pos/tabs",
    exposure: "preview",
    matrixRef: "Bar tabs",
  },
  {
    prefix: "/dashboard/pos/handheld",
    exposure: "preview",
    matrixRef: "Handheld ordering",
  },
  {
    prefix: "/dashboard/tables",
    exposure: "preview",
    matrixRef: "Tables and restaurant service",
  },
  {
    prefix: "/dashboard/copilot",
    exposure: "preview",
    matrixRef: "Copilot / AI insights",
  },
  {
    prefix: "/dashboard/forecast",
    exposure: "preview",
    matrixRef: "Forecasting",
  },
  {
    prefix: "/dashboard/storefront/reservations",
    exposure: "preview",
    matrixRef: "Reservations",
  },
  {
    prefix: "/dashboard/reservations",
    exposure: "preview",
    matrixRef: "Reservations",
  },
  {
    prefix: "/dashboard/food-safety",
    exposure: "preview",
    matrixRef: "Food safety and compliance",
  },
  {
    prefix: "/dashboard/staff/payroll",
    exposure: "preview",
    matrixRef: "Payroll export",
  },
  {
    prefix: "/dashboard/marketing/email-campaigns",
    exposure: "preview",
    matrixRef: "Growth campaigns",
  },
  {
    prefix: "/dashboard/marketplace",
    exposure: "default",
    matrixRef: "B2B HoReCa marketplace",
  },
  {
    prefix: "/vendor/register",
    exposure: "default",
    matrixRef: "Marketplace vendor registration",
  },
  {
    prefix: "/dashboard/executive",
    exposure: "hidden_default",
    matrixRef: "Executive / franchise roadmap",
  },
];

export type NavMaturityFilterContext = {
  fullNavAccess: boolean;
  navScopeAll: boolean;
  gtmSurfaceAccess: boolean;
};

function normalizeHref(href: string): string {
  return href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
}

function hrefMatchesPrefix(href: string, prefix: string): boolean {
  const h = normalizeHref(href);
  const p = normalizeHref(prefix);
  return h === p || h.startsWith(`${p}/`);
}

export function getNavMaturityRule(href: string): NavMaturityRule | null {
  const h = normalizeHref(href);
  let match: NavMaturityRule | null = null;
  for (const rule of NAV_MATURITY_RULES) {
    if (!hrefMatchesPrefix(h, rule.prefix)) continue;
    if (!match || rule.prefix.length > match.prefix.length) {
      match = rule;
    }
  }
  return match;
}

export function getNavMaturityExposure(href: string): NavMaturityExposure {
  return getNavMaturityRule(href)?.exposure ?? "default";
}

export function navMaturityBadgeLabel(exposure: NavMaturityExposure): string | null {
  if (exposure === "preview") return "Preview";
  if (exposure === "placeholder") return "Placeholder";
  if (exposure === "internal") return "Internal";
  return null;
}

export function navMaturityBadgeForHref(href: string): string | null {
  return navMaturityBadgeLabel(getNavMaturityExposure(href));
}

export function shouldShowNavLinkByMaturity(
  href: string,
  ctx: NavMaturityFilterContext,
): boolean {
  if (ctx.fullNavAccess) return true;

  const exposure = getNavMaturityExposure(href);

  if (exposure === "internal") {
    return ctx.gtmSurfaceAccess;
  }

  if (exposure === "hidden_default" || exposure === "placeholder" || exposure === "preview") {
    return ctx.navScopeAll;
  }

  return true;
}

export function filterNavGroupsByMaturityGovernance(
  groups: NavGroupDef[],
  ctx: NavMaturityFilterContext,
): NavGroupDef[] {
  if (ctx.fullNavAccess) return groups;

  return groups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => shouldShowNavLinkByMaturity(link.href, ctx)),
    }))
    .filter((group) => group.links.length > 0);
}
