# Menu item assignment engine (roadmap)

## Goals

- Assign one product to many menus **or** duplicate-on-assign with lineage metadata.
- Per-menu overrides: price, visibility, max qty, sold out, category/sort, channel availability.

## Integration points

- Menu Center menu detail editor.
- Catalog bulk action “Assign to menu”.
- Planner board drop targets.

## Data model direction

`MenuItemAssignment(menuId, productId, …overrides)` with unique `(menuId, productId)`; keep `Product.menuId` as “home” (catalog or primary menu) until a full migration.
