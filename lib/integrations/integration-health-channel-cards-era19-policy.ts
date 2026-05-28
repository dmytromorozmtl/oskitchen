/**
 * Integration Health channel cards — Evolution Era 19 Workstream D Cycle 8.
 */

export const INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID =
  "era19-integration-health-channel-cards-v1" as const;

export const INTEGRATION_HEALTH_CHANNEL_CARDS_ANCHOR =
  "#integration-channel-readiness" as const;

export const INTEGRATION_HEALTH_CHANNEL_CARD_IDS = [
  "stripe",
  "woocommerce",
  "shopify",
  "webhooks",
  "public-api",
  "sso",
] as const;

export type IntegrationHealthChannelCardId =
  (typeof INTEGRATION_HEALTH_CHANNEL_CARD_IDS)[number];
