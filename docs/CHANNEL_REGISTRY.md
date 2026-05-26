# Channel registry

**Source file:** `lib/channels/channel-registry.ts`

Defines every sales / intake **channel** with:

- `providerKey`, labels, descriptions, category, capabilities  
- Honest `isPlaceholder` / `requiresPartnerApproval` flags  
- `mapsToIntegrationProvider` when a row in `integration_connections` backs the channel  
- `setupRoute` and `webhookPathHints` (paths only; prepend `SITE_URL` in UI)

**Runtime merge:** `lib/channels/channel-runtime.ts` combines registry entries with live `IntegrationConnection` rows to produce `effectiveStatus` and `nextAction`.

**Business mode hints:** `channelsRecommendedForBusinessType()` narrows the “Recommended” strip — full catalog always visible in **All channels**.
