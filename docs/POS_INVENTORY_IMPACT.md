# POS — Inventory Impact

## Current implementation

`recordPendingInventoryImpactsForPosOrder` inserts one `PosInventoryImpactEvent` per order line that references a `productId`.

- `status`: `PENDING_CONFIGURATION`
- `note`: Explains POS context and that auto-consumption requires recipes/stock configuration.

## Why placeholders

KitchenOS inventory depth (recipes, depletion policies, alerts) varies by tenant maturity. Writing speculative stock decrements would **fake** availability.

## Next steps

1. Map `PosInventoryImpactEvent` → ingredient usage jobs when `Recipe` + stock on hand exist.
2. Surface warnings in POS terminal when catalog items dip below par levels.
3. Feed demand forecasting from POS velocity separate from channel imports.

Until then, operators should treat POS impact rows as **signals**, not ledger truth.
