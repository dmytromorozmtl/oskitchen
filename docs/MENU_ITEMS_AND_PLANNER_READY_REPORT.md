# Menu items & menu planner — ready report

**Date:** 2026-05-07 (workspace session)

## What changed

1. **`Menu.catalogOnly`** — Boolean flag + index; migration clears any storefront `active_menu_id` pointing at a catalog menu.
2. **`ensureCatalogMenu`** — Per-user internal “Item library” menu so `Product.menuId` stays valid without a service menu.
3. **`/dashboard/products`** — No “create weekly menu first” gate; universal intro; business-mode titles and empty states; `ProductManager` shows a **Catalog** tab plus service menus; card/table/compact views; ingredients in search; `router.refresh` after mutations.
4. **`/dashboard/products/new`** — Stub wizard page linking back to catalog.
5. **Menu Center / storefront admin** — Catalog menus filtered out of listings and pickers; storefront empty copy refers to “service menu”.
6. **Menu planner** — Strategy-aware title; tabbed workspace skeleton; service menus only; checklist empty state.
7. **Guards** — Delete menu, duplicate menu (blocked for catalog), storefront save, public storefront loader, storefront checkout, reminder emails, operational “active menu” queries exclude or reject catalog misuse.
8. **Plan limits** — `countMenusForUser` excludes the catalog menu so starter caps apply to service menus only.
9. **Import** — Product CSV import targets active **service** menu or falls back to catalog.
10. **`lib/menu-items/*`** — Types, terminology, availability shapes, validation helpers.
11. **Documentation** — Audit + architecture suite under `docs/MENU_*`.

## Item types supported (application layer)

Strings in `lib/menu-items/item-types.ts` (persistence on `Product` is a follow-up).

## Planner views supported

Tab UI: Calendar, Timeline, Board, Strategy, Coverage (content mostly roadmap; menu summary cards retained).

## Business modes supported

`BusinessType` drives page titles and empty-state CTAs (restaurant, café, bar, bakery, catering, meal prep, default).

## New routes

- `/dashboard/products/new` (stub wizard)

## Model changes

- `menus.catalog_only` (boolean, default false) + composite index with `user_id`.

## Storefront / production / costing / nutrition / channels

- Storefront: guarded (see `MENU_ITEM_STOREFRONT_INTEGRATION.md`).
- Production: unchanged task creation; documented follow-up for catalog noise.
- Costing / nutrition / channels: integrated via existing `Product` relations; catalog UX filters deferred.

## Remaining limitations

- No `MenuItemAssignment` yet (duplicate products per menu still required).
- Full eight-step wizard and `/dashboard/products/[id]` tabs not built.
- Bulk actions, CSV UI, and modifier system not built.
- Planner tabs are placeholders without live data feeds.

## Recommendations

1. Add `Product.userId` + nullable `menuId` if you want true relational independence from any `Menu` row.
2. Promote `itemType` / `status` to Prisma enums with migrations + backfill.
3. Ship assignment join table before duplicating SKUs at scale.
4. Wire planner Calendar tab to `ProductAvailability` and menu JSON fields.
