# Universal Menu Engine

Cycle 8 — single source of truth for menu items across POS, website, commerce, and delivery channels.

## Service

- `services/menu/universal-menu-engine.ts` — `listUniversalMenuItems`, `getUniversalMenuItem`, `updateMenuItem`, `syncMenuItemToAllChannels`
- `services/menu/universal-menu-push.ts` — channel push orchestration (internal + Shopify + delivery stubs)
- `lib/menu/universal-menu-types.ts` — `UniversalMenuItem`, `MenuChannel`, sync status types
- `lib/menu/universal-menu-builders.ts` — override merge, effective channel payload, health summary
- `lib/menu/universal-menu-storage.ts` — persists overrides in `settingsCenterJson.universalMenu`

## Channels

| Channel | Type | Push behavior (v1) |
|---------|------|-------------------|
| `pos` | Internal | Updates `Product` title/price/visibility |
| `website` | Internal | Updates storefront fields + revalidates catalog |
| `kiosk` | Internal | Shares POS visibility for kiosk terminals |
| `shopify` | External | `services/menu/sync/shopify-sync.ts` — Shopify catalog push when mapped |
| `uberEats` | External | `services/menu/sync/uber-eats-sync.ts` — item-level Uber Menu API |
| `doordash` | External | `services/menu/sync/doordash-sync.ts` — item-level DoorDash Menu API |
| `grubhub` | External | `services/menu/sync/grubhub-sync.ts` — item-level Grubhub Menu API |

Channel adapters are registered in `services/menu/sync/index.ts` and invoked by `universal-menu-push.ts`.

## API

```typescript
await updateMenuItem(workspaceId, productId, {
  master: { title: "Deluxe Burger", price: 13.5 },
  channelOverrides: {
    uberEats: { price: 15.99, externalId: "ue-123" },
    website: { description: "Chef special" },
  },
  pushToChannels: true, // default
});
```

Returns `UniversalMenuUpdateResult` with per-channel `pushOutcomes` and persisted `syncStatus`.

## Sync status

- `synced` — last push succeeded
- `pending` — queued or awaiting mapping / adapter
- `error` — integration connected but push failed
- `disconnected` — no integration connection
- `skipped` — channel not applicable

## Tests

- `tests/unit/universal-menu-builders.test.ts`
- `tests/integration/universal-menu-engine.integration.test.ts`

- `tests/unit/channel-sync-registry.test.ts`
- `tests/integration/menu-channel-sync.integration.test.ts`

## Next cycle

~~Cycle 9 — channel sync adapters~~ — done

~~Cycle 10 — Universal Menu UI~~ — done

Cycle 11 — `services/ai/food-cost-ai.ts`
