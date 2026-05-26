-- Brand Management Center: lifecycle, concept kind, optional ops fields (additive + safe backfill).

CREATE TYPE "BrandLifecycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "BrandConceptKind" AS ENUM (
  'RESTAURANT_CONCEPT',
  'CAFE_CONCEPT',
  'BAR_CONCEPT',
  'BAKERY_CONCEPT',
  'CATERING_BRAND',
  'MEAL_PREP_BRAND',
  'GHOST_KITCHEN_BRAND',
  'CLOUD_KITCHEN_BRAND',
  'EVENT_BRAND',
  'RETAIL_BRAND',
  'OTHER'
);

ALTER TABLE "brands" ADD COLUMN "lifecycle_status" "BrandLifecycleStatus" NOT NULL DEFAULT 'ACTIVE';
UPDATE "brands" SET "lifecycle_status" = CASE WHEN "active" THEN 'ACTIVE'::"BrandLifecycleStatus" ELSE 'PAUSED'::"BrandLifecycleStatus" END;
ALTER TABLE "brands" DROP COLUMN "active";

ALTER TABLE "brands" ADD COLUMN "concept_kind" "BrandConceptKind" NOT NULL DEFAULT 'OTHER';

ALTER TABLE "brands" ADD COLUMN "location_id" UUID;
ALTER TABLE "brands" ADD CONSTRAINT "brands_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "brands" ADD COLUMN "positioning" TEXT;
ALTER TABLE "brands" ADD COLUMN "customer_segment" VARCHAR(255);
ALTER TABLE "brands" ADD COLUMN "secondary_color" VARCHAR(32);
ALTER TABLE "brands" ADD COLUMN "favicon_url" TEXT;
ALTER TABLE "brands" ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "brands" ADD COLUMN "website_url" VARCHAR(512);
ALTER TABLE "brands" ADD COLUMN "brand_custom_domain" VARCHAR(255);

ALTER TABLE "brands" ADD COLUMN "default_storefront_id" UUID;
ALTER TABLE "brands" ADD COLUMN "default_menu_id" UUID;
ALTER TABLE "brands" ADD COLUMN "default_integration_connection_id" UUID;

ALTER TABLE "brands" ADD COLUMN "default_business_mode" "BusinessType";

ALTER TABLE "brands" ADD COLUMN "contact_email" VARCHAR(255);
ALTER TABLE "brands" ADD COLUMN "contact_phone" VARCHAR(64);

ALTER TABLE "brands" ADD COLUMN "social_links_json" JSONB;
ALTER TABLE "brands" ADD COLUMN "seo_title" VARCHAR(255);
ALTER TABLE "brands" ADD COLUMN "seo_description" TEXT;
ALTER TABLE "brands" ADD COLUMN "seo_image_url" TEXT;

ALTER TABLE "brands" ADD COLUMN "operating_hours_json" JSONB;
ALTER TABLE "brands" ADD COLUMN "fulfillment_settings_json" JSONB;
ALTER TABLE "brands" ADD COLUMN "production_settings_json" JSONB;
ALTER TABLE "brands" ADD COLUMN "reporting_settings_json" JSONB;

ALTER TABLE "brands" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "brands" ADD CONSTRAINT "brands_default_menu_id_fkey" FOREIGN KEY ("default_menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "brands_workspace_id_lifecycle_status_idx" ON "brands"("workspace_id", "lifecycle_status");
CREATE INDEX "brands_workspace_id_concept_kind_idx" ON "brands"("workspace_id", "concept_kind");
CREATE INDEX "brands_location_id_idx" ON "brands"("location_id");
CREATE INDEX "brands_default_business_mode_idx" ON "brands"("default_business_mode");
