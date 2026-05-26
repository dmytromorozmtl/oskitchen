# Menu strategy architecture

**Code:** `lib/menus/menu-strategies.ts`, `lib/menus/menu-availability.ts`, `lib/menus/menu-terminology.ts`, `lib/menus/menu-publishing.ts`, `lib/menus/menu-templates.ts`

## Prisma enum `MenuStrategy`

`WEEKLY_PREORDER | DAILY_MENU | RESTAURANT_MENU | CAFE_SPECIALS | DRINKS_MENU | BAKERY_PREORDER | CATERING_PACKAGES | EVENT_MENU | SEASONAL_MENU | MULTI_BRAND_MENU`

Each strategy row defines: label, description, supported/recommended business types, default categories/sections, required/optional logical fields (as strings), storefront/production/fulfillment/reporting narratives, empty-state copy, CTAs, warnings.

## JSON columns on `Menu`

| Column | Purpose |
|--------|---------|
| `preparedDatesJson` | Meal prep / catering prepared-date hints |
| `availabilityJson` | Dayparts, happy hour, DOW windows |
| `fulfillmentRulesJson` | Quote-default, pickup slots, lead times |
| `displaySettingsJson` | Template + default category hints |
| `storefrontSettingsJson` | Future per-menu storefront overrides |

## Distinction vs `business-mode-registry.ts`

`MenuStrategyId` in the business-mode registry is a **product configuration** slug for onboarding defaults. **Prisma `MenuStrategy`** is persisted per menu row. Names intentionally align where possible (`WEEKLY_PREORDER`, …); catering uses **`CATERING_PACKAGES`** in Prisma vs `CATERING_MENU` in the older registry type — treat them as related but not identical enums.

## Publishing

Checkout still uses `StorefrontSettings.activeMenuId`. `Menu.published` is an **owner flag** for marketing/readiness until deeper snapshot UX ships. Historical snapshots remain in `StorefrontMenuPublish`.
