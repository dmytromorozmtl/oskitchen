# Theme versioning (draft vs published)

## Strategy (Option B)

Columns on `StorefrontSettings`:

- `themeDraftJson`
- `themePublishedJson`
- `themePublishedAt`
- `themePublishedById` (FK to `users`)

## Behavior

- **Publish** (`services/storefront/storefront-theme-publish-service.ts` + `actions/storefront-theme-publish.ts`) snapshots navigation items, footer blocks, and palette tokens from live rows into `themePublishedJson`, stamps `themePublishedAt`, mirrors into `themeDraftJson` for sync.
- **Public nav/footer** (see `theme-snapshot.ts`): when `themePublishedAt` is set, strangers read snapshot JSON; draft storefront continues to read DB rows.
- **Rollback:** not automated — restore by re-publishing a known-good config (version table remains a future enhancement).

## Checkout

Checkout path always uses **published** token merge (`mergePublishedThemeTokensIntoSettings`) in layout, never draft JSON.
