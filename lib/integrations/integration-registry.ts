/**
 * Third-party integration registry (delivery, accounting connectors).
 * Channel marketplace cards live in `lib/channels/channel-registry.ts`.
 */

export type IntegrationRegistryEntry = {
  id: string;
  name: string;
  status: "LIVE" | "BETA" | "PLACEHOLDER";
  requiredEnv: string[];
  setupRoute: string;
};

export const INTEGRATION_REGISTRY: IntegrationRegistryEntry[] = [
  {
    id: "doordash",
    name: "DoorDash",
    status: "LIVE",
    requiredEnv: ["DOORDASH_API_KEY", "DOORDASH_MERCHANT_ID", "DOORDASH_WEBHOOK_SECRET"],
    setupRoute: "/dashboard/integrations/doordash",
  },
  {
    id: "skip",
    name: "Skip / Just Eat",
    status: "LIVE",
    requiredEnv: [
      "SKIP_CLIENT_ID",
      "SKIP_CLIENT_SECRET",
      "SKIP_RESTAURANT_ID",
      "SKIP_WEBHOOK_SECRET",
    ],
    setupRoute: "/dashboard/integrations/skip",
  },
  {
    id: "grubhub",
    name: "Grubhub",
    status: "LIVE",
    requiredEnv: ["GRUBHUB_API_KEY", "GRUBHUB_MERCHANT_ID", "GRUBHUB_WEBHOOK_SECRET"],
    setupRoute: "/dashboard/integrations/grubhub",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    status: "LIVE",
    requiredEnv: [
      "WOOCOMMERCE_BASE_URL",
      "WOOCOMMERCE_CONSUMER_KEY",
      "WOOCOMMERCE_CONSUMER_SECRET",
      "WOOCOMMERCE_WEBHOOK_SECRET",
    ],
    setupRoute: "/dashboard/integrations/woocommerce",
  },
  {
    id: "shopify",
    name: "Shopify",
    status: "LIVE",
    requiredEnv: [
      "SHOPIFY_SHOP_DOMAIN",
      "SHOPIFY_ADMIN_ACCESS_TOKEN",
      "SHOPIFY_APP_SECRET",
    ],
    setupRoute: "/dashboard/integrations/shopify",
  },
  {
    id: "uber-eats",
    name: "Uber Eats",
    status: "LIVE",
    requiredEnv: [
      "UBER_EATS_CLIENT_ID",
      "UBER_EATS_CLIENT_SECRET",
      "UBER_EATS_STORE_ID",
      "UBER_EATS_WEBHOOK_SECRET",
    ],
    setupRoute: "/dashboard/integrations/uber-eats",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    status: "LIVE",
    requiredEnv: ["QUICKBOOKS_CLIENT_ID", "QUICKBOOKS_CLIENT_SECRET"],
    setupRoute: "/dashboard/integrations/quickbooks",
  },
  {
    id: "xero",
    name: "Xero",
    status: "LIVE",
    requiredEnv: ["XERO_CLIENT_ID", "XERO_CLIENT_SECRET"],
    setupRoute: "/dashboard/integrations/xero",
  },
  {
    id: "7shifts",
    name: "7shifts",
    status: "LIVE",
    requiredEnv: [
      "SEVENSHIFTS_CLIENT_ID",
      "SEVENSHIFTS_CLIENT_SECRET",
      "SEVENSHIFTS_COMPANY_ID",
    ],
    setupRoute: "/dashboard/integrations/7shifts",
  },
  {
    id: "homebase",
    name: "Homebase",
    status: "LIVE",
    requiredEnv: [
      "HOMEBASE_CLIENT_ID",
      "HOMEBASE_CLIENT_SECRET",
      "HOMEBASE_LOCATION_ID",
    ],
    setupRoute: "/dashboard/integrations/homebase",
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    status: "LIVE",
    requiredEnv: ["KLAVIYO_API_KEY"],
    setupRoute: "/dashboard/integrations/klaviyo",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    status: "LIVE",
    requiredEnv: [
      "MAILCHIMP_CLIENT_ID",
      "MAILCHIMP_CLIENT_SECRET",
      "MAILCHIMP_LIST_ID",
    ],
    setupRoute: "/dashboard/integrations/mailchimp",
  },
  {
    id: "resy",
    name: "Resy",
    status: "LIVE",
    requiredEnv: [
      "RESY_CLIENT_ID",
      "RESY_CLIENT_SECRET",
      "RESY_VENUE_ID",
      "RESY_WEBHOOK_SECRET",
    ],
    setupRoute: "/dashboard/integrations/resy",
  },
  {
    id: "opentable",
    name: "OpenTable",
    status: "LIVE",
    requiredEnv: [
      "OPENTABLE_CLIENT_ID",
      "OPENTABLE_CLIENT_SECRET",
      "OPENTABLE_RID",
      "OPENTABLE_WEBHOOK_SECRET",
    ],
    setupRoute: "/dashboard/integrations/opentable",
  },
  {
    id: "uber-direct",
    name: "Uber Direct",
    status: "BETA",
    requiredEnv: ["UBER_DIRECT_CUSTOMER_ID", "UBER_DIRECT_CLIENT_ID", "UBER_DIRECT_CLIENT_SECRET"],
    setupRoute: "/dashboard/integrations/uber-direct",
  },
  {
    id: "square",
    name: "Square",
    status: "BETA",
    requiredEnv: ["SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID"],
    setupRoute: "/dashboard/integrations/square",
  },
  {
    id: "toast",
    name: "Toast",
    status: "BETA",
    requiredEnv: ["TOAST_ACCESS_TOKEN", "TOAST_RESTAURANT_GUID"],
    setupRoute: "/dashboard/integrations/toast",
  },
  {
    id: "clover",
    name: "Clover",
    status: "BETA",
    requiredEnv: ["CLOVER_ACCESS_TOKEN", "CLOVER_MERCHANT_ID"],
    setupRoute: "/dashboard/integrations/clover",
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    status: "BETA",
    requiredEnv: ["LIGHTSPEED_ACCESS_TOKEN", "LIGHTSPEED_BUSINESS_LOCATION_ID"],
    setupRoute: "/dashboard/integrations/lightspeed",
  },
  {
    id: "google-forms",
    name: "Google Forms",
    status: "BETA",
    requiredEnv: ["GOOGLE_FORMS_SHEET_ACCESS_TOKEN", "GOOGLE_FORMS_SHEET_ID"],
    setupRoute: "/dashboard/integrations/google-forms",
  },
  {
    id: "email-orders",
    name: "Email orders",
    status: "BETA",
    requiredEnv: [],
    setupRoute: "/dashboard/integrations/email-orders",
  },
];

export function getIntegrationById(id: string): IntegrationRegistryEntry | undefined {
  return INTEGRATION_REGISTRY.find((e) => e.id === id);
}

export const BETA_INTEGRATION_IDS = INTEGRATION_REGISTRY.filter(
  (entry) => entry.status === "BETA",
).map((entry) => entry.id);

export const LIVE_INTEGRATION_IDS = INTEGRATION_REGISTRY.filter(
  (entry) => entry.status === "LIVE",
).map((entry) => entry.id);

export function isBetaIntegration(id: string): boolean {
  return getIntegrationById(id)?.status === "BETA";
}

/** Maps sales-channel provider keys to integration registry ids when they share BETA status. */
const PROVIDER_KEY_TO_INTEGRATION_ID: Partial<Record<string, string>> = {
  doordash: "doordash",
  grubhub: "grubhub",
  quickbooks: "quickbooks",
  shopify: "shopify",
  woocommerce: "woocommerce",
  skip: "skip",
  "uber-eats": "uber-eats",
};

export function isBetaIntegrationProvider(providerKey: string): boolean {
  const integrationId = PROVIDER_KEY_TO_INTEGRATION_ID[providerKey] ?? providerKey;
  return isBetaIntegration(integrationId);
}
