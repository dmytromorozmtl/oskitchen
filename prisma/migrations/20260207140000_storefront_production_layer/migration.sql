-- Storefront production layer: product public URLs, visibility, promos, blackouts, CMS plumbing, assets.

CREATE TYPE "StorefrontDiscountKind" AS ENUM ('PERCENT_OFF', 'FIXED_OFF', 'FREE_DELIVERY');
CREATE TYPE "StorefrontFormKind" AS ENUM ('CONTACT', 'CATERING', 'CUSTOM');

ALTER TABLE "products" ADD COLUMN "public_slug" VARCHAR(160);
ALTER TABLE "products" ADD COLUMN "storefront_visible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "storefront_featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "max_storefront_quantity" INTEGER;

CREATE INDEX "products_menu_id_public_slug_idx" ON "products"("menu_id", "public_slug");

-- storefront_orders is created in a later migration (20260510180000); guard for shadow / fresh DB order.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'storefront_orders'
  ) THEN
    ALTER TABLE "storefront_orders" ADD COLUMN IF NOT EXISTS "is_test_order" BOOLEAN NOT NULL DEFAULT false;
    CREATE INDEX IF NOT EXISTS "storefront_orders_storefront_id_status_idx" ON "storefront_orders"("storefront_id", "status");
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'storefront_domains'
  ) THEN
    CREATE INDEX IF NOT EXISTS "storefront_domains_domain_status_idx" ON "storefront_domains"("domain", "status");
  END IF;
END $$;

CREATE TABLE "storefront_blackout_dates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_blackout_dates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_blackout_dates_storefront_id_start_date_idx" ON "storefront_blackout_dates"("storefront_id", "start_date");

ALTER TABLE "storefront_blackout_dates" ADD CONSTRAINT "storefront_blackout_dates_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_discounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "kind" "StorefrontDiscountKind" NOT NULL,
    "percent_off" DECIMAL(5,2),
    "amount_off" DECIMAL(12,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "max_uses" INTEGER,
    "uses_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_discounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_discounts_storefront_id_code_key" ON "storefront_discounts"("storefront_id", "code");
CREATE INDEX "storefront_discounts_storefront_id_active_idx" ON "storefront_discounts"("storefront_id", "active");

ALTER TABLE "storefront_discounts" ADD CONSTRAINT "storefront_discounts_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_redirects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "from_path" VARCHAR(255) NOT NULL,
    "to_path" VARCHAR(512) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_redirects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_redirects_storefront_id_from_path_key" ON "storefront_redirects"("storefront_id", "from_path");
CREATE INDEX "storefront_redirects_storefront_id_active_idx" ON "storefront_redirects"("storefront_id", "active");

ALTER TABLE "storefront_redirects" ADD CONSTRAINT "storefront_redirects_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "form_kind" "StorefrontFormKind" NOT NULL,
    "fields_json" JSONB NOT NULL,
    "notification_email" VARCHAR(255),
    "honeypot_name" VARCHAR(64),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_forms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_forms_storefront_id_slug_key" ON "storefront_forms"("storefront_id", "slug");
CREATE INDEX "storefront_forms_storefront_id_idx" ON "storefront_forms"("storefront_id");

ALTER TABLE "storefront_forms" ADD CONSTRAINT "storefront_forms_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_form_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "form_id" UUID NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_form_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_form_submissions_form_id_created_at_idx" ON "storefront_form_submissions"("form_id", "created_at");

ALTER TABLE "storefront_form_submissions" ADD CONSTRAINT "storefront_form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "storefront_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_menu_publishes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_unpublish_at" TIMESTAMP(3),
    "snapshot_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_menu_publishes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_menu_publishes_storefront_id_published_at_idx" ON "storefront_menu_publishes"("storefront_id", "published_at");
CREATE INDEX "storefront_menu_publishes_menu_id_idx" ON "storefront_menu_publishes"("menu_id");

ALTER TABLE "storefront_menu_publishes" ADD CONSTRAINT "storefront_menu_publishes_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_menu_publishes" ADD CONSTRAINT "storefront_menu_publishes_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_navigations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "items_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_navigations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_navigations_storefront_id_key" ON "storefront_navigations"("storefront_id");

ALTER TABLE "storefront_navigations" ADD CONSTRAINT "storefront_navigations_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_footers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "blocks_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_footers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_footers_storefront_id_key" ON "storefront_footers"("storefront_id");

ALTER TABLE "storefront_footers" ADD CONSTRAINT "storefront_footers_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_fulfillment_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "rules_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_fulfillment_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_fulfillment_rules_storefront_id_priority_idx" ON "storefront_fulfillment_rules"("storefront_id", "priority");

ALTER TABLE "storefront_fulfillment_rules" ADD CONSTRAINT "storefront_fulfillment_rules_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "storefront_id" UUID,
    "url" TEXT NOT NULL,
    "kind" VARCHAR(64) NOT NULL,
    "label" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_assets_user_id_idx" ON "storefront_assets"("user_id");
CREATE INDEX "storefront_assets_storefront_id_idx" ON "storefront_assets"("storefront_id");

ALTER TABLE "storefront_assets" ADD CONSTRAINT "storefront_assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_assets" ADD CONSTRAINT "storefront_assets_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
