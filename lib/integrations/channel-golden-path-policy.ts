/**
 * WooCommerce / Shopify golden-path policy — Evolution Era 4 Cycle 5.
 *
 * Certifies the software path: external webhook payload → normalized order →
 * externalOrder row → channel import staging → order hub visibility.
 *
 * Does NOT certify full marketplace live ops, automatic kitchen Order creation,
 * or bidirectional status sync without explicit future cycles.
 */

export const CHANNEL_GOLDEN_PATH_POLICY_ID = "era4-channel-golden-path-v1" as const;

export const CHANNEL_GOLDEN_PATH_PROVIDERS = ["WOOCOMMERCE", "SHOPIFY"] as const;

export type ChannelGoldenPathProvider = (typeof CHANNEL_GOLDEN_PATH_PROVIDERS)[number];

/** Ordered stages exercised by `test:ci:channel-golden-path` (no live store API). */
export const CHANNEL_GOLDEN_PATH_STAGES = [
  "normalize",
  "persist_external_order",
  "stage_channel_import",
  "order_hub_visibility",
] as const;

export type ChannelGoldenPathStage = (typeof CHANNEL_GOLDEN_PATH_STAGES)[number];

/** Honest product/CI claims — do not overstate integration maturity. */
export const CHANNEL_GOLDEN_PATH_HONEST_SCOPE = {
  /** Channel approve links externalOrder; kitchen Order spine is separate (e.g. DoorDash import). */
  kitchenOrderAutoCreateFromWebhook: false,
  externalOrderAndStagingCertified: true,
  orderHubListsExternalOrders: true,
  liveStoreApiOptional: true,
  stagingSmokeScript: "scripts/smoke-woo-shopify-certification.ts",
} as const;

export const CHANNEL_GOLDEN_PATH_WEBHOOK_PROCESSORS = {
  WOOCOMMERCE: "lib/webhooks/woocommerce-webhook-processor.ts",
  SHOPIFY: "lib/webhooks/shopify-webhook-processor.ts",
} as const;

export const CHANNEL_GOLDEN_PATH_CI_SCRIPTS = [
  "test:ci:channel-golden-path",
  "test:ci:channel-golden-path:cert",
] as const;

export const CHANNEL_GOLDEN_PATH_UNIT_TESTS = [
  "tests/unit/channel-golden-path.test.ts",
  "tests/unit/channel-certification.test.ts",
  "tests/unit/webhook-signature-verification.test.ts",
] as const;

export const CHANNEL_GOLDEN_PATH_FIXTURES = {
  woocommerceOrder: "tests/fixtures/channel-golden-path/woo-order-minimal.json",
  shopifyOrder: "tests/fixtures/channel-golden-path/shopify-order-minimal.json",
} as const;
