import {
  getNavMaturityRule,
  type NavMaturityExposure,
} from "@/lib/navigation/nav-maturity-governance";
import {
  PAGE_MATURITY_INLINE_HONESTY_ROUTES,
  PAGE_MATURITY_INLINE_PLACEHOLDER_ROUTES,
} from "@/lib/navigation/page-maturity-sweep-policy";

export type PageMaturityHonesty = {
  exposure: Extract<NavMaturityExposure, "preview" | "placeholder">;
  title: string;
  detail: string;
};

const PAGE_MATURITY_DETAIL_BY_PREFIX: Record<string, string> = {
  "/dashboard/pos/tabs":
    "Bar and table tabs support bill splitting (equal, percentage, seat, item) with per-guest totals. Full multi-payment close per share is not certified yet.",
  "/dashboard/pos/handheld":
    "Handheld ordering BETA — mobile waiter UI with offline cash queue and installable PWA. Tab fire requires connectivity; not certified native handheld hardware.",
  "/dashboard/tables":
    "Floor plan preview only — not production table-service, split checks, or rush-hour FOH certification.",
  "/dashboard/copilot":
    "AI copilot is preview/pilot-scoped. Outputs require human review; not a certified autonomous operations product.",
  "/dashboard/forecast":
    "Forecasting is preview-scoped. Treat projections as directional until provenance and operator trust tests expand.",
  "/dashboard/storefront/reservations":
    "Reservations BETA — calendar, availability, public booking, and waitlist SMS with estimated wait times. Deep POS table sync is not certified yet.",
  "/dashboard/reservations":
    "Reservations BETA — calendar, availability, public booking, and waitlist SMS with estimated wait times. Deep POS table sync is not certified yet.",
  "/dashboard/food-safety":
    "Food safety tools are preview-scoped — not a certified HACCP or audit-export suite.",
  "/dashboard/staff/payroll":
    "Payroll export is preview-scoped — CSV summary from time clock entries; not certified accounting or full payroll suite parity.",
  "/dashboard/marketing/email-campaigns":
    "Email campaigns are preview-scoped — Klaviyo-dependent flows; not certified full marketing automation.",
  "/dashboard/integrations/doordash":
    "DoorDash BETA — webhook order ingest, menu sync, and Drive delivery require partner-approved credentials; not certified production LIVE.",
  "/dashboard/integrations/grubhub":
    "Grubhub BETA — webhook order ingest, menu sync, and poll import require Grubhub partner approval; not certified production LIVE.",
  "/dashboard/integrations/uber-eats":
    "Uber Eats BETA — OAuth order ingest, menu sync, and signed webhooks require Uber partner approval; not certified production LIVE.",
  "/dashboard/integrations/uber-direct":
    "Uber Direct dispatch is a placeholder — workflow rehearsal only, not live courier APIs.",
  "/dashboard/routes/uber-direct":
    "Uber Direct dispatch is a placeholder — workflow rehearsal only, not live courier APIs.",
  "/dashboard/settings/security/sso":
    "Enterprise SSO is pilot wiring for activated workspaces only — not production SSO for all tenants.",
  "/dashboard/inventory/pos-impacts":
    "POS-only recipe depletion diagnostics — beta. Storefront and online orders do not deplete stock in pilot.",
  "/dashboard/costing/theft":
    "Theft detection alerts are preview-scoped variance signals — not certified shrink or loss-prevention product.",
  "/dashboard/marketing/holiday-packages":
    "Holiday packages are preview-scoped seasonal bundles — not certified full catering or ecommerce parity.",
  "/dashboard/integrations/7shifts":
    "7shifts schedule sync is preview-scoped — not certified labor suite or payroll parity.",
  "/dashboard/integrations/extensions":
    "Extensions catalog BETA — partner directory and OAuth sandbox; not a self-serve app store yet.",
  "/dashboard/integrations/outbound-webhooks":
    "Outbound webhooks BETA — partner integrations; not certified marketplace delivery parity.",
  "/dashboard/integrations/oauth-apps":
    "OAuth sandbox apps BETA — developer preview; not certified public app marketplace.",
  "/dashboard/gift-cards":
    "Gift cards BETA — dual locked; cross-channel redemption not certified for pilot commitments.",
  "/dashboard/customers/loyalty":
    "Loyalty BETA — dual locked; cross-channel rewards deferred until pilot scope expands.",
  "/dashboard/storefront/gift-cards":
    "Storefront gift cards BETA — not certified network-wide gift card parity.",
  "/dashboard/storefront/loyalty":
    "Storefront loyalty BETA — not certified unified rewards across channels.",
  "/dashboard/meal-plans":
    "Meal subscriptions BETA — native meal plans only; WooCommerce Subscriptions bridge not implemented.",
};

function normalizeHref(href: string): string {
  return href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
}

function hrefMatchesPrefix(href: string, prefix: string): boolean {
  const h = normalizeHref(href);
  const p = normalizeHref(prefix);
  return h === p || h.startsWith(`${p}/`);
}

function hasInlinePlaceholderBanner(pathname: string): boolean {
  return PAGE_MATURITY_INLINE_PLACEHOLDER_ROUTES.some((prefix) =>
    hrefMatchesPrefix(pathname, prefix),
  );
}

function hasInlineHonestyCopy(pathname: string): boolean {
  return PAGE_MATURITY_INLINE_HONESTY_ROUTES.some((prefix) =>
    hrefMatchesPrefix(pathname, prefix),
  );
}

export function getPageMaturityHonesty(pathname: string): PageMaturityHonesty | null {
  const rule = getNavMaturityRule(pathname);
  if (!rule) return null;
  if (rule.exposure !== "preview" && rule.exposure !== "placeholder") return null;
  if (rule.exposure === "placeholder" && hasInlinePlaceholderBanner(pathname)) {
    return null;
  }
  if (rule.exposure === "preview" && hasInlineHonestyCopy(pathname)) {
    return null;
  }

  const detail =
    PAGE_MATURITY_DETAIL_BY_PREFIX[rule.prefix] ??
    `${rule.matrixRef} is ${rule.exposure} in OS Kitchen — see docs/feature-maturity-matrix.md before customer commitments.`;

  return {
    exposure: rule.exposure,
    title: rule.matrixRef,
    detail,
  };
}
