export const SHOPIFY_MARKET_B2B_AR_DASHBOARD_HONESTY =
  "Consolidated B2B receivables command center — aging buckets, company rollups, bulk reminders and pay links; Shopify payment status is read-only mirror when captured at import.";

export const B2B_AR_DASHBOARD_BULK_MAX = 25;

export function isShopifyMarketsB2bArDashboardEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_AR_DASHBOARD === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bArDashboardEnabled(configured: boolean | null | undefined): boolean {
  return configured !== false;
}
