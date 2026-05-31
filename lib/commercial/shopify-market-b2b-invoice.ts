export const SHOPIFY_MARKET_B2B_INVOICE_HONESTY =
  "Complete Shopify B2B kitchen orders with net terms receive a DRAFT receivable invoice in KitchenOS — operators mark paid in Order Hub after collecting payment outside Shopify.";

export function isShopifyMarketsB2bInvoiceEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_INVOICE === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bAutoGenerateInvoice(configured: boolean | null | undefined): boolean {
  return configured !== false;
}
