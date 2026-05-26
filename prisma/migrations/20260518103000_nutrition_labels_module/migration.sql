-- Nutrition & allergen labels module: profiles, verification audit, storefront flags, packing gates.

CREATE TYPE "LabelDataSourceType" AS ENUM ('MANUAL', 'RECIPE_CALCULATED', 'SUPPLIER_DOCUMENT', 'LAB_TEST', 'IMPORTED');
CREATE TYPE "LabelVerificationStatus" AS ENUM ('NOT_STARTED', 'NEEDS_REVIEW', 'VERIFIED', 'EXPIRED', 'BLOCKED');
CREATE TYPE "PackagingLabelType" AS ENUM ('NUTRITION', 'ALLERGEN', 'INGREDIENT', 'COMBINED', 'ITEM_LABEL', 'BAG_LABEL');
CREATE TYPE "LabelAuditProfileType" AS ENUM ('NUTRITION', 'ALLERGEN', 'INGREDIENTS', 'LABEL');

-- NutritionProfile: tenant scope + extended facts + verification
ALTER TABLE "nutrition_profiles" ADD COLUMN "user_id" UUID;

UPDATE "nutrition_profiles" AS np
SET "user_id" = m."user_id"
FROM "products" AS p
JOIN "menus" AS m ON p."menu_id" = m."id"
WHERE np."product_id" = p."id";

