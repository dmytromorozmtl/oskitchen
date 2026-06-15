-- Executive Command Center

DO $$ BEGIN
  CREATE TYPE "ExecutivePeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExecutiveInsightSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'SUCCESS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExecutiveInsightStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "executive_snapshots" (
    "id"                          UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"                     UUID NOT NULL,
    "snapshot_date"               DATE NOT NULL,
    "period_type"                 "ExecutivePeriodType" NOT NULL,
    "revenue"                     DECIMAL(14, 2) NOT NULL DEFAULT 0,
    "order_count"                 INTEGER NOT NULL DEFAULT 0,
    "average_order_value"         DECIMAL(12, 2),
    "customer_count"              INTEGER NOT NULL DEFAULT 0,
    "repeat_customer_rate"        DOUBLE PRECISION,
    "production_completion_rate"  DOUBLE PRECISION,
    "packing_accuracy_rate"       DOUBLE PRECISION,
    "delivery_completion_rate"    DOUBLE PRECISION,
    "margin_estimate"             DOUBLE PRECISION,
    "inventory_alert_count"       INTEGER NOT NULL DEFAULT 0,
    "open_task_count"             INTEGER NOT NULL DEFAULT 0,
    "overdue_task_count"          INTEGER NOT NULL DEFAULT 0,
    "top_channel"                 VARCHAR(64),
    "top_brand_id"                UUID,
    "top_location_id"             UUID,
    "payload_json"                JSONB,
    "created_at"                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "executive_snapshots_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'executive_snapshots_user_fkey') THEN
    ALTER TABLE "executive_snapshots"
      ADD CONSTRAINT "executive_snapshots_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "executive_snapshots_user_date_period_key"
  ON "executive_snapshots"("user_id", "snapshot_date", "period_type");
CREATE INDEX IF NOT EXISTS "executive_snapshots_user_date_idx"
  ON "executive_snapshots"("user_id", "snapshot_date");
CREATE INDEX IF NOT EXISTS "executive_snapshots_period_idx"
  ON "executive_snapshots"("period_type");

CREATE TABLE IF NOT EXISTS "executive_insights" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"       UUID NOT NULL,
    "type"          VARCHAR(80) NOT NULL,
    "severity"      "ExecutiveInsightSeverity" NOT NULL DEFAULT 'INFO',
    "status"        "ExecutiveInsightStatus" NOT NULL DEFAULT 'OPEN',
    "title"         VARCHAR(255) NOT NULL,
    "description"   TEXT NOT NULL,
    "action_label"  VARCHAR(120),
    "action_route"  VARCHAR(512),
    "source_type"   VARCHAR(80),
    "source_id"     VARCHAR(120),
    "metadata_json" JSONB,
    "resolved_at"   TIMESTAMP(3),
    "resolved_by"   VARCHAR(255),
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "executive_insights_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'executive_insights_user_fkey') THEN
    ALTER TABLE "executive_insights"
      ADD CONSTRAINT "executive_insights_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "executive_insights_user_status_idx"
  ON "executive_insights"("user_id", "status");
CREATE INDEX IF NOT EXISTS "executive_insights_user_severity_idx"
  ON "executive_insights"("user_id", "severity");
CREATE INDEX IF NOT EXISTS "executive_insights_user_type_idx"
  ON "executive_insights"("user_id", "type");
