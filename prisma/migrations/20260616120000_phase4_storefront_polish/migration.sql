-- Phase 4: storefront CMS, SEO, commerce, ops

ALTER TABLE "storefront_pages"
  ADD COLUMN IF NOT EXISTS "robots_noindex" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "publish_at" TIMESTAMP(3);

ALTER TABLE "storefront_settings"
  ADD COLUMN IF NOT EXISTS "staff_can_edit_storefront" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "storefront_seo_title" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "storefront_seo_description" TEXT,
  ADD COLUMN IF NOT EXISTS "storefront_og_image_url" TEXT;

ALTER TABLE "menus"
  ADD COLUMN IF NOT EXISTS "collection_slug" VARCHAR(160);

CREATE UNIQUE INDEX IF NOT EXISTS "menus_user_id_collection_slug_key"
  ON "menus"("user_id", "collection_slug")
  WHERE "collection_slug" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "storefront_cart_recoveries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "customer_email" VARCHAR(255),
  "cart_json" JSONB NOT NULL,
  "recovery_token" VARCHAR(64) NOT NULL,
  "emailed_1h_at" TIMESTAMP(3),
  "emailed_24h_at" TIMESTAMP(3),
  "converted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_cart_recoveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_cart_recoveries_recovery_token_key"
  ON "storefront_cart_recoveries"("recovery_token");

CREATE INDEX IF NOT EXISTS "storefront_cart_recoveries_storefront_id_created_at_idx"
  ON "storefront_cart_recoveries"("storefront_id", "created_at");

ALTER TABLE "storefront_cart_recoveries"
  ADD CONSTRAINT "storefront_cart_recoveries_storefront_id_fkey"
  FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
