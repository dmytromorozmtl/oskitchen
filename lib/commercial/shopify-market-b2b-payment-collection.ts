export const SHOPIFY_MARKET_B2B_PAYMENT_COLLECTION_HONESTY =
  "Operators mark B2B net-terms invoice drafts paid in Order Hub after collecting payment outside Shopify — no Stripe charge or Shopify write-back.";

export const DEFAULT_B2B_INVOICE_OVERDUE_GRACE_DAYS = 0;

export function isShopifyMarketsB2bPaymentCollectionEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_PAYMENT_COLLECTION === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bInvoiceOverdueGraceDays(configured: number | null | undefined): number {
  if (typeof configured === "number" && configured >= 0) return configured;
  return DEFAULT_B2B_INVOICE_OVERDUE_GRACE_DAYS;
}
