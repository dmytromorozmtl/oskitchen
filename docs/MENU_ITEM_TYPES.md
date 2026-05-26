# Menu item types

Canonical string unions live in `lib/menu-items/item-types.ts`:

- FOOD, BEVERAGE, ALCOHOLIC_BEVERAGE, BAKERY, CATERING_PACKAGE, MEAL_PREP_MEAL, ADD_ON, MODIFIER, SERVICE, EVENT_PACKAGE, RETAIL_ITEM

Statuses (target schema): DRAFT, ACTIVE, INACTIVE, SOLD_OUT, ARCHIVED.

Visibility (target): INTERNAL_ONLY, STOREFRONT_VISIBLE, SALES_CHANNELS_VISIBLE, PRODUCTION_ONLY, QUOTE_ONLY.

**Today:** the Prisma `Product` model still uses `ProductCategory` for coarse classification. Migrate to `itemType` when adding columns and backfill from `ProductCategory` + `BusinessType`.
