import type { ProductMappingProvider } from "@prisma/client";

export type ProductMappingProviderKey = ProductMappingProvider;

export const PRODUCT_MAPPING_PROVIDERS: ProductMappingProvider[] = [
  "SHOPIFY",
  "WOOCOMMERCE",
  "UBER_EATS",
  "UBER_DIRECT",
  "CSV",
  "STOREFRONT",
  "MANUAL",
  "DOORDASH_PLACEHOLDER",
  "CUSTOM",
];

export const PRODUCT_MAPPING_PROVIDER_LABEL: Record<ProductMappingProvider, string> = {
  SHOPIFY: "Shopify",
  WOOCOMMERCE: "WooCommerce",
  UBER_EATS: "Uber Eats",
  UBER_DIRECT: "Uber Direct",
  CSV: "CSV import",
  STOREFRONT: "Storefront",
  MANUAL: "Manual entry",
  DOORDASH_PLACEHOLDER: "DoorDash (placeholder)",
  CUSTOM: "Custom",
};

/**
 * Maps free-text legacy `ProductMapping.provider` values onto the
 * normalised `ProductMappingProvider` enum where it can.
 */
export function normalizeProviderKey(value: string | null | undefined): ProductMappingProvider {
  if (!value) return "CUSTOM";
  const upper = value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  switch (upper) {
    case "SHOPIFY":
      return "SHOPIFY";
    case "WOOCOMMERCE":
    case "WOO":
    case "WOO_COMMERCE":
      return "WOOCOMMERCE";
    case "UBER_EATS":
    case "UBEREATS":
      return "UBER_EATS";
    case "UBER_DIRECT":
    case "UBERDIRECT":
      return "UBER_DIRECT";
    case "CSV":
      return "CSV";
    case "STOREFRONT":
      return "STOREFRONT";
    case "MANUAL":
      return "MANUAL";
    case "DOORDASH":
    case "DOORDASH_PLACEHOLDER":
      return "DOORDASH_PLACEHOLDER";
    default:
      return "CUSTOM";
  }
}

export function providerLabel(value: ProductMappingProvider | null | undefined, fallback?: string): string {
  if (!value) return fallback ?? "Unknown";
  return PRODUCT_MAPPING_PROVIDER_LABEL[value] ?? value;
}
