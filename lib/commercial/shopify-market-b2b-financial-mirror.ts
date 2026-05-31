export const SHOPIFY_MARKET_B2B_FINANCIAL_MIRROR_HONESTY =
  "Read-only Shopify displayFinancialStatus captured at B2B channel promote and refreshed on full reconcile — highlights KitchenOS vs Shopify payment drift without writing back to Shopify.";

/** Max open B2B invoices refreshed per full reconcile (read-only Admin API). */
export const B2B_FINANCIAL_MIRROR_REFRESH_CAP = 50;

export function isShopifyMarketsB2bFinancialMirrorEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_SHOPIFY_FINANCIAL_MIRROR === "1") return true;
  return process.env.NODE_ENV !== "production";
}
