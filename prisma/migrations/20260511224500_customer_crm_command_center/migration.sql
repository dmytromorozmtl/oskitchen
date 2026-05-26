-- Customer CRM Command Center: extend KitchenCustomer + add 9 new child tables.
-- Strictly additive. Old KitchenCustomer rows continue to work.

-- 1. New enums.
CREATE TYPE "CustomerType" AS ENUM (
  'INDIVIDUAL', 'HOUSEHOLD', 'COMPANY', 'CATERING_CLIENT', 'EVENT_CLIENT',
  'WHOLESALE_CLIENT', 'OFFICE_CLIENT', 'VIP_CLIENT', 'INTERNAL_TEST'
);
CREATE TYPE "CustomerStatus" AS ENUM (
  'ACTIVE', 'NEW', 'VIP', 'AT_RISK', 'INACTIVE', 'BLOCKED', 'ARCHIVED'
);
CREATE TYPE "CustomerSource" AS ENUM (
  'MANUAL', 'STOREFRONT', 'WOO_COMMERCE', 'SHOPIFY', 'UBER_EATS', 'IMPORT',
  'CATERING_QUOTE', 'EVENT_INQUIRY', 'PHONE_ORDER', 'EMAIL_ORDER',
  'BAR_EVENT_INQUIRY', 'BAKERY_PREORDER', 'MEAL_PLAN', 'CHANNEL_OTHER'
);
CREATE TYPE "CustomerNoteVisibility" AS ENUM ('INTERNAL', 'KITCHEN', 'DELIVERY', 'SALES');
CREATE TYPE "CustomerTimelineEventType" AS ENUM (
  'CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'ORDER_PLACED', 'ORDER_STATUS_CHANGED',
  'QUOTE_CREATED', 'QUOTE_UPDATED', 'IMPORT', 'MERGE', 'NOTE_ADDED',
  'FOLLOW_UP_CREATED', 'FOLLOW_UP_COMPLETED', 'CONSENT_CHANGED',
  'SEGMENT_JOINED', 'SEGMENT_LEFT', 'ALLERGY_CONFIRMED', 'CONTACTED', 'OTHER'
);
CREATE TYPE "CustomerMergeCandidateStatus" AS ENUM ('OPEN', 'MERGED', 'IGNORED');
CREATE TYPE "CustomerFollowUpType" AS ENUM (
  'GENERAL', 'QUOTE', 'EVENT', 'VIP', 'REACTIVATION', 'ISSUE',
  'ALLERGY_CONFIRMATION', 'MEAL_PLAN'
);
CREATE TYPE "CustomerFollowUpStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED', 'OVERDUE');
CREATE TYPE "CustomerConsentType" AS ENUM ('EMAIL_MARKETING', 'SMS_MARKETING', 'TRANSACTIONAL', 'THIRD_PARTY_SHARING');

-- 2. Extend "kitchen_customers" additively.
ALTER TABLE "kitchen_customers"
  ADD COLUMN IF NOT EXISTS "type"   "CustomerType"   NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN IF NOT EXISTS "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "first_name"   VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "last_name"    VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "display_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "company_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "job_title"    VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "company_account_id" UUID,
  ADD COLUMN IF NOT EXISTS "default_address_json" JSONB,
  ADD COLUMN IF NOT EXISTS "billing_address_json" JSONB,
  ADD COLUMN IF NOT EXISTS "delivery_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "dietary_preferences_json" JSONB,
  ADD COLUMN IF NOT EXISTS "allergies_json" JSONB,
  ADD COLUMN IF NOT EXISTS "dislikes_json" JSONB,
  ADD COLUMN IF NOT EXISTS "favorite_items_json" JSONB,
  ADD COLUMN IF NOT EXISTS "tags_json" JSONB,
  ADD COLUMN IF NOT EXISTS "source" "CustomerSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS "source_channel_id" UUID,
  ADD COLUMN IF NOT EXISTS "external_customer_id" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "preferred_brand_id" UUID,
  ADD COLUMN IF NOT EXISTS "preferred_location_id" UUID,
  ADD COLUMN IF NOT EXISTS "preferred_fulfillment_type" "FulfillmentType",
  ADD COLUMN IF NOT EXISTS "marketing_consent" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "sms_consent" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "consent_source" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "consent_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "first_order_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "last_order_at"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "total_orders"   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lifetime_value_cents"   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "average_order_value_cents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "repeat_purchase_rate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "at_risk_score" INTEGER,
  ADD COLUMN IF NOT EXISTS "last_contacted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "next_follow_up_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "kitchen_customers_user_id_status_idx"               ON "kitchen_customers"("user_id", "status");
CREATE INDEX IF NOT EXISTS "kitchen_customers_user_id_type_idx"                 ON "kitchen_customers"("user_id", "type");
CREATE INDEX IF NOT EXISTS "kitchen_customers_user_id_source_idx"               ON "kitchen_customers"("user_id", "source");
CREATE INDEX IF NOT EXISTS "kitchen_customers_user_id_last_order_at_idx"        ON "kitchen_customers"("user_id", "last_order_at");
CREATE INDEX IF NOT EXISTS "kitchen_customers_user_id_lifetime_value_cents_idx" ON "kitchen_customers"("user_id", "lifetime_value_cents");
CREATE INDEX IF NOT EXISTS "kitchen_customers_phone_idx"                        ON "kitchen_customers"("phone");
CREATE INDEX IF NOT EXISTS "kitchen_customers_preferred_brand_id_idx"           ON "kitchen_customers"("preferred_brand_id");
CREATE INDEX IF NOT EXISTS "kitchen_customers_preferred_location_id_idx"        ON "kitchen_customers"("preferred_location_id");

