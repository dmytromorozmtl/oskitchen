# KitchenOS FoodOps platform overview

KitchenOS is positioned as **one operating system for food businesses**: orders, menus, production, prep, packing, inventory, purchasing, delivery, reporting, and customer operations in a single workspace.

## Operating modes

Business type on `KitchenSettings` drives:

- **Focused navigation** — less relevant modules are hidden by default; users can reveal all modules from the sidebar.
- **Terminology** — nav labels and dashboard checklist copy adapt (see `lib/terminology.ts`).
- **Dashboard guidance** — mode summary card on the home dashboard (see `lib/business-modes.ts` → `dashboardModeSummaryLines`).

Canonical types: `MEAL_PREP`, `CATERING`, `GHOST_KITCHEN`, `CLOUD_KITCHEN`, `MULTI_BRAND`, `BAKERY`, `RESTAURANT`, `CAFE`, `BAR`, `OTHER`.

## Navigation model

Sidebar groups are defined in `lib/nav-config.ts` (Command, Menu & sales, Kitchen ops, Inventory & cost, Fulfillment, Customers & events, Insights, Admin, Growth & platform). Filtering logic lives in `lib/business-modes.ts` (`getFilteredNavGroups`).

## Super admin

Platform owner (`workspace.moroz@gmail.com` via `PLATFORM_ROOT_EMAIL` / billing bypass) retains **full navigation** without business-mode hiding.

## Honest integration stance

Live sync is implemented where credentials and APIs exist (for example WooCommerce, Shopify, Uber Eats patterns). Third-party cards may show **future** or **placeholder** states — the product must not fabricate connected status or secrets.

## Related documents

- `docs/FOODOPS_FULL_MODULE_AUDIT.md` — module-by-module audit and matrix.
- `docs/BUSINESS_MODES.md` — mode behavior and configuration.
- `docs/MODULE_MATURITY_REPORT.md` — maturity snapshot.
- `docs/FINAL_PLATFORM_QA.md` — QA checklist.
- `docs/FOODOPS_FINAL_READY_REPORT.md` — launch readiness summary.
