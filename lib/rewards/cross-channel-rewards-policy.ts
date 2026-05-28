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

/**
 * Era 6 Cycle 1 — permanent product decision: maintain dual ledgers until a future
 * era ships unified schema, migration, idempotency, and cert gates. Sales/GTM must
 * not imply interchangeable gift cards or loyalty balances across channels.
 */
export const CROSS_CHANNEL_REWARDS_GTM_LOCK_ID = "era6-dual-ledger-gtm-lock-v1" as const;

export const CROSS_CHANNEL_REWARDS_UNIFICATION_STATUS = "deferred_locked" as const;

/** Safe for sales/GTM when describing cross-channel rewards interchangeability. */
export const CROSS_CHANNEL_REWARDS_UNIFIED_CLAIM_ALLOWED = false;

export const CROSS_CHANNEL_REWARDS_GTM_POLICY_SUMMARY =
  "Gift cards and loyalty use separate kitchen (POS) and storefront ledgers. Codes and balances are not interchangeable across channels until a future era certifies unification.";

/**
 * Phrases that must not appear in canonical GTM docs without explicit negation —
 * enforced by `test:ci:cross-channel-rewards:cert`.
 */
export const CROSS_CHANNEL_REWARDS_FORBIDDEN_GTM_PHRASES = [
  "unified cross-channel loyalty",
  "unified cross-channel gift",
  "single rewards ledger",
  "same gift card on POS and storefront",
  "loyalty works online and POS interchangeably",
  "redeem anywhere across channels",
] as const;

export const CROSS_CHANNEL_REWARDS_GTM_REQUIRED_MARKERS = [
  CROSS_CHANNEL_REWARDS_POLICY_ID,
  CROSS_CHANNEL_REWARDS_GTM_LOCK_ID,
  "dual ledger",
] as const;

export const CROSS_CHANNEL_REWARDS_GTM_DOCS = [
  "docs/product-positioning.md",
  "docs/feature-maturity-matrix.md",
  "docs/competitor-feature-gap-matrix.md",
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
