-- Catering Quotes Command Center: additive. Existing rows preserved.

-- 1. Extend CateringQuoteStatus enum.
ALTER TYPE "CateringQuoteStatus" ADD VALUE IF NOT EXISTS 'READY_TO_SEND';
ALTER TYPE "CateringQuoteStatus" ADD VALUE IF NOT EXISTS 'VIEWED';
ALTER TYPE "CateringQuoteStatus" ADD VALUE IF NOT EXISTS 'NEEDS_REVISION';
ALTER TYPE "CateringQuoteStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "CateringQuoteStatus" ADD VALUE IF NOT EXISTS 'CONVERTED_TO_ORDER';
ALTER TYPE "CateringQuoteStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "CateringQuoteStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- 2. New enums.
CREATE TYPE "CateringEventType" AS ENUM (
  'CORPORATE_LUNCH', 'WEDDING', 'PRIVATE_PARTY', 'OFFICE_EVENT', 'BAR_EVENT',
  'HOLIDAY_EVENT', 'DROP_OFF_CATERING', 'FULL_SERVICE_CATERING',
  'PICKUP_CATERING', 'CUSTOM'
);
CREATE TYPE "CateringServiceStyle" AS ENUM (
  'DROP_OFF', 'PICKUP', 'BUFFET', 'FAMILY_STYLE', 'PLATED',
  'BOXED_MEALS', 'TRAYS', 'BAR_SERVICE_PLACEHOLDER', 'CUSTOM'
);
CREATE TYPE "CateringPricingMode" AS ENUM (
  'FIXED', 'PER_PERSON', 'PER_PACKAGE', 'PER_TRAY', 'HOURLY_SERVICE', 'CUSTOM_QUOTE'
);
CREATE TYPE "CateringQuoteLineType" AS ENUM (
  'FOOD', 'BEVERAGE', 'SERVICE', 'DELIVERY', 'SETUP',
  'STAFFING', 'RENTAL', 'DISCOUNT', 'CUSTOM'
);
CREATE TYPE "CateringQuoteAuditEventType" AS ENUM (
  'QUOTE_CREATED', 'QUOTE_UPDATED', 'QUOTE_STATUS_CHANGED',
  'QUOTE_VERSION_SAVED', 'QUOTE_VERSION_RESTORED',
  'QUOTE_REVISION_REQUESTED', 'QUOTE_PUBLIC_LINK_GENERATED',
  'QUOTE_PUBLIC_LINK_REVOKED', 'QUOTE_PROPOSAL_VIEWED',
  'QUOTE_FOLLOW_UP_CREATED', 'QUOTE_FOLLOW_UP_COMPLETED',
  'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'QUOTE_CONVERTED_TO_ORDER',
  'QUOTE_CANCELLED', 'QUOTE_ARCHIVED', 'QUOTE_NOTE_ADDED', 'OTHER'
);
CREATE TYPE "CateringQuoteFollowUpStatus" AS ENUM (
  'PENDING', 'COMPLETED', 'CANCELLED'
);

