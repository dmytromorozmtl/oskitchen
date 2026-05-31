export const SHOPIFY_MARKET_B2B_AR_AGING_HONESTY =
  "Open Shopify B2B receivables are bucketed by days past due in Order Hub — operators send manual reminder emails; no automated dunning schedule.";

export function isShopifyMarketsB2bArAgingEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_AR_AGING === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bArReminderEnabled(configured: boolean | null | undefined): boolean {
  return configured !== false;
}
