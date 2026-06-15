-- Idempotent repair: storefront follow-up columns (when migrate deploy was skipped).
-- Safe to run multiple times.

ALTER TYPE "StorefrontFormKind" ADD VALUE IF NOT EXISTS 'WHOLESALE_INQUIRY';
ALTER TYPE "StorefrontFormKind" ADD VALUE IF NOT EXISTS 'EVENT_INQUIRY';
ALTER TYPE "StorefrontFormKind" ADD VALUE IF NOT EXISTS 'FEEDBACK';
ALTER TYPE "StorefrontFormKind" ADD VALUE IF NOT EXISTS 'CUSTOM_REQUEST';

ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "analytics_consent_mode" VARCHAR(32) NOT NULL DEFAULT 'ENABLED_NO_BANNER';
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "analytics_consent_banner_text" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "analytics_exclude_test_orders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "first_party_analytics_mode" VARCHAR(32) NOT NULL DEFAULT 'ALWAYS_ON';
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "public_contact_form_id" UUID;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "public_catering_form_id" UUID;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "custom_domain_last_checked_at" TIMESTAMP(3);
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "custom_domain_last_error" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "theme_draft_json" JSONB;

ALTER TABLE "storefront_redirects" ADD COLUMN IF NOT EXISTS "http_status" INTEGER NOT NULL DEFAULT 302;
ALTER TABLE "storefront_redirects" ADD COLUMN IF NOT EXISTS "hit_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "storefront_pages" ADD COLUMN IF NOT EXISTS "linked_form_id" UUID;

ALTER TABLE "storefront_forms" ADD COLUMN IF NOT EXISTS "archived" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "storefront_form_submissions" ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP(3);

DO $$
BEGIN
  ALTER TABLE "storefront_settings" ADD CONSTRAINT "storefront_settings_public_contact_form_id_fkey" FOREIGN KEY ("public_contact_form_id") REFERENCES "storefront_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE "storefront_settings" ADD CONSTRAINT "storefront_settings_public_catering_form_id_fkey" FOREIGN KEY ("public_catering_form_id") REFERENCES "storefront_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_settings_public_contact_form_id_key" ON "storefront_settings"("public_contact_form_id");
CREATE UNIQUE INDEX IF NOT EXISTS "storefront_settings_public_catering_form_id_key" ON "storefront_settings"("public_catering_form_id");

DO $$
BEGIN
  ALTER TABLE "storefront_pages" ADD CONSTRAINT "storefront_pages_linked_form_id_fkey" FOREIGN KEY ("linked_form_id") REFERENCES "storefront_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "storefront_fulfillment_rules" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
