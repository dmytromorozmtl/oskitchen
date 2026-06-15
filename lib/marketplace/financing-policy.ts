export const MARKETPLACE_FINANCING_POLICY_ID = "marketplace-financing-v1" as const;

export const MARKETPLACE_FINANCING_PATH = "/dashboard/marketplace/financing" as const;

export const MARKETPLACE_FINANCING_SERVICE = "services/marketplace/financing.ts" as const;

export const MARKETPLACE_NET_TERMS_OPTIONS = [30, 60, 90] as const;

export type MarketplaceNetTermsDays = (typeof MARKETPLACE_NET_TERMS_OPTIONS)[number];

/** Pay within this many days of schedule creation to earn early-payment discount. */
export const MARKETPLACE_EARLY_PAYMENT_WINDOW_DAYS = 10 as const;

export const MARKETPLACE_EARLY_PAYMENT_DISCOUNT_PERCENT = 2 as const;

/** Minimum open net-terms exposure (USD) to surface factoring offers. */
export const MARKETPLACE_FACTORING_MIN_EXPOSURE_USD = 1000 as const;
