-- SubscriptionPlan: ENTERPRISE (PostgreSQL 15+)
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'ENTERPRISE';

-- Integration enums
CREATE TYPE "IntegrationProvider" AS ENUM ('WOOCOMMERCE', 'SHOPIFY', 'UBER_EATS', 'UBER_DIRECT', 'MANUAL');
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'NEEDS_AUTH', 'DISABLED', 'ERROR');
CREATE TYPE "ExternalSyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'SKIPPED');
CREATE TYPE "NormalizedOrderStatus" AS ENUM ('DRAFT', 'OPEN', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE "DeliveryProvider" AS ENUM ('UBER_DIRECT', 'INTERNAL');
CREATE TYPE "DeliveryStatus" AS ENUM ('QUOTE', 'QUOTED', 'SCHEDULED', 'PICKUP', 'DROPOFF', 'COMPLETED', 'CANCELLED', 'FAILED');
CREATE TYPE "PublishStatus" AS ENUM ('NOT_PUBLISHED', 'PUBLISHING', 'PUBLISHED', 'FAILED');

-- integration_connections
CREATE TABLE "integration_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'NEEDS_AUTH',
    "shop_domain" TEXT,
    "base_url" TEXT,
    "access_token_encrypted" TEXT,
    "refresh_token_encrypted" TEXT,
    "consumer_key_encrypted" TEXT,
    "consumer_secret_encrypted" TEXT,
    "webhook_secret_encrypted" TEXT,
    "external_store_id" TEXT,
    "scopes" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "last_error" TEXT,
    "settings_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_connections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "integration_connections_user_id_idx" ON "integration_connections"("user_id");
CREATE INDEX "integration_connections_user_id_provider_idx" ON "integration_connections"("user_id", "provider");
CREATE INDEX "integration_connections_provider_idx" ON "integration_connections"("provider");

ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- external_orders
CREATE TABLE "external_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "connection_id" UUID,
    "provider" "IntegrationProvider" NOT NULL,
    "external_order_id" VARCHAR(255) NOT NULL,
    "external_order_number" TEXT,
    "source_status" VARCHAR(255),
    "normalized_status" "NormalizedOrderStatus",
    "customer_name" TEXT,
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "subtotal" DECIMAL(12,2),
    "tax" DECIMAL(12,2),
    "delivery_fee" DECIMAL(12,2),
    "total" DECIMAL(12,2),
    "currency" VARCHAR(16),
    "fulfillment_type" "FulfillmentType",
    "pickup_time" TIMESTAMP(3),
    "delivery_time" TIMESTAMP(3),
    "delivery_address_json" JSONB,
    "raw_payload_json" JSONB NOT NULL,
    "imported_order_id" UUID,
    "sync_status" "ExternalSyncStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "external_orders_imported_order_id_key" ON "external_orders"("imported_order_id");
CREATE UNIQUE INDEX "external_orders_connection_id_external_order_id_key" ON "external_orders"("connection_id", "external_order_id");
CREATE INDEX "external_orders_user_id_idx" ON "external_orders"("user_id");
CREATE INDEX "external_orders_user_id_provider_idx" ON "external_orders"("user_id", "provider");
CREATE INDEX "external_orders_provider_idx" ON "external_orders"("provider");
CREATE INDEX "external_orders_sync_status_idx" ON "external_orders"("sync_status");
CREATE INDEX "external_orders_created_at_idx" ON "external_orders"("created_at");

ALTER TABLE "external_orders" ADD CONSTRAINT "external_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "external_orders" ADD CONSTRAINT "external_orders_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "external_orders" ADD CONSTRAINT "external_orders_imported_order_id_fkey" FOREIGN KEY ("imported_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- external_products
CREATE TABLE "external_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "connection_id" UUID,
    "provider" "IntegrationProvider" NOT NULL,
    "external_product_id" VARCHAR(255) NOT NULL,
    "external_variant_id" VARCHAR(255) NOT NULL DEFAULT '',
    "title" VARCHAR(512) NOT NULL,
    "sku" VARCHAR(255),
    "price" DECIMAL(12,2),
    "image" TEXT,
    "raw_payload_json" JSONB NOT NULL,
    "mapped_product_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "external_products_connection_id_external_product_id_external_variant_id_key" ON "external_products"("connection_id", "external_product_id", "external_variant_id");
CREATE INDEX "external_products_user_id_idx" ON "external_products"("user_id");
CREATE INDEX "external_products_user_id_provider_idx" ON "external_products"("user_id", "provider");
CREATE INDEX "external_products_provider_idx" ON "external_products"("provider");

ALTER TABLE "external_products" ADD CONSTRAINT "external_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "external_products" ADD CONSTRAINT "external_products_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "external_products" ADD CONSTRAINT "external_products_mapped_product_id_fkey" FOREIGN KEY ("mapped_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- order_channels
CREATE TABLE "order_channels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "color" VARCHAR(32),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_channels_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_channels_user_id_idx" ON "order_channels"("user_id");
CREATE INDEX "order_channels_user_id_provider_idx" ON "order_channels"("user_id", "provider");

ALTER TABLE "order_channels" ADD CONSTRAINT "order_channels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- webhook_events
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "connection_id" UUID,
    "external_event_id" VARCHAR(512),
    "topic" VARCHAR(255) NOT NULL,
    "payload_json" JSONB NOT NULL,
    "signature_valid" BOOLEAN NOT NULL DEFAULT false,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processing_error" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "webhook_events_user_id_idx" ON "webhook_events"("user_id");
CREATE INDEX "webhook_events_user_id_processed_idx" ON "webhook_events"("user_id", "processed");
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events"("provider");
CREATE INDEX "webhook_events_connection_id_idx" ON "webhook_events"("connection_id");
CREATE INDEX "webhook_events_received_at_idx" ON "webhook_events"("received_at");

ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- delivery_dispatches
CREATE TABLE "delivery_dispatches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "provider" "DeliveryProvider" NOT NULL DEFAULT 'UBER_DIRECT',
    "external_delivery_id" VARCHAR(255),
    "quote_id" VARCHAR(255),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'QUOTE',
    "pickup_address_json" JSONB,
    "dropoff_address_json" JSONB,
    "tracking_url" TEXT,
    "fee" DECIMAL(12,2),
    "currency" VARCHAR(16),
    "raw_payload_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_dispatches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "delivery_dispatches_user_id_idx" ON "delivery_dispatches"("user_id");
CREATE INDEX "delivery_dispatches_order_id_idx" ON "delivery_dispatches"("order_id");
CREATE INDEX "delivery_dispatches_provider_idx" ON "delivery_dispatches"("provider");

ALTER TABLE "delivery_dispatches" ADD CONSTRAINT "delivery_dispatches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_dispatches" ADD CONSTRAINT "delivery_dispatches_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- menu_channel_publishes
CREATE TABLE "menu_channel_publishes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'NOT_PUBLISHED',
    "last_published_at" TIMESTAMP(3),
    "last_error" TEXT,
    "external_menu_id" VARCHAR(255),
    "channel_meta_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_channel_publishes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "menu_channel_publishes_menu_id_connection_id_key" ON "menu_channel_publishes"("menu_id", "connection_id");
CREATE INDEX "menu_channel_publishes_user_id_idx" ON "menu_channel_publishes"("user_id");
CREATE INDEX "menu_channel_publishes_provider_idx" ON "menu_channel_publishes"("provider");

ALTER TABLE "menu_channel_publishes" ADD CONSTRAINT "menu_channel_publishes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_channel_publishes" ADD CONSTRAINT "menu_channel_publishes_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_channel_publishes" ADD CONSTRAINT "menu_channel_publishes_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
