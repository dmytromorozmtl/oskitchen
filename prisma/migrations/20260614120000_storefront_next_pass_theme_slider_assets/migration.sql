-- Storefront section type: slider
ALTER TYPE "StorefrontSectionType" ADD VALUE 'SLIDER';

-- Theme draft/publish snapshots on storefront_settings
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "theme_draft_json" JSONB;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "theme_published_json" JSONB;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "theme_published_at" TIMESTAMPTZ;
ALTER TABLE "storefront_settings" ADD COLUMN IF NOT EXISTS "theme_published_by_id" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'storefront_settings_theme_published_by_id_fkey'
  ) THEN
    ALTER TABLE "storefront_settings"
      ADD CONSTRAINT "storefront_settings_theme_published_by_id_fkey"
      FOREIGN KEY ("theme_published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Storefront assets: storage metadata + audit fields
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "storage_provider" VARCHAR(32);
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "storage_key" TEXT;
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "mime_type" VARCHAR(120);
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "size_bytes" INTEGER;
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "alt_text" VARCHAR(500);
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "usage_type" VARCHAR(64);
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "created_by_user_id" UUID;
ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'storefront_assets_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE "storefront_assets"
      ADD CONSTRAINT "storefront_assets_created_by_user_id_fkey"
      FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
