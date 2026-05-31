export const SHOPIFY_MARKET_B2B_NET_TERMS_HONESTY =
  "Shopify B2B net terms and PO numbers enrich channel staging and kitchen orders — operators can require PO before approve; no outbound invoice generation.";

export function isShopifyMarketsB2bNetTermsEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_NET_TERMS === "1") return true;
  return process.env.NODE_ENV !== "production";
}