ALTER TABLE "nutrition_profiles" ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nutrition_profiles" ADD COLUMN "serving_size_unit" VARCHAR(32);
ALTER TABLE "nutrition_profiles" ADD COLUMN "total_fat" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "saturated_fat" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "trans_fat" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "cholesterol" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "total_carbohydrate" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "dietary_fiber" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "total_sugars" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "added_sugars" DECIMAL(8,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "vitamin_d_mcg" DECIMAL(10,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "calcium_mg" DECIMAL(10,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "iron_mg" DECIMAL(10,2);
ALTER TABLE "nutrition_profiles" ADD COLUMN "potassium_mg" DECIMAL(10,2);

ALTER TABLE "nutrition_profiles" ADD COLUMN "source_type" "LabelDataSourceType" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "nutrition_profiles" ADD COLUMN "verification_status" "LabelVerificationStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "nutrition_profiles" ADD COLUMN "verified_by_id" UUID;
ALTER TABLE "nutrition_profiles" ADD COLUMN "verified_at" TIMESTAMP(3);
ALTER TABLE "nutrition_profiles" ADD COLUMN "expires_at" TIMESTAMP(3);
ALTER TABLE "nutrition_profiles" ADD COLUMN "notes" TEXT;
ALTER TABLE "nutrition_profiles" ADD COLUMN "supplier_document_ref" VARCHAR(512);
ALTER TABLE "nutrition_profiles" ADD COLUMN "lab_result_ref" VARCHAR(512);

UPDATE "nutrition_profiles" SET "total_fat" = "fat" WHERE "total_fat" IS NULL AND "fat" IS NOT NULL;
UPDATE "nutrition_profiles" SET "total_carbohydrate" = "carbs" WHERE "total_carbohydrate" IS NULL AND "carbs" IS NOT NULL;
UPDATE "nutrition_profiles" SET "dietary_fiber" = "fiber" WHERE "dietary_fiber" IS NULL AND "fiber" IS NOT NULL;
UPDATE "nutrition_profiles" SET "total_sugars" = "sugar" WHERE "total_sugars" IS NULL AND "sugar" IS NOT NULL;

UPDATE "nutrition_profiles" SET "verification_status" = 'NEEDS_REVIEW'
WHERE ("calories" IS NOT NULL OR "protein" IS NOT NULL OR "serving_size" IS NOT NULL)
  AND "verification_status" = 'NOT_STARTED';

ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_verified_by_id_fkey"
  FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "nutrition_profiles_user_id_idx" ON "nutrition_profiles"("user_id");
CREATE INDEX "nutrition_profiles_user_id_verification_status_idx" ON "nutrition_profiles"("user_id", "verification_status");
CREATE INDEX "nutrition_profiles_verification_status_idx" ON "nutrition_profiles"("verification_status");
CREATE INDEX "nutrition_profiles_source_type_idx" ON "nutrition_profiles"("source_type");
CREATE INDEX "nutrition_profiles_expires_at_idx" ON "nutrition_profiles"("expires_at");

-- AllergenProfile (structured; legacy product.allergens string remains)
CREATE TABLE "allergen_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "contains_json" JSONB NOT NULL,
  "may_contain_json" JSONB NOT NULL,
  "free_from_json" JSONB NOT NULL,
  "cross_contact_risk_json" JSONB,
  "source_type" "LabelDataSourceType" NOT NULL DEFAULT 'MANUAL',
  "verification_status" "LabelVerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "verified_by_id" UUID,
  "verified_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "allergen_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "allergen_profiles_product_id_key" ON "allergen_profiles"("product_id");
CREATE INDEX "allergen_profiles_user_id_idx" ON "allergen_profiles"("user_id");
CREATE INDEX "allergen_profiles_user_id_verification_status_idx" ON "allergen_profiles"("user_id", "verification_status");
CREATE INDEX "allergen_profiles_verification_status_idx" ON "allergen_profiles"("verification_status");

ALTER TABLE "allergen_profiles" ADD CONSTRAINT "allergen_profiles_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "allergen_profiles" ADD CONSTRAINT "allergen_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "allergen_profiles" ADD CONSTRAINT "allergen_profiles_verified_by_id_fkey"
  FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- IngredientDeclaration
CREATE TABLE "ingredient_declarations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "ingredients_text" TEXT NOT NULL,
  "source_type" "LabelDataSourceType" NOT NULL DEFAULT 'MANUAL',
  "verification_status" "LabelVerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "verified_by_id" UUID,
  "verified_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ingredient_declarations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ingredient_declarations_product_id_key" ON "ingredient_declarations"("product_id");
CREATE INDEX "ingredient_declarations_user_id_idx" ON "ingredient_declarations"("user_id");
CREATE INDEX "ingredient_declarations_user_id_verification_status_idx" ON "ingredient_declarations"("user_id", "verification_status");
CREATE INDEX "ingredient_declarations_verification_status_idx" ON "ingredient_declarations"("verification_status");

ALTER TABLE "ingredient_declarations" ADD CONSTRAINT "ingredient_declarations_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredient_declarations" ADD CONSTRAINT "ingredient_declarations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredient_declarations" ADD CONSTRAINT "ingredient_declarations_verified_by_id_fkey"
  FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Label verification audit trail
CREATE TABLE "label_verification_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "profile_type" "LabelAuditProfileType" NOT NULL,
  "action" VARCHAR(80) NOT NULL,
  "performed_by_id" UUID,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "label_verification_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "label_verification_events_user_id_created_at_idx" ON "label_verification_events"("user_id", "created_at");
CREATE INDEX "label_verification_events_product_id_created_at_idx" ON "label_verification_events"("product_id", "created_at");
CREATE INDEX "label_verification_events_profile_type_idx" ON "label_verification_events"("profile_type");

ALTER TABLE "label_verification_events" ADD CONSTRAINT "label_verification_events_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "label_verification_events" ADD CONSTRAINT "label_verification_events_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "label_verification_events" ADD CONSTRAINT "label_verification_events_performed_by_id_fkey"
  FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Label templates: packaging kind + optional layout JSON
ALTER TABLE "label_templates" ADD COLUMN "packaging_label_type" "PackagingLabelType" NOT NULL DEFAULT 'COMBINED';
ALTER TABLE "label_templates" ADD COLUMN "layout_json" JSONB;

-- Printed labels: copies + queue index
ALTER TABLE "printed_labels" ADD COLUMN "copies" INTEGER NOT NULL DEFAULT 1;
CREATE INDEX "printed_labels_user_id_status_idx" ON "printed_labels"("user_id", "status");
CREATE INDEX "printed_labels_product_id_idx" ON "printed_labels"("product_id");

-- Kitchen packing gates (operator-configured)
ALTER TABLE "kitchen_settings" ADD COLUMN "block_packing_without_verified_allergen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "kitchen_settings" ADD COLUMN "block_packing_without_verified_nutrition" BOOLEAN NOT NULL DEFAULT false;

-- Storefront: hide unverified label data by default; existing storefronts opt in to legacy behavior
ALTER TABLE "storefront_settings" ADD COLUMN "public_show_nutrition_when_unverified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN "public_show_allergens_when_unverified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN "public_show_ingredients_when_unverified" BOOLEAN NOT NULL DEFAULT false;

UPDATE "storefront_settings"
SET
  "public_show_nutrition_when_unverified" = true,
  "public_show_allergens_when_unverified" = true,
  "public_show_ingredients_when_unverified" = true;