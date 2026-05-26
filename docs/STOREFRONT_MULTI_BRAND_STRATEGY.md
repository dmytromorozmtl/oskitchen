# Storefront multi-brand strategy

## Current state

- `StorefrontSettings` is keyed primarily by **owner `userId`** (workspace merchant).
- Optional `workspaceId` / `brandId` fields exist in Prisma for forward compatibility, but public routing still resolves by `storeSlug` and owner configuration.

## Recommendation

- Short term: **one published storefront per merchant workspace** unless operations explicitly maintain multiple slugs/brands manually.
- Medium term: migrate to `workspaceId` + optional `brandId` / `locationId` with uniqueness constraints on `(workspaceId, brandId, locationId)` and `slug`.

## UI

- When multiple brands exist under one login, show a warning in storefront overview (planned) — not automated in this pass to avoid false positives without brand directory context.
