-- P2 high priority: shop domain index + feedback, slots, IoT, push, referral affiliate fields

CREATE INDEX IF NOT EXISTS "integration_connections_shop_domain_idx" ON "integration_connections"("shop_domain");

ALTER TABLE "referral_codes" ADD COLUMN IF NOT EXISTS "commission_bps" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "referral_codes" ADD COLUMN IF NOT EXISTS "affiliate_label" VARCHAR(120);

ALTER TABLE "delivery_zones" ADD COLUMN IF NOT EXISTS "max_deliveries_per_slot" INTEGER NOT NULL DEFAULT 12;

CREATE TABLE IF NOT EXISTS "customer_feedback" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "customer_id" UUID,
    "order_id" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "tags_json" JSONB,
    "negative_routed" BOOLEAN NOT NULL DEFAULT false,
    "review_email_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_feedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "delivery_slots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "slot_date" DATE NOT NULL,
    "window_start" VARCHAR(8) NOT NULL,
    "window_end" VARCHAR(8) NOT NULL,
    "max_capacity" INTEGER NOT NULL DEFAULT 10,
    "booked_count" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "delivery_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "iot_sensor_devices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_id" VARCHAR(120) NOT NULL,
    "label" VARCHAR(255),
    "location_id" UUID,
    "target_min_f" DECIMAL(6,2),
    "target_max_f" DECIMAL(6,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3),
    "last_battery" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "iot_sensor_devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_slots_zone_id_slot_date_window_start_key" ON "delivery_slots"("zone_id", "slot_date", "window_start");
CREATE INDEX IF NOT EXISTS "delivery_slots_user_id_slot_date_idx" ON "delivery_slots"("user_id", "slot_date");
CREATE INDEX IF NOT EXISTS "customer_feedback_user_id_created_at_idx" ON "customer_feedback"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "customer_feedback_order_id_idx" ON "customer_feedback"("order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "iot_sensor_devices_user_id_device_id_key" ON "iot_sensor_devices"("user_id", "device_id");
CREATE INDEX IF NOT EXISTS "iot_sensor_devices_user_id_active_idx" ON "iot_sensor_devices"("user_id", "active");
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");

ALTER TABLE "customer_feedback" ADD CONSTRAINT "customer_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_feedback" ADD CONSTRAINT "customer_feedback_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_feedback" ADD CONSTRAINT "customer_feedback_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_slots" ADD CONSTRAINT "delivery_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_slots" ADD CONSTRAINT "delivery_slots_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "delivery_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "iot_sensor_devices" ADD CONSTRAINT "iot_sensor_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "iot_sensor_devices" ADD CONSTRAINT "iot_sensor_devices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
