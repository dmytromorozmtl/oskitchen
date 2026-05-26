-- Location Management Center: extend Location, add LocationAssignmentEvent.
-- Strictly additive. Existing rows with locationId=null on other tables remain valid.

-- 1. New enums.
CREATE TYPE "LocationType" AS ENUM (
  'RESTAURANT',
  'CAFE',
  'BAR',
  'BAKERY',
  'CATERING_KITCHEN',
  'COMMISSARY',
  'GHOST_KITCHEN',
  'CLOUD_KITCHEN',
  'PICKUP_POINT',
  'DELIVERY_HUB',
  'WAREHOUSE',
  'EVENT_KITCHEN'
);

CREATE TYPE "LocationStatus" AS ENUM (
  'ACTIVE',
  'SETUP',
  'PAUSED',
  'TEMPORARILY_CLOSED',
  'ARCHIVED'
);

CREATE TYPE "LocationAssignmentTarget" AS ENUM (
  'MENU',
  'MENU_ITEM',
  'ORDER',
  'BRAND',
  'PRODUCTION_BATCH',
  'PRODUCTION_WORK_ITEM',
  'PACKING_BATCH',
  'PACKING_TASK',
  'DELIVERY_ROUTE',
  'INVENTORY_STOCK',
  'PURCHASE_ORDER',
  'KITCHEN_TASK',
  'PROFITABILITY_LINE',
  'CATERING_EVENT'
);

-- 2. Extend "locations" with new columns.
ALTER TABLE "locations"
  ADD COLUMN IF NOT EXISTS "slug" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "type" "LocationType" NOT NULL DEFAULT 'RESTAURANT',
  ADD COLUMN IF NOT EXISTS "status" "LocationStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "phone" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "manager_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "business_hours_json" JSONB,
  ADD COLUMN IF NOT EXISTS "pickup_hours_json" JSONB,
  ADD COLUMN IF NOT EXISTS "delivery_hours_json" JSONB,
  ADD COLUMN IF NOT EXISTS "closures_json" JSONB,
  ADD COLUMN IF NOT EXISTS "fulfillment_settings_json" JSONB,
  ADD COLUMN IF NOT EXISTS "delivery_zones_json" JSONB,
  ADD COLUMN IF NOT EXISTS "capacity_settings_json" JSONB,
  ADD COLUMN IF NOT EXISTS "kitchen_stations_json" JSONB,
  ADD COLUMN IF NOT EXISTS "inventory_settings_json" JSONB,
  ADD COLUMN IF NOT EXISTS "tax_settings_json" JSONB,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "default_brand_id" UUID,
  ADD COLUMN IF NOT EXISTS "default_storefront_id" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "locations_user_id_slug_key" ON "locations"("user_id", "slug");
CREATE INDEX IF NOT EXISTS "locations_user_id_status_idx" ON "locations"("user_id", "status");
CREATE INDEX IF NOT EXISTS "locations_type_idx"           ON "locations"("type");
CREATE INDEX IF NOT EXISTS "locations_timezone_idx"       ON "locations"("timezone");

-- 3. location_assignment_events table.
CREATE TABLE IF NOT EXISTS "location_assignment_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "location_id" UUID,
    "target" "LocationAssignmentTarget" NOT NULL,
    "target_id" UUID NOT NULL,
    "from_location_id" UUID,
    "performed_by" VARCHAR(255),
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "location_assignment_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "location_assignment_events_user_id_created_at_idx"     ON "location_assignment_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "location_assignment_events_location_id_created_at_idx" ON "location_assignment_events"("location_id", "created_at");
CREATE INDEX IF NOT EXISTS "location_assignment_events_target_target_id_idx"       ON "location_assignment_events"("target", "target_id");

ALTER TABLE "location_assignment_events" ADD CONSTRAINT "location_assignment_events_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "location_assignment_events" ADD CONSTRAINT "location_assignment_events_location_id_fkey"
  FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
