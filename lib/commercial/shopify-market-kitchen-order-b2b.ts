export const SHOPIFY_MARKET_KITCHEN_ORDER_B2B_HONESTY =
  "Approved Shopify B2B channel imports promote into kitchen Orders with company, market, and routing metadata on sourceMetadataJson and channelTraceJson.";

export function isShopifyMarketsKitchenOrderB2bEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_KITCHEN_ORDER_B2B === "1") return true;
  return process.env.NODE_ENV !== "production";
}
