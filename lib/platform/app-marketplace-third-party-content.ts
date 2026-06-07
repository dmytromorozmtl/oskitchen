export const APP_MARKETPLACE_THIRD_PARTY_PATH = "/app-marketplace" as const;

/** Policy: app-marketplace-third-party-absolute-final-v1 (Absolute Final Task 89) */

export const APP_MARKETPLACE_THIRD_PARTY_META = {
  title: "App Marketplace — Third-Party Extensions | OS Kitchen",
  description:
    "Certified SI partners, OAuth sandbox apps, and developer extensions for OS Kitchen — honest BETA labels, platform review, 70/30 revenue share.",
  utmCampaign: "app_marketplace_third_party",
} as const;

export type AppMarketplaceThirdPartyKind = "certified_si" | "oauth_app" | "webhook" | "embed";

export type AppMarketplaceThirdPartyMaturity = "LIVE" | "BETA" | "ROADMAP" | "CERTIFIED";

export type AppMarketplaceThirdPartyExtension = {
  id: string;
  name: string;
  publisher: string;
  kind: AppMarketplaceThirdPartyKind;
  category: string;
  maturity: AppMarketplaceThirdPartyMaturity;
  description: string;
  installPath: string;
  honestyNote: string;
};

/** Curated third-party and platform extensions — mirrors partner-apps.json + developer phases. */
export const APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS: AppMarketplaceThirdPartyExtension[] = [
  {
    id: "partner-slack-ops-alerts",
    name: "Slack ops alerts",
    publisher: "OpsBridge (Certified SI)",
    kind: "certified_si",
    category: "Operations",
    maturity: "CERTIFIED",
    description: "Route KDS backlog, packing exceptions, and route delays into Slack channels.",
    installPath: "/partners",
    honestyNote: "SI-led implementation — not self-serve OAuth install.",
  },
  {
    id: "partner-klaviyo-sync",
    name: "Klaviyo customer sync",
    publisher: "GrowthKitchen (Certified SI)",
    kind: "certified_si",
    category: "Marketing",
    maturity: "CERTIFIED",
    description: "Push orders, loyalty tiers, and segments into Klaviyo for email and SMS journeys.",
    installPath: "/partners",
    honestyNote: "Certified SI builds the connector — platform review required.",
  },
  {
    id: "partner-marginedge-inventory",
    name: "MarginEdge inventory bridge",
    publisher: "PrimeCost Labs (Certified SI)",
    kind: "certified_si",
    category: "Operations",
    maturity: "CERTIFIED",
    description: "Reconcile ingredients and depletion with MarginEdge for prime-cost visibility.",
    installPath: "/partners",
    honestyNote: "Requires SI mapping between recipes and MarginEdge item masters.",
  },
  {
    id: "partner-gusto-payroll",
    name: "Gusto payroll export",
    publisher: "LaborLink (Certified SI)",
    kind: "certified_si",
    category: "Labor",
    maturity: "CERTIFIED",
    description: "Export time-clock and tip-pool summaries into Gusto payroll runs.",
    installPath: "/partners",
    honestyNote: "Uses existing exports — SI configures Gusto import templates.",
  },
  {
    id: "partner-google-reservations",
    name: "Google Reserve / Maps booking",
    publisher: "HostFlow (Certified SI)",
    kind: "certified_si",
    category: "Operations",
    maturity: "CERTIFIED",
    description: "Surface reservation availability on Google Reserve with two-way hold sync.",
    installPath: "/dashboard/storefront/reservations",
    honestyNote: "Requires live reservation widget plus SI Google onboarding.",
  },
  {
    id: "oauth-app-install",
    name: "OAuth app install",
    publisher: "OS Kitchen Platform",
    kind: "oauth_app",
    category: "Developer",
    maturity: "BETA",
    description: "Scoped OAuth consent, API tokens, and install/uninstall lifecycle per workspace.",
    installPath: "/dashboard/integrations/oauth-apps",
    honestyNote: "Sandbox BETA — production publish requires platform review queue.",
  },
  {
    id: "outbound-webhooks",
    name: "Outbound webhook subscriptions",
    publisher: "OS Kitchen Platform",
    kind: "webhook",
    category: "Developer",
    maturity: "BETA",
    description: "Merchant-configured events (order.created, inventory.updated) with HMAC signing.",
    installPath: "/dashboard/integrations/outbound-webhooks",
    honestyNote: "Documented API — not a certified public app store listing yet.",
  },
  {
    id: "embedded-admin",
    name: "Embedded admin extensions",
    publisher: "OS Kitchen Platform",
    kind: "embed",
    category: "Developer",
    maturity: "ROADMAP",
    description: "Signed iframe host for partner UI inside dashboard settings sidebars.",
    installPath: "/developers",
    honestyNote: "Requires OAuth app install and security review pipeline first.",
  },
] as const;

export const APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE = {
  developerPercent: 70,
  platformPercent: 30,
  summary: "Developers keep 70% of net app revenue; OS Kitchen retains 30% platform fee.",
} as const;

export const APP_MARKETPLACE_THIRD_PARTY_H1 =
  "App Marketplace — Third-Party Extensions" as const;

export const APP_MARKETPLACE_THIRD_PARTY_SUBTITLE =
  "Certified SI partners, OAuth sandbox apps, webhooks, and embedded admin — platform review required. Not a self-serve Toast/Square marketplace yet." as const;

export const APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE =
  "Illustrative catalog — your workspace shows live connection state in Integrations → Extensions. BETA and ROADMAP mean what they say; certified SI extensions require partner scoping." as const;

export const APP_MARKETPLACE_THIRD_PARTY_CTA = {
  primaryHref: "/signup?redirect=/dashboard/integrations/extensions",
  primaryLabel: "Browse in dashboard",
  developerHref: "/developers/apps/register",
  developerLabel: "Register OAuth app",
  extensionsHref: "/dashboard/integrations/extensions",
  partnersHref: "/partners",
} as const;

export function appMarketplaceThirdPartyKindLabel(kind: AppMarketplaceThirdPartyKind): string {
  if (kind === "certified_si") return "Certified SI";
  if (kind === "oauth_app") return "OAuth app";
  if (kind === "webhook") return "Webhooks";
  return "Embedded UI";
}

export function getAppMarketplaceThirdPartyExtension(
  id: string,
): AppMarketplaceThirdPartyExtension | undefined {
  return APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.find((e) => e.id === id);
}
