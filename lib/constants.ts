import { resolvePublicSiteUrl } from "@/lib/auth/public-site-url";

export const APP_NAME = "KitchenOS";

/** Client and server safe — prefers NEXT_PUBLIC_APP_URL; never empty string. */
export const SITE_URL = resolvePublicSiteUrl();

export const STRIPE_PLANS = {
  STARTER: {
    name: "Starter",
    priceMonthly: 29,
    description: "Manual orders, one active menu, essential production board.",
  },
  PRO: {
    name: "Pro",
    priceMonthly: 79,
    description: "WooCommerce + Shopify, packing labels, analytics, inventory lite.",
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
