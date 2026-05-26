# Brand-scoped sales channels

## Goals

- Shopify / Woo / marketplaces mapped to a **default brand** per `IntegrationConnection`.  
- Storefront-native channel inherits brand from storefront row.  
- Import pipelines stamp `Order.brandId` from connection + mapping tables.

## Current state

- Schema supports `IntegrationConnection.brandId` (nullable).  
- Assignment page surfaces **unassigned connection** counts.

## Next steps

- Sales channel list UI: `BrandBadge`, filter by brand, default brand selector on connect.  
- Ingestion: infer brand from connection; if ambiguous, route to review queue (documented in order hub doc).
