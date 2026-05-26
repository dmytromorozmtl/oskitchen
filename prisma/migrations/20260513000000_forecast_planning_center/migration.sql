-- Forecast & Planning Center: additive.

CREATE TYPE "ForecastType" AS ENUM (
  'ORDER_DEMAND',
  'PRODUCT_DEMAND',
  'PRODUCTION_LOAD',
  'INGREDIENT_DEMAND',
  'STAFFING_LOAD',
  'PACKING_LOAD',
  'ROUTE_LOAD',
  'CATERING_LOAD',
  'MEAL_PLAN_LOAD',
  'CHANNEL_DEMAND'
);

CREATE TYPE "ForecastSourceType" AS ENUM (
  'HISTORICAL_ORDERS',
  'ACTIVE_MENU',
  'UPCOMING_MENU',
  'MENU_PLANNER',
  'MEAL_PLANS',
  'ACCEPTED_CATERING_EVENTS',
  'PRODUCTION_PLAN',
  'SALES_CHANNELS',
  'MANUAL_ADJUSTMENT',
  'SEASONAL_FACTOR'
);

CREATE TYPE "ForecastConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'MANUAL');

CREATE TYPE "ForecastRunStatus" AS ENUM ('DRAFT', 'COMPLETED', 'ARCHIVED');

CREATE TYPE "ForecastAdjustmentType" AS ENUM ('PERCENT', 'FIXED_QUANTITY', 'OVERRIDE');

CREATE TYPE "ForecastEventType" AS ENUM (
  'RUN_CREATED',
  'RUN_COMPLETED',
  'ADJUSTMENT_ADDED',
  'SENT_TO_PRODUCTION',
  'SENT_TO_INGREDIENT_DEMAND',
  'EXPORTED',
  'ARCHIVED',
  'RESTORED'
);

CREATE TABLE IF NOT EXISTS "forecast_runs" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "brand_id" UUID,
  "location_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "forecast_type" "ForecastType" NOT NULL,
  "date_from" DATE NOT NULL,
  "date_to" DATE NOT NULL,
  "source_types_json" JSONB NOT NULL,
  "filters_json" JSONB,
  "status" "ForecastRunStatus" NOT NULL DEFAULT 'DRAFT',
  "confidence" "ForecastConfidence" NOT NULL DEFAULT 'LOW',
  "buffer_percent" DECIMAL(5,2) NOT NULL DEFAULT 10,
  "created_by" VARCHAR(255),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "forecast_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "forecast_runs_user_id_date_from_date_to_idx"
  ON "forecast_runs"("user_id", "date_from", "date_to");
CREATE INDEX IF NOT EXISTS "forecast_runs_user_id_forecast_type_idx"
  ON "forecast_runs"("user_id", "forecast_type");
CREATE INDEX IF NOT EXISTS "forecast_runs_brand_id_idx" ON "forecast_runs"("brand_id");
CREATE INDEX IF NOT EXISTS "forecast_runs_location_id_idx" ON "forecast_runs"("location_id");
DO $$ BEGIN
  ALTER TABLE "forecast_runs" ADD CONSTRAINT "forecast_runs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "forecast_runs" ADD CONSTRAINT "forecast_runs_brand_id_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "forecast_runs" ADD CONSTRAINT "forecast_runs_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "forecast_lines" (
  "id" UUID NOT NULL,
  "forecast_run_id" UUID NOT NULL,
  "product_id" UUID,
  "menu_id" UUID,
  "ingredient_id" UUID,
  "label" VARCHAR(255) NOT NULL,
  "source_type" "ForecastSourceType" NOT NULL,
  "forecast_date" DATE,
  "forecast_quantity" DECIMAL(14,4) NOT NULL,
  "unit" VARCHAR(32) NOT NULL DEFAULT 'ea',
  "confidence" "ForecastConfidence" NOT NULL DEFAULT 'LOW',
  "buffer_quantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "recommended_quantity" DECIMAL(14,4) NOT NULL,
  "source_summary_json" JSONB,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "forecast_lines_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "forecast_lines_forecast_run_id_idx" ON "forecast_lines"("forecast_run_id");
CREATE INDEX IF NOT EXISTS "forecast_lines_product_id_idx" ON "forecast_lines"("product_id");
CREATE INDEX IF NOT EXISTS "forecast_lines_ingredient_id_idx" ON "forecast_lines"("ingredient_id");
CREATE INDEX IF NOT EXISTS "forecast_lines_forecast_date_idx" ON "forecast_lines"("forecast_date");
DO $$ BEGIN
  ALTER TABLE "forecast_lines" ADD CONSTRAINT "forecast_lines_forecast_run_id_fkey"
    FOREIGN KEY ("forecast_run_id") REFERENCES "forecast_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "forecast_lines" ADD CONSTRAINT "forecast_lines_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "forecast_lines" ADD CONSTRAINT "forecast_lines_menu_id_fkey"
    FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "forecast_lines" ADD CONSTRAINT "forecast_lines_ingredient_id_fkey"
    FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "forecast_adjustments" (
  "id" UUID NOT NULL,
  "forecast_run_id" UUID NOT NULL,
  "target_type" VARCHAR(40) NOT NULL,
  "target_id" VARCHAR(80),
  "adjustment_type" "ForecastAdjustmentType" NOT NULL,
  "value" DECIMAL(14,4) NOT NULL,
  "reason" TEXT,
  "created_by" VARCHAR(255),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "forecast_adjustments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "forecast_adjustments_forecast_run_id_idx"
  ON "forecast_adjustments"("forecast_run_id");
CREATE INDEX IF NOT EXISTS "forecast_adjustments_target_type_target_id_idx"
  ON "forecast_adjustments"("target_type", "target_id");
DO $$ BEGIN
  ALTER TABLE "forecast_adjustments" ADD CONSTRAINT "forecast_adjustments_forecast_run_id_fkey"
    FOREIGN KEY ("forecast_run_id") REFERENCES "forecast_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "forecast_events" (
  "id" UUID NOT NULL,
  "forecast_run_id" UUID NOT NULL,
  "event_type" "ForecastEventType" NOT NULL,
  "performed_by" VARCHAR(255),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "forecast_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "forecast_events_forecast_run_id_created_at_idx"
  ON "forecast_events"("forecast_run_id", "created_at");
DO $$ BEGIN
  ALTER TABLE "forecast_events" ADD CONSTRAINT "forecast_events_forecast_run_id_fkey"
    FOREIGN KEY ("forecast_run_id") REFERENCES "forecast_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
