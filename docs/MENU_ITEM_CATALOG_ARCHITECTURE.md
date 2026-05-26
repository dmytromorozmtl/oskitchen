# Menu item catalog architecture

## Principles

1. **Library first:** Every workspace has an internal `Menu` with `catalogOnly=true` (“Item library”) created by `ensureCatalogMenu`. Products always have a valid `menuId` without forcing the operator to author a guest-facing menu first.
2. **Service menus second:** Weekly preorder, restaurant cycles, catering events, and storefront checkout continue to use normal menus (`catalogOnly=false`).
3. **No silent storefront coupling:** The catalog menu cannot be selected as `StorefrontSettings.activeMenuId`. Public loaders strip a catalog active menu if misconfigured.

## Code map

| Piece | Role |
|-------|------|
| `lib/products/ensure-catalog-menu.ts` | Idempotent catalog menu creation |
| `lib/menu-items/item-types.ts` | Forward-looking enums (not all persisted yet) |
| `lib/menu-items/item-terminology.ts` | `BusinessType` → UI titles and empty states |
| `lib/menu-items/item-availability.ts` | JSON shapes for windows / ranges |
| `lib/menu-items/item-validation.ts` | SKU/slug/image URL helpers |
| `components/dashboard/product-manager.tsx` | Catalog + per-menu tabs, views |
| `lib/storefront/public-access.ts` | Runtime guard for catalog as active menu |

## Next database evolution (non-breaking)

- Optional `Product.itemType`, `Product.status`, typed JSON blobs (`availabilityJson`, `channelAvailabilityJson`, …) as outlined in the product spec.
- `MenuItemAssignment` when an item must appear on multiple menus without duplicating `Product` rows.

See also: `MENU_ITEM_TYPES.md`, `MENU_ITEM_ASSIGNMENT_ENGINE.md`.
