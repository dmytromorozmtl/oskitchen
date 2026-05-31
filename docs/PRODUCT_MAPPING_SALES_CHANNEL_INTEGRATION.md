# Product mapping ↔ Sales Channels integration

The Sales Channels module (`/dashboard/sales-channels`) is the
source of provider connections and catalog syncs. The workbench
reads from those modules but **does not** trigger external API
calls — every catalog sync still runs from Sales Channels.

## Sales Channels mapping summary

`/dashboard/sales-channels/mapping` now displays four KPI tiles:

- Unmatched external products
- Workbench rows (total `ProductMapping`)
- Approved mappings (`APPROVED + CONFIRMED`)
- "Open mapping workbench" CTA

A `prisma.productMapping.groupBy` on `status` powers the new
"Approved mappings" tile. Counts are workspace-scoped.

## Sync health tab

`/dashboard/product-mapping/health` shows two cards:

1. **Per-provider mapping coverage.** A pivot table aggregated by
   `providerKey` with columns: Unmapped/review, Suggested, Approved,
   Conflicts, Archived.
2. **Connections.** A read-only summary of
   `IntegrationConnection` rows (name, provider, status, last sync,
   last error). The card links to `/dashboard/sales-channels` for
   any provider configuration.

## What the workbench never does

- **Never** fakes a catalog API call. Connections must be set up in
  Sales Channels and provider implementation stays there.
- **Never** writes to `IntegrationConnection`. Even `lastSyncAt` is
  read-only from the workbench's point of view.
- **Never** removes an `ExternalProduct` row. The catalog sync owns
  the lifecycle of that table.

## Provider matrix

| Provider | Catalog sync | Workbench support |
|----------|--------------|--------------------|
| `SHOPIFY` | Sales Channels | full |
| `WOOCOMMERCE` | Sales Channels | full |
| `UBER_EATS` | Sales Channels (placeholder) | full (mapping + modifiers) |
| `UBER_DIRECT` | Sales Channels | full |
| `CSV` | Import Center | full |
| `STOREFRONT` | OS Kitchen storefront orders | full |
| `MANUAL` | Manual workbench entry | full |
| `DOORDASH_PLACEHOLDER` | not implemented | full (mapping only) |
| `CUSTOM` | external CSV / API | full |
