/**
 * Canonical marketplace placeholder honesty — aligned with
 * `lib/integrations/integration-registry.ts`, `lib/channels/channel-registry.ts`,
 * and `docs/feature-maturity-matrix.md`.
 */
export const MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS = [
  "grubhub",
  "uber-direct",
] as const;

export type MarketplacePlaceholderIntegrationId =
  (typeof MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS)[number];

/** Channel catalog provider keys that must never appear as live connectors. */
export const MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS = [
  "grubhub",
  "uber-direct",
] as const;

export type MarketplacePlaceholderProviderKey =
  (typeof MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS)[number];

const INTEGRATION_PAGE_BY_ID: Partial<Record<MarketplacePlaceholderIntegrationId, string>> = {
  grubhub: "/dashboard/integrations/grubhub",
  "uber-direct": "/dashboard/integrations/uber-direct",
};

export function isMarketplacePlaceholderIntegration(
  id: string,
): id is MarketplacePlaceholderIntegrationId {
  return (MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS as readonly string[]).includes(id);
}

export function isMarketplacePlaceholderProvider(
  providerKey: string,
): providerKey is MarketplacePlaceholderProviderKey {
  return (MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS as readonly string[]).includes(providerKey);
}

export function marketplacePlaceholderIntegrationPage(
  id: MarketplacePlaceholderIntegrationId,
): string {
  return INTEGRATION_PAGE_BY_ID[id] ?? `/dashboard/integrations/${id}`;
}

export function marketplacePlaceholderHonestyLabel(): string {
  return "Placeholder";
}
