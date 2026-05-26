# Menu Center ready report

**Date:** 2026-05-07

## What changed

- **Prisma:** `MenuStrategy` enum; `Menu` fields `description`, `strategy`, `published`, five JSON blobs; index `(userId, strategy)`. Migration `20260516120000_menu_center_strategy`.  
- **Libraries:** `lib/menus/*` strategies, terminology, availability helpers, publishing helper, templates.  
- **Actions:** `createMenu` accepts optional `strategy`/`description`; `createMenuFromWizard`; `applyMenuTemplate` (redirect); duplicate copies new fields with `Prisma.InputJsonValue` casts.  
- **UI:** `MenuCenter` replaces narrow board — summary cards, filters, card/table views, business-mode copy, storefront hint, links to planner/templates/new menu.  
- **Routes:** `/dashboard/menus/new`, `/dashboard/menus/templates`, `/dashboard/menus/[menuId]`, `/dashboard/menus/[menuId]/reports` (stub).  
- **Compat:** `menu-board.tsx` re-exports `MenuCenter` as `MenuBoard`.

## Strategies supported

All ten Prisma enum values — definitions in `menu-strategies.ts`.

## Business modes

Copy via `menu-terminology.ts`; default strategy via `defaultMenuStrategyForBusinessType`.

## Storefront / production

No breaking changes to checkout or production tasks; strategy is additive metadata plus JSON placeholders.

## Remaining limitations

- No `MenuCategory` / `MenuItemAssignment` tables yet (products remain canonical line items).  
- Wizard is **3 steps** (strategy, basics, review); extended steps are roadmap.  
- Detail tabs beyond overview are placeholders.  
- Reporting page stub only.

## Next recommendations

1. Wire `StorefrontMenuPublish` snapshot pipeline per publish click.  
2. Product-level strategy fields (ABV, lead time) behind feature flags.  
3. Prisma categories join or `Product.menuCategoryId` when ready.

## Verification

`npm run typecheck` and `npm run build` succeed.
