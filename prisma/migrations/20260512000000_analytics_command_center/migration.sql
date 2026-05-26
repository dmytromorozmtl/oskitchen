-- Analytics Command Center: additive.

CREATE TYPE "AnalyticsPeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

CREATE TYPE "AnalyticsAlertType" AS ENUM (
  'LATE_PACKING_RATE',
  'PRODUCTION_OVERLOAD',
  'CATERING_EVENT_CONFLICT',
  'LOW_REPEAT_RATE',
  'DECLINING_REVENUE',
  'RISING_CANCELLATIONS',
  'ROUTE_OVERLOAD',
  'HIGH_RISK_SHORTAGE',
  'VIP_CHURN_RISK'
);

CREATE TYPE "AnalyticsEventType" AS ENUM (
  'SNAPSHOT_GENERATED',
  'VIEW_SAVED',
  'VIEW_DELETED',
  'ALERT_TRIGGERED',
  'ALERT_DISMISSED',
  'EXPORT_REQUESTED',
  'OTHER'
);

CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "snapshot_date" DATE NOT NULL,
  "period_type" "AnalyticsPeriodType" NOT NULL,
  "range_start" TIMESTAMP(3) NOT NULL,
  "range_end" TIMESTAMP(3) NOT NULL,
  "gross_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "net_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "order_count" INTEGER NOT NULL DEFAULT 0,
  "average_order_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "repeat_rate" DECIMAL(6,4) NOT NULL DEFAULT 0,
  "new_customer_count" INTEGER NOT NULL DEFAULT 0,
  "active_customer_count" INTEGER NOT NULL DEFAULT 0,
  "cancelled_orders" INTEGER NOT NULL DEFAULT 0,
  "late_orders" INTEGER NOT NULL DEFAULT 0,
  "production_completion_rate" DECIMAL(6,4) NOT NULL DEFAULT 0,
  "packing_completion_rate" DECIMAL(6,4) NOT NULL DEFAULT 0,
  "delivery_completion_rate" DECIMAL(6,4) NOT NULL DEFAULT 0,
  "catering_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "meal_plan_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "top_channel" VARCHAR(64),
  "top_brand_id" UUID,
  "top_location_id" UUID,
  "payload_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "analytics_snapshots_user_id_snapshot_date_idx"
  ON "analytics_snapshots"("user_id", "snapshot_date");
CREATE INDEX IF NOT EXISTS "analytics_snapshots_user_id_period_type_snapshot_date_idx"
  ON "analytics_snapshots"("user_id", "period_type", "snapshot_date");
DO $$ BEGIN
  ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "source_type" VARCHAR(64) NOT NULL,
  "source_id" VARCHAR(128),
  "event_type" "AnalyticsEventType" NOT NULL,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "analytics_events_user_id_created_at_idx"
  ON "analytics_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "analytics_events_user_id_event_type_idx"
  ON "analytics_events"("user_id", "event_type");
CREATE INDEX IF NOT EXISTS "analytics_events_source_type_idx"
  ON "analytics_events"("source_type");
DO $$ BEGIN
  ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "analytics_saved_views" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "tab" VARCHAR(64),
  "filters_json" JSONB,
  "layout_json" JSONB,
  "is_shared" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_saved_views_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "analytics_saved_views_user_id_name_key"
  ON "analytics_saved_views"("user_id", "name");
CREATE INDEX IF NOT EXISTS "analytics_saved_views_user_id_tab_idx"
  ON "analytics_saved_views"("user_id", "tab");
DO $$ BEGIN
  ALTER TABLE "analytics_saved_views" ADD CONSTRAINT "analytics_saved_views_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "analytics_alerts" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "AnalyticsAlertType" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "threshold_json" JSONB,
  "last_triggered" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_alerts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "analytics_alerts_user_id_type_key"
  ON "analytics_alerts"("user_id", "type");
CREATE INDEX IF NOT EXISTS "analytics_alerts_user_id_enabled_idx"
  ON "analytics_alerts"("user_id", "enabled");
DO $$ BEGIN
  ALTER TABLE "analytics_alerts" ADD CONSTRAINT "analytics_alerts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
