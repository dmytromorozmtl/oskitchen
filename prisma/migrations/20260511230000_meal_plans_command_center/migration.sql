-- Meal Plans Command Center: additive. CustomerSubscription is preserved as-is.

-- 1. Enums.
CREATE TYPE "MealPlanType" AS ENUM (
  'INDIVIDUAL', 'FAMILY', 'CORPORATE_LUNCH', 'OFFICE_ROTATION',
  'FITNESS_PLAN', 'SENIOR_MEALS', 'CUSTOM', 'TRIAL_PLAN'
);
CREATE TYPE "MealPlanStatus" AS ENUM (
  'DRAFT', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'NEEDS_REVIEW', 'COMPLETED'
);
CREATE TYPE "MealPlanFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM_RRULE');
CREATE TYPE "MealPlanFulfillmentMode" AS ENUM ('PICKUP', 'DELIVERY', 'MIXED');
CREATE TYPE "MealPlanBillingMode" AS ENUM ('PAY_LATER', 'MANUAL_INVOICE', 'STRIPE_PLACEHOLDER', 'FREE_TRIAL');
CREATE TYPE "MealPlanGenerationMode" AS ENUM (
  'MANUAL_ONLY', 'PREVIEW_BEFORE_CREATE', 'AUTO_CREATE_DRAFT_ORDERS', 'AUTO_CREATE_CONFIRMED_ORDERS'
);
CREATE TYPE "MealPlanCycleStatus" AS ENUM (
  'UPCOMING', 'NEEDS_SELECTION', 'READY_TO_GENERATE', 'GENERATED', 'SKIPPED', 'PAUSED', 'CANCELLED'
);
CREATE TYPE "MealPlanEventType" AS ENUM (
  'PLAN_CREATED', 'PLAN_UPDATED', 'PLAN_PAUSED', 'PLAN_RESUMED', 'PLAN_CANCELLED',
  'PLAN_EXPIRED', 'PLAN_ARCHIVED', 'CYCLE_CREATED', 'CYCLE_SKIPPED',
  'CYCLE_SELECTIONS_CHANGED', 'CYCLE_READY', 'ORDER_PREVIEWED',
  'ORDER_DRAFT_GENERATED', 'CUSTOMER_REQUEST', 'NOTE_ADDED', 'OTHER'
);

-- 2. meal_plans
CREATE TABLE IF NOT EXISTS "meal_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "brand_id" UUID,
    "location_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "type" "MealPlanType" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "MealPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "frequency" "MealPlanFrequency" NOT NULL DEFAULT 'WEEKLY',
    "custom_rrule" VARCHAR(255),
    "meals_per_cycle" INTEGER NOT NULL DEFAULT 5,
    "servings_per_meal" INTEGER NOT NULL DEFAULT 1,
    "fulfillment_mode" "MealPlanFulfillmentMode" NOT NULL DEFAULT 'PICKUP',
    "pickup_window_json" JSONB,
    "delivery_window_json" JSONB,
    "delivery_address_json" JSONB,
    "start_date" DATE NOT NULL,
    "next_order_date" DATE,
    "end_date" DATE,
    "paused_until" DATE,
    "pause_reason" TEXT,
    "dietary_preferences_json" JSONB,
    "allergies_json" JSONB,
    "disliked_items_json" JSONB,
    "favorite_items_json" JSONB,
    "notes" TEXT,
    "billing_mode" "MealPlanBillingMode" NOT NULL DEFAULT 'PAY_LATER',
    "price_per_cycle" DECIMAL(12,2),
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "generation_mode" "MealPlanGenerationMode" NOT NULL DEFAULT 'PREVIEW_BEFORE_CREATE',
    "legacy_subscription_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "meal_plans_legacy_subscription_id_key" ON "meal_plans"("legacy_subscription_id");
CREATE INDEX IF NOT EXISTS "meal_plans_user_id_idx" ON "meal_plans"("user_id");
CREATE INDEX IF NOT EXISTS "meal_plans_user_id_status_idx" ON "meal_plans"("user_id", "status");
CREATE INDEX IF NOT EXISTS "meal_plans_customer_id_idx" ON "meal_plans"("customer_id");
CREATE INDEX IF NOT EXISTS "meal_plans_next_order_date_idx" ON "meal_plans"("next_order_date");
CREATE INDEX IF NOT EXISTS "meal_plans_brand_id_idx" ON "meal_plans"("brand_id");
CREATE INDEX IF NOT EXISTS "meal_plans_location_id_idx" ON "meal_plans"("location_id");

ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_location_id_fkey"
  FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. meal_plan_cycles
