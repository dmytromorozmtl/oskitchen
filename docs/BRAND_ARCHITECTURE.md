# Brand architecture

## Principles

1. **Non-breaking evolution:** Nullable foreign keys; no forced backfill.
2. **Workspace ownership:** `Brand.workspaceId` ties brands to the owner’s workspace created on demand.
3. **Operational spine:** Orders, menus, products, storefront, integrations may reference `brandId`; absence means “workspace default / legacy”.
4. **Lifecycle:** `BrandLifecycleStatus` replaces legacy boolean `active`.
5. **Concept taxonomy:** `BrandConceptKind` encodes go-to-market shape (ghost, catering, etc.) distinct from `BusinessType` execution mode.

## Module map (`lib/brands`)

| File | Role |
|------|------|
| `brand-types.ts` | Labels, storage key, context change event name. |
| `brand-helpers.ts` | Slugify, human labels, setup progress heuristic. |
| `brand-permissions.ts` | Future RBAC; superadmin + owner today. |
| `brand-theme.ts` | CSS variable helper for brand colors in UI shells. |
| `brand-routing.ts` | Canonical dashboard paths. |
| `brand-template-defaults.ts` | Template keys → wizard defaults. |

## Context propagation

- **Switcher:** persists UUID or `__all__` in `localStorage`; triggers `router.refresh()` and `BRAND_CONTEXT_CHANGED_EVENT`.
- **Provider:** `BrandContextProvider` mirrors storage for React consumers (filters, future data hooks).

## JSON blobs

- `fulfillmentSettingsJson` — wizard stores `{ storefrontTemplate?, menuStrategy?, salesChannelNotes? }`.
- `productionSettingsJson` — `{ wizardNotes? }`.
- `reportingSettingsJson` — reserved for presets.

## Scalar default IDs

`default_storefront_id` and `default_integration_connection_id` are stored without Prisma relations to avoid invalid one-to-one coupling; enforce integrity in application code when wiring storefront/channel pickers.
