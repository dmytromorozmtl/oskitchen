# Navigation taxonomy cleanup

## Code

- **`lib/nav-config.ts`:** `ordersSales` → **`commerce`**; title **Commerce**.
- **Removed** `/dashboard/menus` from Commerce (duplicate with **Menus** group).
- **Order of links:** POS Terminal → Order hub → Orders → Storefront → Sales channels.

## Reference

- **`lib/navigation/navigation-taxonomy.ts`:** canonical group ids.
- **`lib/navigation/business-mode-labels.ts`:** `ordersNavLabelForBusinessType` for future command palette / custom labels (terminology overrides still apply via `navLabelForBusinessType`).

## Business-mode labels

- Meal prep / bakery: “Preorders” for `nav.orders` via existing `terminology.ts` overrides.
- Default i18n: “Orders”.

## Recently opened / pins

- No code change: duplicates only if user pinned same href twice — acceptable.
