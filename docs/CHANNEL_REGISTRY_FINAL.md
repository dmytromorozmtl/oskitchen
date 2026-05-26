# Channel registry (final)

## Source of truth

- **Catalog entries:** `lib/channels/channel-registry.ts` → `CHANNEL_DEFINITIONS`
- **Enriched rows (UI + docs):** `CHANNEL_REGISTRY_ENTRIES` = definitions passed through `lib/channels/enrich-channel-registry-entry.ts`
- **Types:** `lib/channels/channel-types.ts`
- **Capability labels:** `lib/channels/channel-capabilities.ts`
- **Support badges:** `lib/channels/channel-status.ts`
- **Credential permissions:** `lib/channels/channel-permissions.ts`
- **Runtime merge with DB:** `lib/channels/channel-runtime.ts` (`resolveAllChannels`)

## Rules

1. Every public channel must appear in `CHANNEL_DEFINITIONS` exactly once (`providerKey` unique).
2. Do not mark partner placeholders as “live” — use `supportLevel` + `effectiveStatus` from runtime.
3. Webhook paths in `webhookPathHints` / `webhookRoutes` must match real `app/api/webhooks/*` routes.
4. `mapsToIntegrationProvider` is `null` for native/roadmap channels without a connection row.

## Categories

Operator-facing `hubCategory` values are assigned in the enricher (storefront, ecommerce, marketplace, POS, etc.) and may differ from the internal `category` enum used for filtering code.
