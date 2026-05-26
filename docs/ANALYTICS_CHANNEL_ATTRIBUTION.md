# Channel attribution

## Taxonomy

`STOREFRONT`, `MANUAL`, `WOOCOMMERCE`, `SHOPIFY`, `UBER_EATS`, `UBER_DIRECT`, `OTHER`.

## Resolution rules (`lib/analytics/channel-attribution.ts`)

1. If the order is linked to an external import (`importedFromExternal`),
   credit the source `IntegrationProvider`. `WOOCOMMERCE → WOOCOMMERCE`,
   `SHOPIFY → SHOPIFY`, `UBER_EATS → UBER_EATS`, `UBER_DIRECT → UBER_DIRECT`,
   `MANUAL → MANUAL`. Unknown providers map to `OTHER`.
2. Else if the order is linked to a `storefront_orders` row, credit `STOREFRONT`.
3. Otherwise credit `MANUAL`.

## De-duplication

An `external_orders` row that has been promoted to an internal `orders` row
(`imported_order_id` is set) is counted **once** — via the `orders` side using
rule 1. We never double-add the row from the `external_orders` table.

## Filtering

The filter bar exposes channel chips. When a channel is selected, the
executive overview keeps only that channel's bucket; per-channel pages
keep the full mix so operators can compare.

## Caveats surfaced in the UI

A persistent amber callout reminds operators of the resolution rules, since
attribution depends on the integrity of the import pipeline.
