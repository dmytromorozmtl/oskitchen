-- FulfillmentType for orders
CREATE TYPE "FulfillmentType" AS ENUM ('PICKUP', 'DELIVERY');

-- ProductCategory for products
CREATE TYPE "ProductCategory" AS ENUM ('MAINS', 'SIDES', 'BAKERY', 'BEVERAGES', 'BREAKFAST', 'OTHER');

-- Notification types
CREATE TYPE "NotificationType" AS ENUM (
  'ORDER_CONFIRMATION',
  'PREORDER_REMINDER',
  'PICKUP_REMINDER',
  'DELIVERY_REMINDER',
  'ORDER_READY',
  'CRON_REMINDER'
);

-- Orders: fulfillment, phone, timestamps; retire delivery_requested
ALTER TABLE "orders" ADD COLUMN "fulfillment_type" "FulfillmentType";
UPDATE "orders" SET "fulfillment_type" = CASE WHEN "delivery_requested" = true THEN 'DELIVERY'::"FulfillmentType" ELSE 'PICKUP'::"FulfillmentType" END;
ALTER TABLE "orders" ALTER COLUMN "fulfillment_type" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "fulfillment_type" SET DEFAULT 'PICKUP'::"FulfillmentType";

ALTER TABLE "orders" ADD COLUMN "customer_phone" TEXT;
ALTER TABLE "orders" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "orders" DROP COLUMN "delivery_requested";

-- Products: extend schema + enum category
ALTER TABLE "products" RENAME COLUMN "category" TO "category_legacy";

ALTER TABLE "products" ADD COLUMN "category" "ProductCategory" NOT NULL DEFAULT 'OTHER';

UPDATE "products" SET "category" = CASE
  WHEN "category_legacy" IS NULL THEN 'OTHER'::"ProductCategory"
  WHEN lower("category_legacy") LIKE '%bakery%' THEN 'BAKERY'::"ProductCategory"
  WHEN lower("category_legacy") LIKE '%beverage%' OR lower("category_legacy") LIKE '%drink%' THEN 'BEVERAGES'::"ProductCategory"
  WHEN lower("category_legacy") LIKE '%side%' THEN 'SIDES'::"ProductCategory"
  WHEN lower("category_legacy") LIKE '%breakfast%' OR lower("category_legacy") LIKE '%brunch%' THEN 'BREAKFAST'::"ProductCategory"
  WHEN lower("category_legacy") LIKE '%main%' OR lower("category_legacy") LIKE '%entr%' THEN 'MAINS'::"ProductCategory"
  ELSE 'OTHER'::"ProductCategory"
END;

ALTER TABLE "products" DROP COLUMN "category_legacy";

UPDATE "products" SET "prepared_date" = ("created_at" AT TIME ZONE 'UTC')::date WHERE "prepared_date" IS NULL;
ALTER TABLE "products" ALTER COLUMN "prepared_date" SET NOT NULL;

ALTER TABLE "products" ADD COLUMN "allergens" TEXT;
ALTER TABLE "products" ADD COLUMN "ingredients" TEXT;
ALTER TABLE "products" ADD COLUMN "portion_size" TEXT;
ALTER TABLE "products" ADD COLUMN "reheating_instructions" TEXT;
ALTER TABLE "products" ADD COLUMN "kitchen_notes" TEXT;
ALTER TABLE "products" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Menus
ALTER TABLE "menus" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Kitchen settings
ALTER TABLE "kitchen_settings" ADD COLUMN "delivery_radius_km" INTEGER;
ALTER TABLE "kitchen_settings" ADD COLUMN "delivery_fee" DECIMAL(10, 2);
ALTER TABLE "kitchen_settings" ADD COLUMN "order_cutoff_time" TEXT;
ALTER TABLE "kitchen_settings" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- Notification log (dedupe cron / emails)
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "order_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_logs_dedupe_key_key" ON "notification_logs"("dedupe_key");
CREATE INDEX "notification_logs_user_id_created_at_idx" ON "notification_logs"("user_id", "created_at");

ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS "menus_user_id_idx" ON "menus"("user_id");
CREATE INDEX IF NOT EXISTS "menus_user_id_created_at_idx" ON "menus"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "orders_user_id_status_idx" ON "orders"("user_id", "status");
CREATE INDEX IF NOT EXISTS "products_menu_id_idx" ON "products"("menu_id");
CREATE INDEX IF NOT EXISTS "products_menu_id_sort_order_idx" ON "products"("menu_id", "sort_order");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_items_product_id_idx" ON "order_items"("product_id");
