# Menu strategies (registry)

Strategies describe **how** menus behave for storefront, production, and reporting — without removing existing weekly menu mechanics.

## Enum (target)

- `WEEKLY_PREORDER` — current default meal-prep style windows.  
- `DAILY_MENU` — daypart availability.  
- `SEASONAL_MENU` — date-bounded sets.  
- `EVENT_MENU` — tied to calendar / catering.  
- `CATERING_MENU` — quote-driven packages.  
- `DRINKS_MENU` — bar-forward modifiers.  
- `BAKERY_PREORDER` — waves / pickup slots.  
- `SPECIALS_MENU` — café daily board.

## Controlled dimensions

Availability rules, storefront layout hints, order flow labels, production staging language, label templates, report groupings, and **terminology** overrides (`lib/terminology.ts`).

## Code touchpoints (incremental)

`Menu` model metadata JSON or `menuStrategy` column; Weekly Menus / Menu Planner / Menu Items UIs read the strategy for labels only until logic unifies.
