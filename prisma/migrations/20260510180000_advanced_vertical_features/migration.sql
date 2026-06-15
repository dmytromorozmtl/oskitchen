-- Advanced vertical features: storefront, costing, locations, tasks, routes, etc.

CREATE TYPE "StorefrontOrderStatus" AS ENUM ('SUBMITTED', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "KitchenTaskType" AS ENUM ('PREP', 'COOK', 'PACK', 'CLEAN', 'DELIVERY', 'ADMIN');
CREATE TYPE "KitchenTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE "KitchenTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "PackingEventType" AS ENUM ('SCANNED', 'ITEM_PACKED', 'ITEM_MISSING', 'ORDER_PACKED', 'LABEL_PRINTED', 'HANDED_OFF');
CREATE TYPE "DeliveryRouteStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "DeliveryStopStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'SKIPPED');
CREATE TYPE "CateringQuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED');
CREATE TYPE "CustomerSubscriptionFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');
CREATE TYPE "CustomerSubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');
CREATE TYPE "NotificationRuleTrigger" AS ENUM ('PREORDER_DEADLINE', 'ORDER_CONFIRMED', 'PICKUP_REMINDER', 'DELIVERY_REMINDER', 'PRODUCTION_DUE', 'LOW_STOCK', 'WEBHOOK_FAILED', 'QUOTE_FOLLOWUP', 'SUBSCRIPTION_RENEWAL');
CREATE TYPE "NotificationRuleChannel" AS ENUM ('EMAIL', 'SMS', 'IN_APP');

CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address_json" JSONB,
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "locations_user_id_idx" ON "locations"("user_id");
ALTER TABLE "locations" ADD CONSTRAINT "locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menus" ADD COLUMN "location_id" UUID;
ALTER TABLE "menus" ADD CONSTRAINT "menus_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "menus_location_id_idx" ON "menus"("location_id");

ALTER TABLE "orders" ADD COLUMN "location_id" UUID;
ALTER TABLE "orders" ADD CONSTRAINT "orders_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "orders_location_id_idx" ON "orders"("location_id");

CREATE TABLE "storefront_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "store_slug" VARCHAR(120) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "public_name" VARCHAR(255) NOT NULL,
    "logo_url" TEXT,
    "hero_image_url" TEXT,
    "brand_color" VARCHAR(32),
    "description" TEXT,
    "pickup_enabled" BOOLEAN NOT NULL DEFAULT true,
    "delivery_enabled" BOOLEAN NOT NULL DEFAULT false,
    "preorder_enabled" BOOLEAN NOT NULL DEFAULT true,
    "pay_later_only" BOOLEAN NOT NULL DEFAULT true,
    "active_menu_id" UUID,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
    "custom_domain" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_settings_user_id_key" ON "storefront_settings"("user_id");