CREATE TABLE IF NOT EXISTS "meal_plan_cycles" (
    "id" UUID NOT NULL,
    "meal_plan_id" UUID NOT NULL,
    "cycle_start_date" DATE NOT NULL,
    "cycle_end_date" DATE NOT NULL,
    "status" "MealPlanCycleStatus" NOT NULL DEFAULT 'UPCOMING',
    "meals_planned" INTEGER NOT NULL DEFAULT 0,
    "order_id" UUID,
    "generated_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_plan_cycles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "meal_plan_cycles_order_id_key" ON "meal_plan_cycles"("order_id");
CREATE INDEX IF NOT EXISTS "meal_plan_cycles_meal_plan_id_cycle_start_date_idx" ON "meal_plan_cycles"("meal_plan_id", "cycle_start_date");
CREATE INDEX IF NOT EXISTS "meal_plan_cycles_meal_plan_id_status_idx" ON "meal_plan_cycles"("meal_plan_id", "status");
CREATE INDEX IF NOT EXISTS "meal_plan_cycles_status_cycle_start_date_idx" ON "meal_plan_cycles"("status", "cycle_start_date");

ALTER TABLE "meal_plan_cycles" ADD CONSTRAINT "meal_plan_cycles_meal_plan_id_fkey"
  FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plan_cycles" ADD CONSTRAINT "meal_plan_cycles_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. meal_plan_selections
CREATE TABLE IF NOT EXISTS "meal_plan_selections" (
    "id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "product_id" UUID,
    "menu_id" UUID,
    "item_name" VARCHAR(255),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "locked" BOOLEAN NOT NULL DEFAULT FALSE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_plan_selections_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "meal_plan_selections_cycle_id_idx" ON "meal_plan_selections"("cycle_id");
CREATE INDEX IF NOT EXISTS "meal_plan_selections_product_id_idx" ON "meal_plan_selections"("product_id");

ALTER TABLE "meal_plan_selections" ADD CONSTRAINT "meal_plan_selections_cycle_id_fkey"
  FOREIGN KEY ("cycle_id") REFERENCES "meal_plan_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plan_selections" ADD CONSTRAINT "meal_plan_selections_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meal_plan_selections" ADD CONSTRAINT "meal_plan_selections_menu_id_fkey"
  FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. meal_plan_events
CREATE TABLE IF NOT EXISTS "meal_plan_events" (
    "id" UUID NOT NULL,
    "meal_plan_id" UUID NOT NULL,
    "cycle_id" UUID,
    "event_type" "MealPlanEventType" NOT NULL,
    "performed_by" VARCHAR(255),
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_plan_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "meal_plan_events_meal_plan_id_created_at_idx" ON "meal_plan_events"("meal_plan_id", "created_at");
CREATE INDEX IF NOT EXISTS "meal_plan_events_cycle_id_idx" ON "meal_plan_events"("cycle_id");

ALTER TABLE "meal_plan_events" ADD CONSTRAINT "meal_plan_events_meal_plan_id_fkey"
  FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plan_events" ADD CONSTRAINT "meal_plan_events_cycle_id_fkey"
  FOREIGN KEY ("cycle_id") REFERENCES "meal_plan_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. meal_plan_templates
CREATE TABLE IF NOT EXISTS "meal_plan_templates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "MealPlanType" NOT NULL DEFAULT 'INDIVIDUAL',
    "description" TEXT,
    "meals_per_cycle" INTEGER NOT NULL DEFAULT 5,
    "servings_per_meal" INTEGER NOT NULL DEFAULT 1,
    "frequency" "MealPlanFrequency" NOT NULL DEFAULT 'WEEKLY',
    "fulfillment_default" "MealPlanFulfillmentMode" NOT NULL DEFAULT 'PICKUP',
    "default_items_json" JSONB,
    "dietary_preset_json" JSONB,
    "fulfillment_defaults_json" JSONB,
    "built_in_key" VARCHAR(80),
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_plan_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "meal_plan_templates_user_id_name_key" ON "meal_plan_templates"("user_id", "name");
CREATE INDEX IF NOT EXISTS "meal_plan_templates_user_id_active_idx" ON "meal_plan_templates"("user_id", "active");

ALTER TABLE "meal_plan_templates" ADD CONSTRAINT "meal_plan_templates_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
