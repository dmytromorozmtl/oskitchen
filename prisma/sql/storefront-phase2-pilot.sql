-- Idempotent Phase 2 storefront schema (variants, modifiers, customers, Stripe Connect).
-- Safe to run multiple times. Does not touch subdomain/custom_domain partial unique indexes.

-- Stripe Connect on storefront_settings
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "stripe_connect_account_id" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "stripe_connect_charges_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "stripe_connect_payouts_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "stripe_connect_details_submitted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "stripe_connect_onboarded_at" TIMESTAMP(3);
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "stripe_application_fee_bps" INTEGER;

-- Order line variant
ALTER TABLE "storefront_order_items" ADD COLUMN IF NOT EXISTS "variant_id" UUID;

CREATE TABLE IF NOT EXISTS "storefront_product_variants" (
  "id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "sku" VARCHAR(64),
  "title" VARCHAR(255) NOT NULL,
  "price_adjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "price_override" DECIMAL(10,2),
  "sold_out" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_product_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_modifier_groups" (
  "id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "product_id" UUID,
  "name" VARCHAR(120) NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "min_selections" INTEGER NOT NULL DEFAULT 0,
  "max_selections" INTEGER NOT NULL DEFAULT 1,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_modifier_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_modifier_options" (
  "id" UUID NOT NULL,
  "group_id" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "price_adjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_modifier_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_customers" (
  "id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "supabase_user_id" UUID,
  "last_order_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_customers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "storefront_product_variants_storefront_id_product_id_idx"
  ON "storefront_product_variants"("storefront_id", "product_id");
CREATE INDEX IF NOT EXISTS "storefront_product_variants_product_id_active_idx"
  ON "storefront_product_variants"("product_id", "active");

CREATE INDEX IF NOT EXISTS "storefront_modifier_groups_storefront_id_product_id_idx"
  ON "storefront_modifier_groups"("storefront_id", "product_id");
CREATE INDEX IF NOT EXISTS "storefront_modifier_options_group_id_active_idx"
  ON "storefront_modifier_options"("group_id", "active");

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_customers_supabase_user_id_key"
  ON "storefront_customers"("supabase_user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "storefront_customers_storefront_id_email_key"
  ON "storefront_customers"("storefront_id", "email");
CREATE INDEX IF NOT EXISTS "storefront_customers_storefront_id_supabase_user_id_idx"
  ON "storefront_customers"("storefront_id", "supabase_user_id");

CREATE INDEX IF NOT EXISTS "storefront_order_items_variant_id_idx"
  ON "storefront_order_items"("variant_id");

DO $$
BEGIN
  ALTER TABLE "storefront_product_variants"
    ADD CONSTRAINT "storefront_product_variants_storefront_id_fkey"
    FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "storefront_product_variants"
    ADD CONSTRAINT "storefront_product_variants_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "storefront_modifier_groups"
    ADD CONSTRAINT "storefront_modifier_groups_storefront_id_fkey"
    FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "storefront_modifier_groups"
    ADD CONSTRAINT "storefront_modifier_groups_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "storefront_modifier_options"
    ADD CONSTRAINT "storefront_modifier_options_group_id_fkey"
    FOREIGN KEY ("group_id") REFERENCES "storefront_modifier_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "storefront_customers"
    ADD CONSTRAINT "storefront_customers_storefront_id_fkey"
    FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "storefront_order_items"
    ADD CONSTRAINT "storefront_order_items_variant_id_fkey"
    FOREIGN KEY ("variant_id") REFERENCES "storefront_product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
