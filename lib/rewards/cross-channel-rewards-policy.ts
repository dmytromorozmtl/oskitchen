/**
 * Cross-channel loyalty / gift card honesty policy — Evolution Era 4 Cycle 9.
 *
 * KitchenOS maintains separate kitchen-ledger (POS / order spine) and
 * storefront-ledger rewards systems. Do not claim unified cross-channel balances.
 */

export const CROSS_CHANNEL_REWARDS_POLICY_ID = "era4-cross-channel-rewards-v1" as const;

export type RewardsLedger = "kitchen" | "storefront";

export const KITCHEN_REWARDS_SERVICES = {
  giftCard: "services/gift-cards/gift-card-service.ts",
  loyalty: "services/loyalty/loyalty-service.ts",
  posCheckout: "services/pos/pos-checkout-service.ts",
  orderCreation: "services/orders/order-creation-service.ts",
} as const;

export const STOREFRONT_REWARDS_SERVICES = {
  giftCard: "services/storefront/gift-card-service.ts",
  loyalty: "services/storefront/loyalty-service.ts",
  giftCardBalanceApi: "app/api/storefront/loyalty/balance/route.ts",
  loyaltyRedeemApi: "app/api/storefront/loyalty/redeem/route.ts",
} as const;

/** Certified in CI — POS applies kitchen-ledger gift card + loyalty at checkout. */
export const POS_REWARDS_CHECKOUT_CERTIFIED = {
  giftCardRedeem: true,
  loyaltyRedeem: true,
  loyaltyEarnAfterSale: true,
} as const;

/** Honest storefront scope — separate tables; checkout redeem not unified with POS. */
export const STOREFRONT_REWARDS_HONEST_SCOPE = {
  separateGiftCardTable: true,
  separateLoyaltyTable: true,
  giftCardCheckoutRedeemWired: false,
  posCodesValidOnStorefront: false,
  storefrontCodesValidOnPos: false,
} as const;

export const CROSS_CHANNEL_REWARDS_FORBIDDEN_CLAIMS = [
  /unified\s+(cross[- ]?channel\s+)?(loyalty|gift\s*card)/i,
  /same\s+(gift\s*card|loyalty)\s+(code|balance)\s+(on\s+)?(POS|storefront|online)/i,
  /redeem\s+.*\s+on\s+(POS|storefront)\s+and\s+(POS|storefront)/i,
] as const;

export const CROSS_CHANNEL_REWARDS_CI_SCRIPTS = [
  "test:ci:cross-channel-rewards",
  "test:ci:cross-channel-rewards:cert",
] as const;

export const CROSS_CHANNEL_REWARDS_UNIT_TESTS = [
  "tests/unit/cross-channel-rewards-policy.test.ts",
  "tests/unit/pos-rewards-checkout-wiring.test.ts",
  "tests/unit/storefront-rewards-honesty.test.ts",
] as const;
