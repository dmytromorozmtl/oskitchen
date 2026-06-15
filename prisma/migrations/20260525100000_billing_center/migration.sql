-- Billing & Subscription Center
-- Additive only. Existing `subscriptions` rows keep their plan/status/customer IDs.

DO $$ BEGIN
  CREATE TYPE "BillingMode" AS ENUM (
    'STRIPE', 'MANUAL', 'INTERNAL_FREE', 'ENTERPRISE_CONTRACT', 'DEV_DISABLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InvoiceRecordStatus" AS ENUM (
    'DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID', 'REFUNDED', 'PENDING'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- subscriptions: additive columns
ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "status_detail" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "billing_mode" "BillingMode" NOT NULL DEFAULT 'STRIPE',
  ADD COLUMN IF NOT EXISTS "stripe_price_id" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "current_period_start" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "current_period_end" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "trial_start" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "trial_end" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "metadata_json" JSONB,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "subscriptions_user_status_idx" ON "subscriptions"("user_id", "status");
CREATE INDEX IF NOT EXISTS "subscriptions_user_plan_idx" ON "subscriptions"("user_id", "plan");
CREATE INDEX IF NOT EXISTS "subscriptions_stripe_customer_idx" ON "subscriptions"("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "subscriptions_period_end_idx" ON "subscriptions"("current_period_end");

-- billing_customers
CREATE TABLE IF NOT EXISTS "billing_customers" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "stripe_customer_id" VARCHAR(255),
  "billing_email" VARCHAR(255),
  "billing_name" VARCHAR(255),
  "billing_mode" "BillingMode" NOT NULL DEFAULT 'STRIPE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "billing_customers_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "billing_customers"
    ADD CONSTRAINT "billing_customers_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "billing_customers_user_uniq" ON "billing_customers"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "billing_customers_stripe_uniq" ON "billing_customers"("stripe_customer_id");

-- usage_counters
CREATE TABLE IF NOT EXISTS "usage_counters" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "metric_key" VARCHAR(60) NOT NULL,
  "period_start" TIMESTAMP(3) NOT NULL,
  "period_end" TIMESTAMP(3) NOT NULL,
  "used" INTEGER NOT NULL DEFAULT 0,
  "hard_limit" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "usage_counters"
    ADD CONSTRAINT "usage_counters_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "usage_counters_user_metric_period_uniq"
  ON "usage_counters"("user_id", "metric_key", "period_start");
CREATE INDEX IF NOT EXISTS "usage_counters_user_metric_idx" ON "usage_counters"("user_id", "metric_key");
CREATE INDEX IF NOT EXISTS "usage_counters_user_period_end_idx" ON "usage_counters"("user_id", "period_end");

-- billing_events
CREATE TABLE IF NOT EXISTS "billing_events" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "event_type" VARCHAR(80) NOT NULL,
  "source" VARCHAR(32) NOT NULL DEFAULT 'internal',
  "stripe_event_id" VARCHAR(255),
  "performed_by_id" UUID,
  "summary" VARCHAR(500),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "billing_events"
    ADD CONSTRAINT "billing_events_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "billing_events"
    ADD CONSTRAINT "billing_events_actor_fkey"
    FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "billing_events_stripe_event_uniq" ON "billing_events"("stripe_event_id");
CREATE INDEX IF NOT EXISTS "billing_events_user_created_idx" ON "billing_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "billing_events_user_type_idx" ON "billing_events"("user_id", "event_type");

-- invoice_records
CREATE TABLE IF NOT EXISTS "invoice_records" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "stripe_invoice_id" VARCHAR(255),
  "number" VARCHAR(80),
  "status" "InvoiceRecordStatus" NOT NULL DEFAULT 'DRAFT',
  "amount_due_cents" INTEGER NOT NULL DEFAULT 0,
  "amount_paid_cents" INTEGER NOT NULL DEFAULT 0,
  "currency" VARCHAR(8) NOT NULL DEFAULT 'usd',
  "hosted_invoice_url" TEXT,
  "invoice_pdf_url" TEXT,
  "issued_at" TIMESTAMP(3),
  "paid_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "invoice_records_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "invoice_records"
    ADD CONSTRAINT "invoice_records_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "invoice_records_stripe_uniq" ON "invoice_records"("stripe_invoice_id");
CREATE INDEX IF NOT EXISTS "invoice_records_user_status_idx" ON "invoice_records"("user_id", "status");
CREATE INDEX IF NOT EXISTS "invoice_records_user_issued_idx" ON "invoice_records"("user_id", "issued_at");

-- entitlement_overrides
CREATE TABLE IF NOT EXISTS "entitlement_overrides" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "feature_key" VARCHAR(80) NOT NULL,
  "value_json" JSONB NOT NULL,
  "reason" VARCHAR(500),
  "expires_at" TIMESTAMP(3),
  "created_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "entitlement_overrides_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "entitlement_overrides"
    ADD CONSTRAINT "entitlement_overrides_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "entitlement_overrides"
    ADD CONSTRAINT "entitlement_overrides_actor_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "entitlement_overrides_user_feature_uniq"
  ON "entitlement_overrides"("user_id", "feature_key");
CREATE INDEX IF NOT EXISTS "entitlement_overrides_expires_idx"
  ON "entitlement_overrides"("user_id", "expires_at");
