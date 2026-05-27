# POS — Inventory Impact

## Current implementation

`recordPendingInventoryImpactsForPosOrder` inserts one `PosInventoryImpactEvent` per order line that references a `productId`, then calls `applyRecipeDepletionForPosLine`.

| Status | Meaning |
| --- | --- |
| `PENDING_CONFIGURATION` | No active recipe for the product, or recipe could not update scoped ingredients. |
| `APPLIED` | Active recipe found; ingredient `currentStock` decremented per recipe lines (yield + waste %). |

Audit: `inventory.pos_depletion_applied` when depletion succeeds.

## Safety

- No recipe → no stock write (impact row stays pending).
- Ingredient updates are owner/workspace scoped; unmatched rows are skipped.
- Sub-recipes and modifier recipes are not expanded in this slice.

## Next steps

1. Surface pending vs applied impacts in POS / inventory diagnostics.
2. Par-level warnings on POS terminal.
3. Storefront and non-POS channels sharing the same depletion service.
4. Sub-recipe and modifier recipe expansion.
