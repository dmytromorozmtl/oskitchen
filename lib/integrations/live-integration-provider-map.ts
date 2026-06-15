import type { IntegrationProvider } from "@prisma/client";

/** Maps integration registry ids (kebab-case) to Prisma IntegrationProvider. */
export const LIVE_INTEGRATION_ID_TO_PROVIDER: Record<string, IntegrationProvider> = {
  doordash: "DOORDASH",
  skip: "SKIP",
  grubhub: "GRUBHUB",
  woocommerce: "WOOCOMMERCE",
  shopify: "SHOPIFY",
  "uber-eats": "UBER_EATS",
  quickbooks: "QUICKBOOKS",
  xero: "XERO",
  "7shifts": "SEVEN_SHIFTS",
  homebase: "HOMEBASE",
  klaviyo: "KLAVIYO",
  mailchimp: "MAILCHIMP",
  stripe: "STRIPE",
  "square-payments": "SQUARE_PAYMENTS",
  moneris: "MONERIS",
  resy: "RESY",
  opentable: "OPENTABLE",
};

export function providerForLiveIntegrationId(integrationId: string): IntegrationProvider | null {
  return LIVE_INTEGRATION_ID_TO_PROVIDER[integrationId] ?? null;
}
