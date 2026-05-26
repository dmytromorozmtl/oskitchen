# Multi-brand storefront strategy

## Current state

`StorefrontSettings` is primarily **owner user scoped** (`userId` unique) with optional `workspaceId` / `brandId` columns reserved for future expansion.

## UX

- Overview explains **Workspace storefront** scope.
- When a workspace has more than one `Brand` row, an amber callout notes that separate public brands require future multi-storefront support.

## Target model (future, non-breaking prep)

- `workspaceId`, optional `brandId`, optional `locationId`
- `ownerUserId` (merchant of record)
- `storeSlug` unique per workspace (or per brand)
- `customDomain` unique globally

Do not assume these columns are fully enforced in routing until migrations and middleware are extended.
