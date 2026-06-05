import { resolvePublicSiteUrl } from "@/lib/auth/public-site-url";

export const APP_NAME = "OS Kitchen";

/** Primary brand accent — buttons, links, focus rings. */
export const BRAND_ACCENT = "#FF5F1F";
export const BRAND_ACCENT_HOVER = "#FF7530";
export const BRAND_ACCENT_DARK = "#CC4512";
export const BRAND_ACCENT_DEEP = "#A8380E";
export const BRAND_INK = "#0D0E12";

/** Client and server safe — prefers NEXT_PUBLIC_APP_URL; never empty string. */
export const SITE_URL = resolvePublicSiteUrl();

export const STRIPE_PLANS = {
  STARTER: {
    name: "Starter",
    priceMonthly: 49,
    description: "Orders, kitchen display, and basic analytics for small venues.",
  },
  PRO: {
    name: "Pro",
    priceMonthly: 199,
    description: "All channels, full analytics, unlimited staff, and API access.",
  },
  TEAM: {
    name: "Team",
    priceMonthly: 199,
    description: "Uber modules, roles, unlimited orders, advanced production.",
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceMonthly: 0,
    description:
      "Multi-location, custom integrations, SLA, API — contact sales.",
  },
} as const;
