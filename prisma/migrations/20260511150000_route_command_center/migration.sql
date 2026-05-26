-- Route Command Center: extend route + stop schemas, add zone, driver, event models.

-- Extend existing enums (additive only).
ALTER TYPE "DeliveryRouteStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "DeliveryRouteStatus" ADD VALUE IF NOT EXISTS 'PACKING';
ALTER TYPE "DeliveryRouteStatus" ADD VALUE IF NOT EXISTS 'READY';
ALTER TYPE "DeliveryRouteStatus" ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY';
ALTER TYPE "DeliveryRouteStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_COMPLETED';
ALTER TYPE "DeliveryRouteStatus" ADD VALUE IF NOT EXISTS 'FAILED';

ALTER TYPE "DeliveryStopStatus" ADD VALUE IF NOT EXISTS 'PACKED';
ALTER TYPE "DeliveryStopStatus" ADD VALUE IF NOT EXISTS 'READY';
ALTER TYPE "DeliveryStopStatus" ADD VALUE IF NOT EXISTS 'LOADED';
ALTER TYPE "DeliveryStopStatus" ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY';
ALTER TYPE "DeliveryStopStatus" ADD VALUE IF NOT EXISTS 'RETURNED';

-- New enums.
CREATE TYPE "DeliveryRouteMode" AS ENUM (
  'MEAL_PREP_DELIVERY',
  'CATERING_DELIVERY',
  'BAKERY_DELIVERY',
  'CAFE_DELIVERY',
  'RESTAURANT_DELIVERY',
  'EVENT_DELIVERY',
  'GHOST_KITCHEN_DELIVERY',
  'PICKUP_HANDOFF',
  'UBER_DIRECT_DISPATCH_PLACEHOLDER'
);

CREATE TYPE "DeliveryEventType" AS ENUM (
  'ROUTE_CREATED',
  'ROUTE_UPDATED',
  'ROUTE_ASSIGNED',
  'ROUTE_COMPLETED',
  'ROUTE_CANCELLED',
  'STOP_ADDED',
  'STOP_REORDERED',
  'STOP_MOVED',
  'STOP_LOADED',
  'STOP_OUT_FOR_DELIVERY',
  'STOP_DELIVERED',
  'STOP_FAILED',
  'STOP_RETURNED',
  'STOP_SKIPPED',
  'MANIFEST_PRINTED',
  'MANIFEST_EXPORTED',
  'UBER_QUOTE_REQUESTED_PLACEHOLDER'
);

CREATE TYPE "FailedDeliveryReason" AS ENUM (
  'CUSTOMER_UNAVAILABLE',
  'WRONG_ADDRESS',
  'DRIVER_ISSUE',
  'ORDER_NOT_PACKED',
  'WEATHER_TRAFFIC',
  'PAYMENT_ISSUE',
  'OTHER'
);

-- Extend delivery_routes.
ALTER TABLE "delivery_routes"
  ADD COLUMN IF NOT EXISTS "brand_id" UUID,
  ADD COLUMN IF NOT EXISTS "location_id" UUID,
  ADD COLUMN IF NOT EXISTS "zone_id" UUID,
  ADD COLUMN IF NOT EXISTS "driver_profile_id" UUID,
  ADD COLUMN IF NOT EXISTS "driver_user_id" UUID,
  ADD COLUMN IF NOT EXISTS "title" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "mode" "DeliveryRouteMode" NOT NULL DEFAULT 'MEAL_PREP_DELIVERY',
  ADD COLUMN IF NOT EXISTS "vehicle_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "delivery_window_start" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "delivery_window_end" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "start_address_json" JSONB,
  ADD COLUMN IF NOT EXISTS "end_address_json" JSONB,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "completed_stops" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "failed_stops" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "maps_url" TEXT;

CREATE INDEX IF NOT EXISTS "delivery_routes_brand_id_idx"        ON "delivery_routes"("brand_id");
CREATE INDEX IF NOT EXISTS "delivery_routes_location_id_idx"     ON "delivery_routes"("location_id");
CREATE INDEX IF NOT EXISTS "delivery_routes_zone_id_idx"         ON "delivery_routes"("zone_id");
CREATE INDEX IF NOT EXISTS "delivery_routes_driver_profile_id_idx" ON "delivery_routes"("driver_profile_id");
CREATE INDEX IF NOT EXISTS "delivery_routes_driver_user_id_idx"  ON "delivery_routes"("driver_user_id");
CREATE INDEX IF NOT EXISTS "delivery_routes_status_idx"          ON "delivery_routes"("status");

-- Extend delivery_stops.
ALTER TABLE "delivery_stops"
  ADD COLUMN IF NOT EXISTS "customer_email" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "customer_phone" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "customer_id" UUID,
  ADD COLUMN IF NOT EXISTS "delivery_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "packing_status" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "payment_status" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 6),
  ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10, 6),
  ADD COLUMN IF NOT EXISTS "maps_url" TEXT,
  ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "failed_reason" "FailedDeliveryReason",
  ADD COLUMN IF NOT EXISTS "proof_json" JSONB;

CREATE INDEX IF NOT EXISTS "delivery_stops_route_id_sequence_idx" ON "delivery_stops"("route_id", "sequence");
CREATE INDEX IF NOT EXISTS "delivery_stops_status_idx"            ON "delivery_stops"("status");

-- delivery_zones.
CREATE TABLE IF NOT EXISTS "delivery_zones" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "postal_codes_json" JSONB,
    "radius_km" DECIMAL(8, 2),
    "delivery_fee" DECIMAL(10, 2),
    "minimum_order_amount" DECIMAL(10, 2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_zones_user_id_name_key" ON "delivery_zones"("user_id", "name");
CREATE INDEX IF NOT EXISTS "delivery_zones_user_id_active_idx"      ON "delivery_zones"("user_id", "active");

-- driver_profiles.
CREATE TABLE IF NOT EXISTS "driver_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "user_id_ref" UUID,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(64),
    "email" VARCHAR(255),
    "vehicle" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "driver_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "driver_profiles_user_id_active_idx" ON "driver_profiles"("user_id", "active");
CREATE INDEX IF NOT EXISTS "driver_profiles_user_id_ref_idx"    ON "driver_profiles"("user_id_ref");

-- delivery_events.
CREATE TABLE IF NOT EXISTS "delivery_events" (
    "id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "stop_id" UUID,
    "order_id" UUID,
    "event_type" "DeliveryEventType" NOT NULL,
    "performed_by" VARCHAR(255),
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "delivery_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "delivery_events_route_id_created_at_idx" ON "delivery_events"("route_id", "created_at");
CREATE INDEX IF NOT EXISTS "delivery_events_stop_id_idx"             ON "delivery_events"("stop_id");
CREATE INDEX IF NOT EXISTS "delivery_events_event_type_idx"          ON "delivery_events"("event_type");

-- Foreign keys.
ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_location_id_fkey"
  FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_zone_id_fkey"
  FOREIGN KEY ("zone_id") REFERENCES "delivery_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_driver_profile_id_fkey"
  FOREIGN KEY ("driver_profile_id") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_driver_user_id_fkey"
  FOREIGN KEY ("driver_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_zones" ADD CONSTRAINT "delivery_zones_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_ref_fkey"
  FOREIGN KEY ("user_id_ref") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_route_id_fkey"
  FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_stop_id_fkey"
  FOREIGN KEY ("stop_id") REFERENCES "delivery_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
