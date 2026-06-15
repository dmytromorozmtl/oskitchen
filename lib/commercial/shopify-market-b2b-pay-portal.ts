export const SHOPIFY_MARKET_B2B_PAY_PORTAL_HONESTY =
  "Buyers pay open B2B invoices via a hosted pay link — card checkout when Stripe Connect is configured, otherwise wire/ACH instructions with invoice reference.";

export const DEFAULT_B2B_PAY_PORTAL_TOKEN_TTL_DAYS = 90;

export const B2B_PAY_PORTAL_SYSTEM_ACTOR = "system:b2b-pay-portal";

export function isShopifyMarketsB2bPayPortalEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_PAY_PORTAL === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bPayPortalEnabled(configured: boolean | null | undefined): boolean {
  return configured !== false;
}

export function resolveB2bPayPortalTokenTtlDays(configured: number | null | undefined): number {
  if (typeof configured === "number" && configured >= 7 && configured <= 365) return configured;
  return DEFAULT_B2B_PAY_PORTAL_TOKEN_TTL_DAYS;
}
