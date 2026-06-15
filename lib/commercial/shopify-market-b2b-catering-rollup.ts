export const SHOPIFY_MARKET_B2B_CATERING_ROLLUP_HONESTY =
  "Complete Shopify B2B kitchen orders above the rollup threshold append into a weekly DRAFT catering quote per company — operators review before sending.";

export const DEFAULT_B2B_CATERING_ROLLUP_MIN_TOTAL = 300;

export function isShopifyMarketsB2bCateringRollupEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_CATERING_ROLLUP === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bCateringRollupMinTotal(configured: number | null | undefined): number {
  if (typeof configured === "number" && configured > 0) return configured;
  return DEFAULT_B2B_CATERING_ROLLUP_MIN_TOTAL;
}
