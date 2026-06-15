-- Menu Center: strategy + metadata columns (non-destructive; existing rows default to WEEKLY_PREORDER).

CREATE TYPE "MenuStrategy" AS ENUM (
  'WEEKLY_PREORDER',
  'DAILY_MENU',
  'RESTAURANT_MENU',
  'CAFE_SPECIALS',
  'DRINKS_MENU',
  'BAKERY_PREORDER',
  'CATERING_PACKAGES',
  'EVENT_MENU',
  'SEASONAL_MENU',
  'MULTI_BRAND_MENU'
);

ALTER TABLE "menus" ADD COLUMN "description" TEXT;
ALTER TABLE "menus" ADD COLUMN "strategy" "MenuStrategy" NOT NULL DEFAULT 'WEEKLY_PREORDER';
ALTER TABLE "menus" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "menus" ADD COLUMN "prepared_dates_json" JSONB;
ALTER TABLE "menus" ADD COLUMN "availability_json" JSONB;
ALTER TABLE "menus" ADD COLUMN "fulfillment_rules_json" JSONB;
ALTER TABLE "menus" ADD COLUMN "display_settings_json" JSONB;
ALTER TABLE "menus" ADD COLUMN "storefront_settings_json" JSONB;

CREATE INDEX "menus_user_id_strategy_idx" ON "menus" ("user_id", "strategy");
