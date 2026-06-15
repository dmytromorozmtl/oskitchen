/**
 * Cross-channel rewards Era 10 recertification — Evolution Era 10 Cycle 1.
 *
 * Re-validates Era 4/6 dual-ledger honesty: POS kitchen-ledger checkout is certified;
 * storefront uses separate tables; no unified cross-channel E2E until a future era.
 */

export const CROSS_CHANNEL_REWARDS_ERA10_POLICY_ID =
  "era10-cross-channel-rewards-recert-v1" as const;

export const CROSS_CHANNEL_REWARDS_ERA10_EXTENDS_POLICY_ID =
  "era4-cross-channel-rewards-v1" as const;

export const CROSS_CHANNEL_REWARDS_ERA10_GTM_LOCK_ID =
  "era6-dual-ledger-gtm-lock-v1" as const;

/** Certified today — kitchen ledger at POS checkout only. */
export const CROSS_CHANNEL_REWARDS_ERA10_POS_CERTIFIED = [
  "redeemGiftCard",
  "redeemLoyaltyPoints",
  "earnLoyaltyPointsForOrder",
] as const;

/** Honest gaps — not claimed as cross-channel E2E. */
export const CROSS_CHANNEL_REWARDS_ERA10_STOREFRONT_GAPS = [
  "giftCardCheckoutRedeemWired",
  "posCodesValidOnStorefront",
  "storefrontCodesValidOnPos",
] as const;

/** Prisma models proving separate ledgers (must remain distinct). */
export const CROSS_CHANNEL_REWARDS_ERA10_SCHEMA_MODELS = [
  "GiftCard",
  "StorefrontGiftCard",
  "LoyaltyAccount",
  "StorefrontLoyaltyAccount",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA10_CI_SCRIPTS = [
  "test:ci:cross-channel-rewards",
  "test:ci:cross-channel-rewards:cert",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA10_UNIT_TESTS = [
  "tests/unit/cross-channel-rewards-era10-policy.test.ts",
  "tests/unit/cross-channel-rewards-era10-cert-live.test.ts",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA10_CANONICAL_DOC_PATHS = [
  "docs/feature-maturity-matrix.md",
  "docs/product-positioning.md",
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
] as const;

export const CROSS_CHANNEL_REWARDS_ERA10_CANONICAL_MARKERS = [
  CROSS_CHANNEL_REWARDS_ERA10_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA10_EXTENDS_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA10_GTM_LOCK_ID,
  "dual ledger",
] as const;
