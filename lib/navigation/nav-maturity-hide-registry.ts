/**
 * DES-09 — expanded nav maturity hide registry (~280 dashboard routes).
 *
 * Classifies orphan sprawl, preview modules, pilot-hidden prefixes, settings deep
 * tree, analytics leaf pages, and dynamic `[id]` detail routes as non-focused nav.
 * Routes remain URL-accessible; focused sidebar requires “Show all modules”.
 *
 * @see docs/navigation-ia-audit.md
 * @see docs/nav-sprawl-audit.md
 */

export type NavMaturityHideExposure =
  | "default"
  | "preview"
  | "placeholder"
  | "hidden_default"
  | "internal";

/** Minimum hidden route count for pilot-focused IA (35% of ~800 dashboard pages). */
export const NAV_MATURITY_HIDE_TARGET = 280 as const;

/** Longest-prefix wins — more specific paths before broader ones. */
export const NAV_MATURITY_HIDE_RULES: readonly NavMaturityHideRule[] = [
  // Preview integrations (sidebar links gated until navScopeAll)
  { prefix: "/dashboard/settings/security/sso", exposure: "preview", matrixRef: "Enterprise SSO pilot" },
  { prefix: "/dashboard/inventory/pos-impacts", exposure: "preview", matrixRef: "Inventory counts and waste" },
  { prefix: "/dashboard/costing/theft", exposure: "preview", matrixRef: "Costing and margin" },
  { prefix: "/dashboard/marketing/holiday-packages", exposure: "preview", matrixRef: "Growth campaigns" },
  { prefix: "/dashboard/integrations/7shifts", exposure: "preview", matrixRef: "7shifts scheduling sync" },
  { prefix: "/dashboard/integrations/doordash", exposure: "preview", matrixRef: "DoorDash marketplace BETA" },
  { prefix: "/dashboard/integrations/grubhub", exposure: "preview", matrixRef: "Grubhub marketplace BETA" },
  { prefix: "/dashboard/integrations/uber-eats", exposure: "preview", matrixRef: "Uber Eats marketplace BETA" },
  { prefix: "/dashboard/integrations/extensions", exposure: "preview", matrixRef: "App marketplace extensions catalog" },
  { prefix: "/dashboard/integrations/outbound-webhooks", exposure: "preview", matrixRef: "Partner outbound webhooks" },
  { prefix: "/dashboard/integrations/oauth-apps", exposure: "preview", matrixRef: "OAuth sandbox apps" },
  { prefix: "/dashboard/gift-cards", exposure: "preview", matrixRef: "Gift cards" },
  { prefix: "/dashboard/customers/loyalty", exposure: "preview", matrixRef: "Loyalty programs" },
  { prefix: "/dashboard/storefront/gift-cards", exposure: "preview", matrixRef: "Storefront gift cards" },
  { prefix: "/dashboard/storefront/loyalty", exposure: "preview", matrixRef: "Storefront loyalty" },
  { prefix: "/dashboard/meal-plans", exposure: "preview", matrixRef: "Meal subscriptions" },
  { prefix: "/dashboard/integrations/uber-direct", exposure: "preview", matrixRef: "Uber Direct dispatch BETA" },
  { prefix: "/dashboard/routes/uber-direct", exposure: "preview", matrixRef: "Uber Direct dispatch BETA" },
  { prefix: "/dashboard/pos/tabs", exposure: "preview", matrixRef: "Bar tabs" },
  { prefix: "/dashboard/pos/handheld", exposure: "preview", matrixRef: "Handheld ordering" },
  { prefix: "/dashboard/tables", exposure: "preview", matrixRef: "Tables and restaurant service" },
  { prefix: "/dashboard/copilot", exposure: "preview", matrixRef: "Copilot / AI insights" },
  { prefix: "/dashboard/storefront/reservations", exposure: "preview", matrixRef: "Reservations" },
  { prefix: "/dashboard/reservations", exposure: "preview", matrixRef: "Reservations" },
  { prefix: "/dashboard/staff/payroll", exposure: "preview", matrixRef: "Payroll export" },
  { prefix: "/dashboard/marketing/email-campaigns", exposure: "preview", matrixRef: "Growth campaigns" },

  // Internal / platform-only surfaces
  { prefix: "/dashboard/demo", exposure: "internal", matrixRef: "Platform admin and support" },
  { prefix: "/dashboard/visual-test", exposure: "internal", matrixRef: "Visual test harness" },
  { prefix: "/dashboard/growth", exposure: "internal", matrixRef: "Growth campaigns" },
  { prefix: "/dashboard/beta-applications", exposure: "internal", matrixRef: "Platform admin and support" },
  { prefix: "/dashboard/partner", exposure: "internal", matrixRef: "Platform admin and support" },
  { prefix: "/dashboard/developer", exposure: "internal", matrixRef: "Platform admin and support" },
  { prefix: "/dashboard/platform", exposure: "internal", matrixRef: "Platform admin and support" },
  { prefix: "/dashboard/founder", exposure: "internal", matrixRef: "Platform admin and support" },

  // Pilot-hidden / advanced modules
  { prefix: "/dashboard/forecast", exposure: "hidden_default", matrixRef: "Forecasting BETA" },
  { prefix: "/dashboard/purchasing", exposure: "hidden_default", matrixRef: "Purchasing ERP depth" },
  { prefix: "/dashboard/costing", exposure: "hidden_default", matrixRef: "Recipe costing depth" },
  { prefix: "/dashboard/reports", exposure: "hidden_default", matrixRef: "Enterprise reporting" },
  { prefix: "/dashboard/catering-quotes", exposure: "hidden_default", matrixRef: "Catering quotes niche" },
  { prefix: "/dashboard/training", exposure: "hidden_default", matrixRef: "CS onboarding depth" },
  { prefix: "/dashboard/executive", exposure: "hidden_default", matrixRef: "Executive dashboard" },
  { prefix: "/dashboard/import-export", exposure: "hidden_default", matrixRef: "Migration power tool" },
  { prefix: "/dashboard/workspace/experiments", exposure: "hidden_default", matrixRef: "Workspace experiments" },
  { prefix: "/dashboard/implementation/enterprise", exposure: "hidden_default", matrixRef: "Enterprise RFP scope" },
  { prefix: "/dashboard/go-live", exposure: "hidden_default", matrixRef: "Go-live projects — Launch Wizard primary" },
  { prefix: "/dashboard/franchise", exposure: "hidden_default", matrixRef: "Franchise roadmap" },

  // Orphan sprawl — navigation audit “Other modules” bucket
  { prefix: "/dashboard/accounting", exposure: "hidden_default", matrixRef: "Accounting depth" },
  { prefix: "/dashboard/audit-logs", exposure: "hidden_default", matrixRef: "Audit log export" },
  { prefix: "/dashboard/ai", exposure: "hidden_default", matrixRef: "AI modules" },
  { prefix: "/dashboard/brands", exposure: "hidden_default", matrixRef: "Multi-brand command center" },
  { prefix: "/dashboard/catering", exposure: "hidden_default", matrixRef: "Catering ops depth" },
  { prefix: "/dashboard/compliance", exposure: "hidden_default", matrixRef: "Compliance depth" },
  { prefix: "/dashboard/crm", exposure: "hidden_default", matrixRef: "CRM depth" },
  { prefix: "/dashboard/developers", exposure: "hidden_default", matrixRef: "Developer portal" },
  { prefix: "/dashboard/enterprise", exposure: "hidden_default", matrixRef: "Enterprise admin" },
  { prefix: "/dashboard/floor-plans", exposure: "hidden_default", matrixRef: "Floor plan editor" },
  { prefix: "/dashboard/loyalty", exposure: "hidden_default", matrixRef: "Loyalty depth" },
  { prefix: "/dashboard/meal-subscriptions", exposure: "hidden_default", matrixRef: "Meal subscriptions alias" },
  { prefix: "/dashboard/menu", exposure: "hidden_default", matrixRef: "Menu tools alias" },
  { prefix: "/dashboard/onboarding", exposure: "hidden_default", matrixRef: "Legacy onboarding" },
  { prefix: "/dashboard/operations", exposure: "hidden_default", matrixRef: "Operations checklists depth" },
  { prefix: "/dashboard/playbooks", exposure: "hidden_default", matrixRef: "Playbooks library" },
  { prefix: "/dashboard/qr-codes", exposure: "hidden_default", matrixRef: "QR code admin" },
  { prefix: "/dashboard/quick-start", exposure: "hidden_default", matrixRef: "Legacy quick start" },
  { prefix: "/dashboard/scan", exposure: "hidden_default", matrixRef: "Scan utilities" },
  { prefix: "/dashboard/security", exposure: "hidden_default", matrixRef: "Security admin alias" },
  { prefix: "/dashboard/templates", exposure: "hidden_default", matrixRef: "Template library" },
  { prefix: "/dashboard/workspace", exposure: "hidden_default", matrixRef: "Workspace admin" },
  { prefix: "/dashboard/commissary", exposure: "hidden_default", matrixRef: "Commissary transfers" },
  { prefix: "/dashboard/recipes", exposure: "hidden_default", matrixRef: "Recipe yield tools" },

  // Deep analytics (landing `/dashboard/analytics` stays visible)
  { prefix: "/dashboard/analytics/advanced", exposure: "hidden_default", matrixRef: "Advanced analytics" },
  { prefix: "/dashboard/analytics/benchmarks", exposure: "hidden_default", matrixRef: "Benchmark analytics" },
  { prefix: "/dashboard/analytics/capital", exposure: "hidden_default", matrixRef: "Capital analytics" },
  { prefix: "/dashboard/analytics/catering", exposure: "hidden_default", matrixRef: "Catering analytics" },
  { prefix: "/dashboard/analytics/channels", exposure: "hidden_default", matrixRef: "Channel analytics" },
  { prefix: "/dashboard/analytics/customers", exposure: "hidden_default", matrixRef: "Customer analytics" },
  { prefix: "/dashboard/analytics/delivery", exposure: "hidden_default", matrixRef: "Delivery analytics" },
  { prefix: "/dashboard/analytics/forecast", exposure: "hidden_default", matrixRef: "Forecast analytics" },
  { prefix: "/dashboard/analytics/inventory", exposure: "hidden_default", matrixRef: "Inventory analytics" },
  { prefix: "/dashboard/analytics/labor", exposure: "hidden_default", matrixRef: "Labor analytics" },
  { prefix: "/dashboard/analytics/margin", exposure: "hidden_default", matrixRef: "Margin analytics" },
  { prefix: "/dashboard/analytics/menu", exposure: "hidden_default", matrixRef: "Menu analytics" },
  { prefix: "/dashboard/analytics/orders", exposure: "hidden_default", matrixRef: "Order analytics" },
  { prefix: "/dashboard/analytics/pos", exposure: "hidden_default", matrixRef: "POS analytics" },
  { prefix: "/dashboard/analytics/production", exposure: "hidden_default", matrixRef: "Production analytics" },
  { prefix: "/dashboard/analytics/profit", exposure: "hidden_default", matrixRef: "Profit analytics" },
  { prefix: "/dashboard/analytics/purchasing", exposure: "hidden_default", matrixRef: "Purchasing analytics" },
  { prefix: "/dashboard/analytics/revenue", exposure: "hidden_default", matrixRef: "Revenue analytics" },
  { prefix: "/dashboard/analytics/storefront", exposure: "hidden_default", matrixRef: "Storefront analytics" },
  { prefix: "/dashboard/analytics/waste", exposure: "hidden_default", matrixRef: "Waste analytics" },

  // Settings deep tree (main `/dashboard/settings` landing stays visible)
  { prefix: "/dashboard/settings/security", exposure: "hidden_default", matrixRef: "Settings security" },
  { prefix: "/dashboard/settings/billing", exposure: "hidden_default", matrixRef: "Settings billing" },
  { prefix: "/dashboard/settings/branding", exposure: "hidden_default", matrixRef: "Settings branding" },
  { prefix: "/dashboard/settings/data", exposure: "hidden_default", matrixRef: "Settings data" },
  { prefix: "/dashboard/settings/integrations", exposure: "hidden_default", matrixRef: "Settings integrations" },
  { prefix: "/dashboard/settings/locations", exposure: "hidden_default", matrixRef: "Settings locations" },
  { prefix: "/dashboard/settings/modules", exposure: "hidden_default", matrixRef: "Settings modules" },
  { prefix: "/dashboard/settings/notifications", exposure: "hidden_default", matrixRef: "Settings notifications" },
  { prefix: "/dashboard/settings/pos", exposure: "hidden_default", matrixRef: "Settings POS" },
  { prefix: "/dashboard/settings/storefront", exposure: "hidden_default", matrixRef: "Settings storefront" },
  { prefix: "/dashboard/settings/team", exposure: "hidden_default", matrixRef: "Settings team" },
  { prefix: "/dashboard/settings/voice", exposure: "hidden_default", matrixRef: "Settings voice" },
  { prefix: "/dashboard/settings/webhooks", exposure: "hidden_default", matrixRef: "Settings webhooks" },
  { prefix: "/dashboard/settings/workflows", exposure: "hidden_default", matrixRef: "Settings workflows" },
  { prefix: "/dashboard/settings/audit", exposure: "hidden_default", matrixRef: "Settings audit" },
  { prefix: "/dashboard/settings/compliance", exposure: "hidden_default", matrixRef: "Settings compliance" },
  { prefix: "/dashboard/settings/cron", exposure: "hidden_default", matrixRef: "Settings cron" },
  { prefix: "/dashboard/settings/developer", exposure: "hidden_default", matrixRef: "Settings developer" },
  { prefix: "/dashboard/settings/enterprise", exposure: "hidden_default", matrixRef: "Settings enterprise" },
  { prefix: "/dashboard/settings/franchise", exposure: "hidden_default", matrixRef: "Settings franchise" },
  { prefix: "/dashboard/settings/marketplace", exposure: "hidden_default", matrixRef: "Settings marketplace" },
  { prefix: "/dashboard/settings/migration", exposure: "hidden_default", matrixRef: "Settings migration" },
  { prefix: "/dashboard/settings/partner", exposure: "hidden_default", matrixRef: "Settings partner" },
  { prefix: "/dashboard/settings/platform", exposure: "hidden_default", matrixRef: "Settings platform" },
  { prefix: "/dashboard/settings/scim", exposure: "hidden_default", matrixRef: "Settings SCIM" },
  { prefix: "/dashboard/settings/sso", exposure: "hidden_default", matrixRef: "Settings SSO" },
  { prefix: "/dashboard/settings/support", exposure: "hidden_default", matrixRef: "Settings support" },

  // Integration hub leaf pages (sales-channels landing stays visible)
  { prefix: "/dashboard/integrations/health", exposure: "hidden_default", matrixRef: "Integration health alias" },
  { prefix: "/dashboard/integrations/homebase", exposure: "hidden_default", matrixRef: "Homebase integration" },
  { prefix: "/dashboard/integrations/inventory-sync", exposure: "hidden_default", matrixRef: "Inventory sync" },
  { prefix: "/dashboard/integrations/quickbooks", exposure: "hidden_default", matrixRef: "QuickBooks integration" },
  { prefix: "/dashboard/integrations/shopify", exposure: "hidden_default", matrixRef: "Shopify integration hub" },
  { prefix: "/dashboard/integrations/stripe", exposure: "hidden_default", matrixRef: "Stripe integration hub" },
  { prefix: "/dashboard/integrations/woocommerce", exposure: "hidden_default", matrixRef: "WooCommerce integration hub" },
  { prefix: "/dashboard/integrations/square", exposure: "preview", matrixRef: "Square POS order import BETA" },
  { prefix: "/dashboard/integrations/clover", exposure: "preview", matrixRef: "Clover POS order import BETA" },
  { prefix: "/dashboard/integrations/toast", exposure: "preview", matrixRef: "Toast POS order import BETA" },
  { prefix: "/dashboard/integrations/webhooks", exposure: "hidden_default", matrixRef: "Webhooks hub" },
  { prefix: "/dashboard/integrations/import", exposure: "hidden_default", matrixRef: "Integration import" },
  { prefix: "/dashboard/integrations/sync", exposure: "hidden_default", matrixRef: "Integration sync" },

  // System health / error recovery (admin deep links)
  { prefix: "/dashboard/system-health", exposure: "hidden_default", matrixRef: "System health admin" },
  { prefix: "/dashboard/error-recovery", exposure: "hidden_default", matrixRef: "Error recovery admin" },
];