-- 3. customer_addresses
CREATE TABLE IF NOT EXISTS "customer_addresses" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "label" VARCHAR(120),
    "address_json" JSONB NOT NULL,
    "delivery_notes" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. customer_notes
CREATE TABLE IF NOT EXISTS "customer_notes" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "author_id" UUID,
    "note" TEXT NOT NULL,
    "visibility" "CustomerNoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "customer_notes_customer_id_created_at_idx" ON "customer_notes"("customer_id", "created_at");
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. customer_timeline_events
CREATE TABLE IF NOT EXISTS "customer_timeline_events" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "event_type" "CustomerTimelineEventType" NOT NULL,
    "source_type" VARCHAR(120),
    "source_id" UUID,
    "summary" VARCHAR(500),
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_timeline_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "customer_timeline_events_customer_id_created_at_idx" ON "customer_timeline_events"("customer_id", "created_at");
CREATE INDEX IF NOT EXISTS "customer_timeline_events_event_type_idx" ON "customer_timeline_events"("event_type");
ALTER TABLE "customer_timeline_events" ADD CONSTRAINT "customer_timeline_events_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. customer_segments
CREATE TABLE IF NOT EXISTS "customer_segments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "rules_json" JSONB,
    "color" VARCHAR(32),
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "built_in_key" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_segments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "customer_segments_user_id_name_key" ON "customer_segments"("user_id", "name");
CREATE INDEX IF NOT EXISTS "customer_segments_user_id_active_idx" ON "customer_segments"("user_id", "active");
ALTER TABLE "customer_segments" ADD CONSTRAINT "customer_segments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. customer_segment_memberships
CREATE TABLE IF NOT EXISTS "customer_segment_memberships" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "segment_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_segment_memberships_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "customer_segment_memberships_customer_id_segment_id_key" ON "customer_segment_memberships"("customer_id", "segment_id");
CREATE INDEX IF NOT EXISTS "customer_segment_memberships_segment_id_idx" ON "customer_segment_memberships"("segment_id");
ALTER TABLE "customer_segment_memberships" ADD CONSTRAINT "customer_segment_memberships_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_segment_memberships" ADD CONSTRAINT "customer_segment_memberships_segment_id_fkey"
  FOREIGN KEY ("segment_id") REFERENCES "customer_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. customer_merge_candidates
CREATE TABLE IF NOT EXISTS "customer_merge_candidates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "customer_a_id" UUID NOT NULL,
    "customer_b_id" UUID NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "reason_json" JSONB,
    "status" "CustomerMergeCandidateStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_merge_candidates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "customer_merge_candidates_user_id_customer_a_id_customer_b_id_key"
  ON "customer_merge_candidates"("user_id", "customer_a_id", "customer_b_id");
CREATE INDEX IF NOT EXISTS "customer_merge_candidates_user_id_status_idx" ON "customer_merge_candidates"("user_id", "status");
ALTER TABLE "customer_merge_candidates" ADD CONSTRAINT "customer_merge_candidates_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_merge_candidates" ADD CONSTRAINT "customer_merge_candidates_customer_a_id_fkey"
  FOREIGN KEY ("customer_a_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_merge_candidates" ADD CONSTRAINT "customer_merge_candidates_customer_b_id_fkey"
  FOREIGN KEY ("customer_b_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. customer_follow_ups
CREATE TABLE IF NOT EXISTS "customer_follow_ups" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "type" "CustomerFollowUpType" NOT NULL DEFAULT 'GENERAL',
    "due_at" TIMESTAMP(3),
    "status" "CustomerFollowUpStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_to_id" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_follow_ups_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "customer_follow_ups_user_id_status_idx" ON "customer_follow_ups"("user_id", "status");
CREATE INDEX IF NOT EXISTS "customer_follow_ups_user_id_due_at_idx" ON "customer_follow_ups"("user_id", "due_at");
CREATE INDEX IF NOT EXISTS "customer_follow_ups_customer_id_status_idx" ON "customer_follow_ups"("customer_id", "status");
ALTER TABLE "customer_follow_ups" ADD CONSTRAINT "customer_follow_ups_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_follow_ups" ADD CONSTRAINT "customer_follow_ups_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. customer_consent_events
CREATE TABLE IF NOT EXISTS "customer_consent_events" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "consent_type" "CustomerConsentType" NOT NULL,
    "value" BOOLEAN NOT NULL,
    "source" VARCHAR(120),
    "performed_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_consent_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "customer_consent_events_customer_id_created_at_idx" ON "customer_consent_events"("customer_id", "created_at");
ALTER TABLE "customer_consent_events" ADD CONSTRAINT "customer_consent_events_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 11. company_accounts
CREATE TABLE IF NOT EXISTS "company_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "billing_email" VARCHAR(255),
    "phone" VARCHAR(64),
    "address_json" JSONB,
    "primary_contact_id" UUID,
    "tags_json" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "company_accounts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "company_accounts_user_id_idx" ON "company_accounts"("user_id");
CREATE INDEX IF NOT EXISTS "company_accounts_user_id_name_idx" ON "company_accounts"("user_id", "name");
ALTER TABLE "company_accounts" ADD CONSTRAINT "company_accounts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_accounts" ADD CONSTRAINT "company_accounts_primary_contact_id_fkey"
  FOREIGN KEY ("primary_contact_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 12. FK from kitchen_customers.company_account_id → company_accounts(id) (after table exists)
ALTER TABLE "kitchen_customers" ADD CONSTRAINT "kitchen_customers_company_account_id_fkey"
  FOREIGN KEY ("company_account_id") REFERENCES "company_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
