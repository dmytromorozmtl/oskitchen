-- Product Mapping Workbench expansion
-- Additive: extends ProductMappingStatus enum, adds new enums
-- (Confidence / Provider / EventType / ModifierStatus), augments
-- product_mappings with brand/location/sales-channel scoping, audit
-- fields, modifier and alias support tables, and an import-batch log.

-- Extend ProductMappingStatus enum
ALTER TYPE "ProductMappingStatus" ADD VALUE IF NOT EXISTS 'UNMAPPED';
ALTER TYPE "ProductMappingStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "ProductMappingStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "ProductMappingStatus" ADD VALUE IF NOT EXISTS 'CONFLICT';
ALTER TYPE "ProductMappingStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

DO $$ BEGIN
  CREATE TYPE "ProductMappingConfidence" AS ENUM (
    'EXACT_SKU',
    'EXACT_TITLE',
    'HIGH',
    'MEDIUM',
    'LOW',
    'NONE',
    'MANUAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProductMappingProvider" AS ENUM (
    'SHOPIFY',
    'WOOCOMMERCE',
    'UBER_EATS',
    'UBER_DIRECT',
    'CSV',
    'STOREFRONT',
    'MANUAL',
    'DOORDASH_PLACEHOLDER',
    'CUSTOM'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProductMappingEventType" AS ENUM (
    'CREATED',
    'SUGGESTED',
    'APPROVED',
    'REJECTED',
    'CHANGED',
    'ARCHIVED',
    'ALIAS_CREATED',
    'CONFLICT_OPENED',
    'CONFLICT_RESOLVED',
    'BULK_APPLIED',
    'MODIFIER_MAPPED',
    'RESYNCED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProductModifierMappingStatus" AS ENUM (
    'UNMAPPED',
    'SUGGESTED',
    'APPROVED',
    'REJECTED',
    'IGNORED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Augment product_mappings
ALTER TABLE "product_mappings"
  ADD COLUMN IF NOT EXISTS "brand_id" UUID,
  ADD COLUMN IF NOT EXISTS "location_id" UUID,
  ADD COLUMN IF NOT EXISTS "sales_channel_id" UUID,
  ADD COLUMN IF NOT EXISTS "provider_key" "ProductMappingProvider",
  ADD COLUMN IF NOT EXISTS "external_variant_title" VARCHAR(512),
  ADD COLUMN IF NOT EXISTS "external_category" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "external_raw_json" JSONB,
  ADD COLUMN IF NOT EXISTS "internal_variant_id" UUID,
  ADD COLUMN IF NOT EXISTS "confidence_label" "ProductMappingConfidence",
  ADD COLUMN IF NOT EXISTS "confidence_score" DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS "match_reason_json" JSONB,
  ADD COLUMN IF NOT EXISTS "approved_by_id" UUID,
  ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejected_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "last_seen_at" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "product_mappings"
    ADD CONSTRAINT "product_mappings_approved_by_id_fkey"
    FOREIGN KEY ("approved_by_id") REFERENCES "users"("id")
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "product_mappings_user_provider_key_idx"
  ON "product_mappings" ("user_id", "provider_key");
CREATE INDEX IF NOT EXISTS "product_mappings_external_sku_idx"
  ON "product_mappings" ("external_sku");
CREATE INDEX IF NOT EXISTS "product_mappings_external_product_id_idx"
  ON "product_mappings" ("external_product_id");
CREATE INDEX IF NOT EXISTS "product_mappings_user_confidence_idx"
  ON "product_mappings" ("user_id", "confidence_label");
CREATE INDEX IF NOT EXISTS "product_mappings_user_sales_channel_idx"
  ON "product_mappings" ("user_id", "sales_channel_id");
CREATE INDEX IF NOT EXISTS "product_mappings_user_brand_idx"
  ON "product_mappings" ("user_id", "brand_id");
CREATE INDEX IF NOT EXISTS "product_mappings_user_location_idx"
  ON "product_mappings" ("user_id", "location_id");

-- product_mapping_aliases
CREATE TABLE IF NOT EXISTS "product_mapping_aliases" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "brand_id" UUID,
  "external_title" VARCHAR(512) NOT NULL,
  "normalized_title" VARCHAR(512) NOT NULL,
  "provider" "ProductMappingProvider",
  "internal_product_id" UUID NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_mapping_aliases_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "product_mapping_aliases"
    ADD CONSTRAINT "product_mapping_aliases_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_mapping_aliases"
    ADD CONSTRAINT "product_mapping_aliases_internal_product_id_fkey"
    FOREIGN KEY ("internal_product_id") REFERENCES "products"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "product_mapping_aliases_user_normalized_idx"
  ON "product_mapping_aliases" ("user_id", "normalized_title");
CREATE INDEX IF NOT EXISTS "product_mapping_aliases_user_provider_idx"
  ON "product_mapping_aliases" ("user_id", "provider");
CREATE INDEX IF NOT EXISTS "product_mapping_aliases_internal_product_idx"
  ON "product_mapping_aliases" ("internal_product_id");

-- product_modifier_mappings
CREATE TABLE IF NOT EXISTS "product_modifier_mappings" (
  "id" UUID NOT NULL,
  "product_mapping_id" UUID NOT NULL,
  "provider" "ProductMappingProvider" NOT NULL,
  "external_modifier_id" VARCHAR(255),
  "external_modifier_name" VARCHAR(255) NOT NULL,
  "external_option_name" VARCHAR(255),
  "internal_modifier_key" VARCHAR(255),
  "internal_option_value" VARCHAR(255),
  "status" "ProductModifierMappingStatus" NOT NULL DEFAULT 'UNMAPPED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_modifier_mappings_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "product_modifier_mappings"
    ADD CONSTRAINT "product_modifier_mappings_product_mapping_id_fkey"
    FOREIGN KEY ("product_mapping_id") REFERENCES "product_mappings"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "product_modifier_mappings_mapping_idx"
  ON "product_modifier_mappings" ("product_mapping_id");
CREATE INDEX IF NOT EXISTS "product_modifier_mappings_provider_idx"
  ON "product_modifier_mappings" ("provider");
CREATE INDEX IF NOT EXISTS "product_modifier_mappings_status_idx"
  ON "product_modifier_mappings" ("status");

-- product_mapping_events
CREATE TABLE IF NOT EXISTS "product_mapping_events" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "mapping_id" UUID,
  "event_type" "ProductMappingEventType" NOT NULL,
  "performed_by_id" UUID,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_mapping_events_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "product_mapping_events"
    ADD CONSTRAINT "product_mapping_events_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_mapping_events"
    ADD CONSTRAINT "product_mapping_events_performed_by_id_fkey"
    FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_mapping_events"
    ADD CONSTRAINT "product_mapping_events_mapping_id_fkey"
    FOREIGN KEY ("mapping_id") REFERENCES "product_mappings"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "product_mapping_events_user_created_idx"
  ON "product_mapping_events" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "product_mapping_events_mapping_idx"
  ON "product_mapping_events" ("mapping_id");

-- product_mapping_import_batches
CREATE TABLE IF NOT EXISTS "product_mapping_import_batches" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "provider" "ProductMappingProvider" NOT NULL,
  "source_type" VARCHAR(64) NOT NULL,
  "total_rows" INTEGER NOT NULL DEFAULT 0,
  "unmapped_count" INTEGER NOT NULL DEFAULT 0,
  "suggested_count" INTEGER NOT NULL DEFAULT 0,
  "approved_count" INTEGER NOT NULL DEFAULT 0,
  "conflict_count" INTEGER NOT NULL DEFAULT 0,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_mapping_import_batches_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "product_mapping_import_batches"
    ADD CONSTRAINT "product_mapping_import_batches_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "product_mapping_import_batches_user_created_idx"
  ON "product_mapping_import_batches" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "product_mapping_import_batches_user_provider_idx"
  ON "product_mapping_import_batches" ("user_id", "provider");