const DYNAMIC_SEGMENT = /\[[^\]]+\]/;

function normalizeHref(href: string): string {
  return href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
}

function hrefMatchesPrefix(href: string, prefix: string): boolean {
  const h = normalizeHref(href);
  const p = normalizeHref(prefix);
  return h === p || h.startsWith(`${p}/`);
}

/** Dynamic `[id]` detail routes are never focused-nav entries. */
export function isNavMaturityDynamicDetailRoute(pathname: string): boolean {
  return DYNAMIC_SEGMENT.test(pathname);
}

export function getNavMaturityHideRule(href: string): NavMaturityHideRule | null {
  const h = normalizeHref(href);
  let match: NavMaturityHideRule | null = null;
  for (const rule of NAV_MATURITY_HIDE_RULES) {
    if (!hrefMatchesPrefix(h, rule.prefix)) continue;
    if (!match || rule.prefix.length > match.prefix.length) {
      match = rule;
    }
  }
  return match;
}

export function getNavMaturityHideExposure(href: string): NavMaturityHideExposure | null {
  if (isNavMaturityDynamicDetailRoute(href)) {
    return "hidden_default";
  }
  return getNavMaturityHideRule(href)?.exposure ?? null;
}

export function isHiddenFromFocusedNavExposure(exposure: NavMaturityHideExposure): boolean {
  return (
    exposure === "preview" ||
    exposure === "placeholder" ||
    exposure === "hidden_default" ||
    exposure === "internal"
  );
}

export function isRouteHiddenFromFocusedNav(pathname: string): boolean {
  const exposure = getNavMaturityHideExposure(pathname);
  if (!exposure) return false;
  return isHiddenFromFocusedNavExposure(exposure);
}

export type NavMaturityHideCoverage = {
  totalDashboardRoutes: number;
  hiddenFromFocusedNav: number;
  visibleInFocusedNav: number;
  dynamicDetailRoutes: number;
  target: number;
  targetMet: boolean;
};

export function summarizeNavMaturityHideCoverage(
  dashboardRoutes: readonly string[],
): NavMaturityHideCoverage {
  let hidden = 0;
  let dynamic = 0;
  for (const route of dashboardRoutes) {
    if (isNavMaturityDynamicDetailRoute(route)) dynamic += 1;
    if (isRouteHiddenFromFocusedNav(route)) hidden += 1;
  }
  return {
    totalDashboardRoutes: dashboardRoutes.length,
    hiddenFromFocusedNav: hidden,
    visibleInFocusedNav: dashboardRoutes.length - hidden,
    dynamicDetailRoutes: dynamic,
    target: NAV_MATURITY_HIDE_TARGET,
    targetMet: hidden >= NAV_MATURITY_HIDE_TARGET,
  };
}