CREATE UNIQUE INDEX "storefront_settings_store_slug_key" ON "storefront_settings"("store_slug");
CREATE INDEX "storefront_settings_user_id_idx" ON "storefront_settings"("user_id");
ALTER TABLE "storefront_settings" ADD CONSTRAINT "storefront_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_settings" ADD CONSTRAINT "storefront_settings_active_menu_id_fkey" FOREIGN KEY ("active_menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "storefront_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT,
    "fulfillment_type" "FulfillmentType" NOT NULL,
    "pickup_date" DATE,
    "delivery_date" DATE,
    "delivery_address_json" JSONB,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "delivery_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "StorefrontOrderStatus" NOT NULL DEFAULT 'SUBMITTED',
    "public_token" VARCHAR(64) NOT NULL,
    "internal_order_id" UUID,
    "cart_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_orders_public_token_key" ON "storefront_orders"("public_token");
CREATE UNIQUE INDEX "storefront_orders_internal_order_id_key" ON "storefront_orders"("internal_order_id");
CREATE INDEX "storefront_orders_user_id_idx" ON "storefront_orders"("user_id");
CREATE INDEX "storefront_orders_user_id_created_at_idx" ON "storefront_orders"("user_id", "created_at");
ALTER TABLE "storefront_orders" ADD CONSTRAINT "storefront_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_orders" ADD CONSTRAINT "storefront_orders_internal_order_id_fkey" FOREIGN KEY ("internal_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "menu_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "template_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "menu_templates_user_id_idx" ON "menu_templates"("user_id");
ALTER TABLE "menu_templates" ADD CONSTRAINT "menu_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "supplier" VARCHAR(255),
    "cost_per_unit" DECIMAL(12,4) NOT NULL,
    "current_stock" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "par_level" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ingredients_user_id_idx" ON "ingredients"("user_id");
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "yield_quantity" DECIMAL(12,4) NOT NULL,
    "yield_unit" VARCHAR(64) NOT NULL,
    "prep_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "cook_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "labor_minutes" INTEGER NOT NULL DEFAULT 0,
    "packaging_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "recipes_product_id_key" ON "recipes"("product_id");
CREATE INDEX "recipes_user_id_idx" ON "recipes"("user_id");
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "recipe_ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "waste_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients"("recipe_id");
CREATE INDEX "recipe_ingredients_ingredient_id_idx" ON "recipe_ingredients"("ingredient_id");
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "nutrition_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "calories" INTEGER,
    "protein" DECIMAL(8,2),
    "carbs" DECIMAL(8,2),
    "fat" DECIMAL(8,2),
    "fiber" DECIMAL(8,2),
    "sugar" DECIMAL(8,2),
    "sodium" DECIMAL(8,2),
    "serving_size" VARCHAR(120),
    "ingredients_text" TEXT,
    "allergens" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nutrition_profiles_product_id_key" ON "nutrition_profiles"("product_id");
ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cost_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "ingredient_cost" DECIMAL(12,2) NOT NULL,
    "labor_cost" DECIMAL(12,2) NOT NULL,
    "packaging_cost" DECIMAL(12,2) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "gross_margin" DECIMAL(12,2) NOT NULL,
    "margin_percent" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cost_snapshots_user_id_idx" ON "cost_snapshots"("user_id");
CREATE INDEX "cost_snapshots_product_id_idx" ON "cost_snapshots"("product_id");
ALTER TABLE "cost_snapshots" ADD CONSTRAINT "cost_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cost_snapshots" ADD CONSTRAINT "cost_snapshots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "product_availabilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "channel_id" UUID,
    "available_from" TIMESTAMP(3) NOT NULL,
    "available_until" TIMESTAMP(3) NOT NULL,
    "max_quantity" INTEGER,
    "sold_quantity" INTEGER NOT NULL DEFAULT 0,
    "sold_out" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_availabilities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_availabilities_menu_id_idx" ON "product_availabilities"("menu_id");
CREATE INDEX "product_availabilities_product_id_idx" ON "product_availabilities"("product_id");
ALTER TABLE "product_availabilities" ADD CONSTRAINT "product_availabilities_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_availabilities" ADD CONSTRAINT "product_availabilities_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_availabilities" ADD CONSTRAINT "product_availabilities_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "order_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "staff_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "role" VARCHAR(64) NOT NULL DEFAULT 'staff',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_members_user_id_idx" ON "staff_members"("user_id");
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "kitchen_customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "phone" VARCHAR(64),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "kitchen_customers_user_id_email_key" ON "kitchen_customers"("user_id", "email");
CREATE INDEX "kitchen_customers_user_id_idx" ON "kitchen_customers"("user_id");
ALTER TABLE "kitchen_customers" ADD CONSTRAINT "kitchen_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "kitchen_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "task_type" "KitchenTaskType" NOT NULL,
    "assigned_to_id" UUID,
    "related_order_id" UUID,
    "related_product_id" UUID,
    "due_at" TIMESTAMP(3),
    "priority" "KitchenTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "KitchenTaskStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "kitchen_tasks_user_id_idx" ON "kitchen_tasks"("user_id");
CREATE INDEX "kitchen_tasks_assigned_to_id_idx" ON "kitchen_tasks"("assigned_to_id");
CREATE INDEX "kitchen_tasks_status_idx" ON "kitchen_tasks"("status");
ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_related_order_id_fkey" FOREIGN KEY ("related_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "delivery_routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "route_date" DATE NOT NULL,
    "driver_name" VARCHAR(255),
    "status" "DeliveryRouteStatus" NOT NULL DEFAULT 'PLANNED',
    "total_stops" INTEGER NOT NULL DEFAULT 0,
    "estimated_distance" DECIMAL(10,2),
    "estimated_duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_routes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "delivery_routes_user_id_route_date_idx" ON "delivery_routes"("user_id", "route_date");
ALTER TABLE "delivery_routes" ADD CONSTRAINT "delivery_routes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "delivery_stops" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "route_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "customer_name" VARCHAR(255) NOT NULL,
    "address_json" JSONB NOT NULL,
    "delivery_window_start" TIMESTAMP(3),
    "delivery_window_end" TIMESTAMP(3),
    "status" "DeliveryStopStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_stops_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "delivery_stops_route_id_idx" ON "delivery_stops"("route_id");
CREATE INDEX "delivery_stops_order_id_idx" ON "delivery_stops"("order_id");
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "packing_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "order_item_id" UUID,
    "event_type" "PackingEventType" NOT NULL,
    "performed_by" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packing_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "packing_events_user_id_order_id_idx" ON "packing_events"("user_id", "order_id");
ALTER TABLE "packing_events" ADD CONSTRAINT "packing_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_events" ADD CONSTRAINT "packing_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_events" ADD CONSTRAINT "packing_events_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "catering_quotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255),
    "event_date" DATE,
    "guest_count" INTEGER,
    "budget" DECIMAL(12,2),
    "status" "CateringQuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "public_token" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catering_quotes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "catering_quotes_public_token_key" ON "catering_quotes"("public_token");
CREATE INDEX "catering_quotes_user_id_idx" ON "catering_quotes"("user_id");
ALTER TABLE "catering_quotes" ADD CONSTRAINT "catering_quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "catering_quote_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quote_id" UUID NOT NULL,
    "product_id" UUID,
    "title" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catering_quote_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "catering_quote_items_quote_id_idx" ON "catering_quote_items"("quote_id");
ALTER TABLE "catering_quote_items" ADD CONSTRAINT "catering_quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "catering_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "catering_quote_items" ADD CONSTRAINT "catering_quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "customer_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "plan_name" VARCHAR(255) NOT NULL,
    "frequency" "CustomerSubscriptionFrequency" NOT NULL,
    "meals_per_week" INTEGER NOT NULL,
    "pickup_or_delivery" "FulfillmentType" NOT NULL,
    "status" "CustomerSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "next_order_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "customer_subscriptions_user_id_idx" ON "customer_subscriptions"("user_id");
CREATE INDEX "customer_subscriptions_customer_id_idx" ON "customer_subscriptions"("customer_id");
ALTER TABLE "customer_subscriptions" ADD CONSTRAINT "customer_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_subscriptions" ADD CONSTRAINT "customer_subscriptions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ingredient_demand_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "required_quantity" DECIMAL(14,4) NOT NULL,
    "stock_available" DECIMAL(14,4),
    "shortage" DECIMAL(14,4),
    "supplier" VARCHAR(255),
    "related_products_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_demand_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ingredient_demand_lines_user_id_date_idx" ON "ingredient_demand_lines"("user_id", "date");
CREATE INDEX "ingredient_demand_lines_ingredient_id_idx" ON "ingredient_demand_lines"("ingredient_id");
ALTER TABLE "ingredient_demand_lines" ADD CONSTRAINT "ingredient_demand_lines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredient_demand_lines" ADD CONSTRAINT "ingredient_demand_lines_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "notification_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "trigger" "NotificationRuleTrigger" NOT NULL,
    "channel" "NotificationRuleChannel" NOT NULL DEFAULT 'EMAIL',
    "template" TEXT,
    "timing_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notification_rules_user_id_idx" ON "notification_rules"("user_id");
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