-- 3. Extend catering_quotes with the additive columns.
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "customer_id" UUID;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "company_account_id" UUID;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "brand_id" UUID;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "location_id" UUID;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "quote_number" VARCHAR(40);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "customer_phone" VARCHAR(64);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "event_name" VARCHAR(255);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "event_type" "CateringEventType" NOT NULL DEFAULT 'CUSTOM';
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "service_style" "CateringServiceStyle" NOT NULL DEFAULT 'DROP_OFF';
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "pricing_mode" "CateringPricingMode" NOT NULL DEFAULT 'FIXED';
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "event_start_time" TIMESTAMP(3);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "event_end_time" TIMESTAMP(3);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "event_address_json" JSONB;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "delivery_required" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "setup_required" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "staffing_required" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "dietary_notes" TEXT;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "allergy_notes" TEXT;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "internal_notes" TEXT;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "client_notes" TEXT;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "service_fee" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "delivery_fee" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "setup_fee" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "staffing_fee" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "discount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "estimated_cost" DECIMAL(12,2);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "estimated_margin" DECIMAL(12,2);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "valid_until" DATE;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "public_viewed_at" TIMESTAMP(3);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "accepted_at" TIMESTAMP(3);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3);
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "converted_order_id" UUID;
ALTER TABLE "catering_quotes" ADD COLUMN IF NOT EXISTS "created_by" VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS "catering_quotes_converted_order_id_key"
  ON "catering_quotes"("converted_order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "catering_quotes_user_id_quote_number_key"
  ON "catering_quotes"("user_id", "quote_number");
CREATE INDEX IF NOT EXISTS "catering_quotes_user_id_status_idx" ON "catering_quotes"("user_id", "status");
CREATE INDEX IF NOT EXISTS "catering_quotes_customer_id_idx" ON "catering_quotes"("customer_id");
CREATE INDEX IF NOT EXISTS "catering_quotes_company_account_id_idx" ON "catering_quotes"("company_account_id");
CREATE INDEX IF NOT EXISTS "catering_quotes_brand_id_idx" ON "catering_quotes"("brand_id");
CREATE INDEX IF NOT EXISTS "catering_quotes_location_id_idx" ON "catering_quotes"("location_id");
CREATE INDEX IF NOT EXISTS "catering_quotes_event_date_idx" ON "catering_quotes"("event_date");
CREATE INDEX IF NOT EXISTS "catering_quotes_customer_email_idx" ON "catering_quotes"("customer_email");

DO $$ BEGIN
  ALTER TABLE "catering_quotes" ADD CONSTRAINT "catering_quotes_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "catering_quotes" ADD CONSTRAINT "catering_quotes_company_account_id_fkey"
    FOREIGN KEY ("company_account_id") REFERENCES "company_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "catering_quotes" ADD CONSTRAINT "catering_quotes_brand_id_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "catering_quotes" ADD CONSTRAINT "catering_quotes_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "catering_quotes" ADD CONSTRAINT "catering_quotes_converted_order_id_fkey"
    FOREIGN KEY ("converted_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Extend catering_quote_items.
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "menu_id" UUID;
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "line_type" "CateringQuoteLineType" NOT NULL DEFAULT 'FOOD';
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "unit" VARCHAR(40);
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "cost_estimate" DECIMAL(12,2);
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "margin_estimate" DECIMAL(12,2);
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "catering_quote_items" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "catering_quote_items_quote_id_sort_order_idx" ON "catering_quote_items"("quote_id", "sort_order");
CREATE INDEX IF NOT EXISTS "catering_quote_items_product_id_idx" ON "catering_quote_items"("product_id");

DO $$ BEGIN
  ALTER TABLE "catering_quote_items" ADD CONSTRAINT "catering_quote_items_menu_id_fkey"
    FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. catering_quote_packages
CREATE TABLE IF NOT EXISTS "catering_quote_packages" (
  "id" UUID NOT NULL,
  "quote_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "guest_count" INTEGER,
  "price_per_person" DECIMAL(12,2),
  "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "lines_json" JSONB,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catering_quote_packages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "catering_quote_packages_quote_id_idx" ON "catering_quote_packages"("quote_id");
DO $$ BEGIN
  ALTER TABLE "catering_quote_packages" ADD CONSTRAINT "catering_quote_packages_quote_id_fkey"
    FOREIGN KEY ("quote_id") REFERENCES "catering_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. catering_quote_events
CREATE TABLE IF NOT EXISTS "catering_quote_events" (
  "id" UUID NOT NULL,
  "quote_id" UUID NOT NULL,
  "event_type" "CateringQuoteAuditEventType" NOT NULL,
  "performed_by" VARCHAR(255),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catering_quote_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "catering_quote_events_quote_id_created_at_idx"
  ON "catering_quote_events"("quote_id", "created_at");
DO $$ BEGIN
  ALTER TABLE "catering_quote_events" ADD CONSTRAINT "catering_quote_events_quote_id_fkey"
    FOREIGN KEY ("quote_id") REFERENCES "catering_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. catering_quote_versions
CREATE TABLE IF NOT EXISTS "catering_quote_versions" (
  "id" UUID NOT NULL,
  "quote_id" UUID NOT NULL,
  "version_number" INTEGER NOT NULL,
  "snapshot_json" JSONB NOT NULL,
  "created_by" VARCHAR(255),
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catering_quote_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "catering_quote_versions_quote_id_version_number_key"
  ON "catering_quote_versions"("quote_id", "version_number");
CREATE INDEX IF NOT EXISTS "catering_quote_versions_quote_id_created_at_idx"
  ON "catering_quote_versions"("quote_id", "created_at");
DO $$ BEGIN
  ALTER TABLE "catering_quote_versions" ADD CONSTRAINT "catering_quote_versions_quote_id_fkey"
    FOREIGN KEY ("quote_id") REFERENCES "catering_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. catering_proposal_views
CREATE TABLE IF NOT EXISTS "catering_proposal_views" (
  "id" UUID NOT NULL,
  "quote_id" UUID NOT NULL,
  "public_token" VARCHAR(64) NOT NULL,
  "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip_hash" VARCHAR(80),
  "user_agent_hash" VARCHAR(80),
  CONSTRAINT "catering_proposal_views_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "catering_proposal_views_quote_id_viewed_at_idx"
  ON "catering_proposal_views"("quote_id", "viewed_at");
CREATE INDEX IF NOT EXISTS "catering_proposal_views_public_token_idx"
  ON "catering_proposal_views"("public_token");
DO $$ BEGIN
  ALTER TABLE "catering_proposal_views" ADD CONSTRAINT "catering_proposal_views_quote_id_fkey"
    FOREIGN KEY ("quote_id") REFERENCES "catering_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 9. catering_quote_followups
CREATE TABLE IF NOT EXISTS "catering_quote_followups" (
  "id" UUID NOT NULL,
  "quote_id" UUID NOT NULL,
  "customer_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "due_at" TIMESTAMP(3) NOT NULL,
  "status" "CateringQuoteFollowUpStatus" NOT NULL DEFAULT 'PENDING',
  "assigned_to_id" UUID,
  "completed_at" TIMESTAMP(3),
  "created_by" VARCHAR(255),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catering_quote_followups_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "catering_quote_followups_quote_id_status_idx"
  ON "catering_quote_followups"("quote_id", "status");
CREATE INDEX IF NOT EXISTS "catering_quote_followups_due_at_status_idx"
  ON "catering_quote_followups"("due_at", "status");
CREATE INDEX IF NOT EXISTS "catering_quote_followups_customer_id_idx"
  ON "catering_quote_followups"("customer_id");
DO $$ BEGIN
  ALTER TABLE "catering_quote_followups" ADD CONSTRAINT "catering_quote_followups_quote_id_fkey"
    FOREIGN KEY ("quote_id") REFERENCES "catering_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "catering_quote_followups" ADD CONSTRAINT "catering_quote_followups_customer_id_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 10. catering_quote_templates
CREATE TABLE IF NOT EXISTS "catering_quote_templates" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "event_type" "CateringEventType" NOT NULL DEFAULT 'CUSTOM',
  "service_style" "CateringServiceStyle" NOT NULL DEFAULT 'DROP_OFF',
  "pricing_mode" "CateringPricingMode" NOT NULL DEFAULT 'FIXED',
  "default_lines_json" JSONB,
  "default_fees_json" JSONB,
  "default_notes_json" JSONB,
  "client_copy" TEXT,
  "internal_checklist" TEXT,
  "built_in_key" VARCHAR(80),
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catering_quote_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "catering_quote_templates_user_id_name_key"
  ON "catering_quote_templates"("user_id", "name");
CREATE INDEX IF NOT EXISTS "catering_quote_templates_user_id_active_idx"
  ON "catering_quote_templates"("user_id", "active");
DO $$ BEGIN
  ALTER TABLE "catering_quote_templates" ADD CONSTRAINT "catering_quote_templates_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
