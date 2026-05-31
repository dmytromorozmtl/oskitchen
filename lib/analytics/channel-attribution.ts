import type { IntegrationProvider } from "@prisma/client";

/**
 * Unified analytics channel taxonomy. Inferred from `Order` and
 * `ExternalOrder` join data. We deliberately fold in legacy/manual
 * flows so the dashboard always has a row to display.
 */
export type AnalyticsChannel =
  | "STOREFRONT"
  | "MANUAL"
  | "WOOCOMMERCE"
  | "SHOPIFY"
  | "DOORDASH"
  | "UBER_EATS"
  | "GRUBHUB"
  | "UBER_DIRECT"
  | "OTHER";

export const ANALYTICS_CHANNEL_VALUES: AnalyticsChannel[] = [
  "STOREFRONT",
  "MANUAL",
  "WOOCOMMERCE",
  "SHOPIFY",
  "DOORDASH",
  "UBER_EATS",
  "GRUBHUB",
  "UBER_DIRECT",
  "OTHER",
];

export const ANALYTICS_CHANNEL_LABEL: Record<AnalyticsChannel, string> = {
  STOREFRONT: "OS Kitchen Storefront",
  MANUAL: "Manual / Phone",
  WOOCOMMERCE: "WooCommerce",
  SHOPIFY: "Shopify",
  DOORDASH: "DoorDash",
  UBER_EATS: "Uber Eats",
  GRUBHUB: "Grubhub",
  UBER_DIRECT: "Uber Direct",
  OTHER: "Other",
};

export function channelFromProvider(provider: IntegrationProvider | null | undefined): AnalyticsChannel {
  switch (provider) {
    case "WOOCOMMERCE":
      return "WOOCOMMERCE";
    case "SHOPIFY":
      return "SHOPIFY";
    case "DOORDASH":
      return "DOORDASH";
    case "UBER_EATS":
      return "UBER_EATS";
    case "GRUBHUB":
      return "GRUBHUB";
    case "UBER_DIRECT":
      return "UBER_DIRECT";
    case "MANUAL":
      return "MANUAL";
    default:
      return "OTHER";
  }
}

/**
 * Resolve the channel for a regular order row. We treat an order with
 * an `importedFromExternal` join as the channel of its origin; an order
 * with a `storefrontOrder` join as STOREFRONT; otherwise MANUAL.
 */
export type OrderChannelInputs = {
  storefrontOrderId?: string | null;
  importedFromProvider?: IntegrationProvider | null;
};

export function channelForOrder(inputs: OrderChannelInputs): AnalyticsChannel {
  if (inputs.importedFromProvider) return channelFromProvider(inputs.importedFromProvider);
  if (inputs.storefrontOrderId) return "STOREFRONT";
  return "MANUAL";
}
