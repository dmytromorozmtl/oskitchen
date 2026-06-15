export const SHOPIFY_MARKET_B2B_CONSOLIDATED_PAY_HONESTY =
  "Pay multiple open B2B invoices in one Stripe Checkout session — same Connect account as single-invoice pay portal; all selected invoices mark paid when checkout completes.";

/** Max invoices per consolidated pay link. */
export const B2B_CONSOLIDATED_PAY_MAX_INVOICES = 10;

/** Min invoices required to mint a consolidated link (use single pay link for one). */
export const B2B_CONSOLIDATED_PAY_MIN_INVOICES = 2;

export const DEFAULT_B2B_CONSOLIDATED_PAY_TOKEN_TTL_DAYS = 90;

/** Stale checkout attention threshold (ms). */
export const B2B_CONSOLIDATED_PAY_STALE_CHECKOUT_MS = 48 * 60 * 60 * 1000;

export function isShopifyMarketsB2bConsolidatedPayEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_CONSOLIDATED_PAY === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bConsolidatedPayEnabled(configured: boolean | null | undefined): boolean {
  return configured !== false;
}

export function resolveB2bConsolidatedPayTokenTtlDays(configured: number | null | undefined): number {
  if (typeof configured === "number" && configured >= 7 && configured <= 365) return configured;
  return DEFAULT_B2B_CONSOLIDATED_PAY_TOKEN_TTL_DAYS;
}
