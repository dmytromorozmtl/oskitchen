-- Storefront commerce v2: settings expansion, pages/sections, domains, analytics, orders.

-- Enum extensions (idempotent for shadow DB / re-apply)
DO $$ BEGIN ALTER TYPE "StorefrontOrderStatus" ADD VALUE 'REQUESTED'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE "StorefrontOrderStatus" ADD VALUE 'IN_PRODUCTION'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE "StorefrontOrderStatus" ADD VALUE 'READY'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE "StorefrontOrderStatus" ADD VALUE 'COMPLETED'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TYPE "StorefrontPrimaryDomainMode" AS ENUM ('PATH', 'SUBDOMAIN', 'CUSTOM_DOMAIN');
CREATE TYPE "StorefrontPageType" AS ENUM ('HOME', 'ABOUT', 'MENU', 'CONTACT', 'FAQ', 'CUSTOM', 'CATERING', 'THANK_YOU');
CREATE TYPE "StorefrontSectionType" AS ENUM ('HERO', 'FEATURED_MENU', 'TEXT_BLOCK', 'IMAGE_TEXT', 'TESTIMONIALS', 'FAQ', 'CONTACT_FORM', 'CTA', 'GALLERY', 'ANNOUNCEMENT', 'CATERING', 'REVIEWS');
CREATE TYPE "StorefrontDomainRecordType" AS ENUM ('SUBDOMAIN', 'CUSTOM');
CREATE TYPE "StorefrontDomainRecordStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'DISABLED');
CREATE TYPE "StorefrontOrderPaymentMode" AS ENUM ('PAY_LATER', 'ONLINE_PAYMENT', 'DEPOSIT');
CREATE TYPE "StorefrontOrderPaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- storefront_settings expansion
ALTER TABLE "storefront_settings" ADD COLUMN "workspace_id" UUID;
ALTER TABLE "storefront_settings" ADD COLUMN "subdomain" VARCHAR(120);
ALTER TABLE "storefront_settings" ADD COLUMN "custom_domain_status" VARCHAR(32);
ALTER TABLE "storefront_settings" ADD COLUMN "custom_domain_verification_token" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "primary_domain_mode" "StorefrontPrimaryDomainMode" NOT NULL DEFAULT 'PATH';
ALTER TABLE "storefront_settings" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "storefront_settings" ADD COLUMN "tagline" VARCHAR(500);
ALTER TABLE "storefront_settings" ADD COLUMN "favicon_url" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "secondary_color" VARCHAR(32);
ALTER TABLE "storefront_settings" ADD COLUMN "background_color" VARCHAR(32);
ALTER TABLE "storefront_settings" ADD COLUMN "text_color" VARCHAR(32);
ALTER TABLE "storefront_settings" ADD COLUMN "font_family" VARCHAR(120);
ALTER TABLE "storefront_settings" ADD COLUMN "theme_preset" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "layout_preset" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "locale" VARCHAR(16) NOT NULL DEFAULT 'en';
ALTER TABLE "storefront_settings" ADD COLUMN "contact_email" VARCHAR(255);
ALTER TABLE "storefront_settings" ADD COLUMN "contact_phone" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "business_address_json" JSONB;
ALTER TABLE "storefront_settings" ADD COLUMN "social_links_json" JSONB;
ALTER TABLE "storefront_settings" ADD COLUMN "seo_title" VARCHAR(255);
ALTER TABLE "storefront_settings" ADD COLUMN "seo_description" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "seo_image_url" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "canonical_base_url" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "robots_policy" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "meta_pixel_id" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "google_analytics_id" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "google_tag_manager_id" VARCHAR(64);
ALTER TABLE "storefront_settings" ADD COLUMN "announcement_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN "announcement_text" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "closure_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN "closure_message" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "closure_start_date" DATE;
ALTER TABLE "storefront_settings" ADD COLUMN "closure_end_date" DATE;
ALTER TABLE "storefront_settings" ADD COLUMN "online_payment_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "storefront_settings" ADD COLUMN "minimum_order_amount" DECIMAL(12,2);
ALTER TABLE "storefront_settings" ADD COLUMN "storefront_delivery_fee" DECIMAL(12,2);
ALTER TABLE "storefront_settings" ADD COLUMN "free_delivery_threshold" DECIMAL(12,2);
ALTER TABLE "storefront_settings" ADD COLUMN "delivery_radius_km" INTEGER;
ALTER TABLE "storefront_settings" ADD COLUMN "delivery_zones_json" JSONB;
ALTER TABLE "storefront_settings" ADD COLUMN "pickup_instructions" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "delivery_instructions" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "order_cutoff_time" VARCHAR(8);
ALTER TABLE "storefront_settings" ADD COLUMN "max_orders_per_day" INTEGER;
ALTER TABLE "storefront_settings" ADD COLUMN "terms_text" TEXT;
ALTER TABLE "storefront_settings" ADD COLUMN "privacy_text" TEXT;

CREATE UNIQUE INDEX "storefront_settings_subdomain_key" ON "storefront_settings"("subdomain") WHERE "subdomain" IS NOT NULL;
CREATE UNIQUE INDEX "storefront_settings_custom_domain_key" ON "storefront_settings"("custom_domain") WHERE "custom_domain" IS NOT NULL;

CREATE INDEX "storefront_settings_workspace_id_idx" ON "storefront_settings"("workspace_id");
CREATE INDEX "storefront_settings_enabled_published_idx" ON "storefront_settings"("enabled", "published");

ALTER TABLE "storefront_settings" ADD CONSTRAINT "storefront_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- storefront_orders expansion
ALTER TABLE "storefront_orders" ADD COLUMN "storefront_id" UUID;
ALTER TABLE "storefront_orders" ADD COLUMN "order_number" VARCHAR(32);
ALTER TABLE "storefront_orders" ADD COLUMN "pickup_window" VARCHAR(120);
ALTER TABLE "storefront_orders" ADD COLUMN "delivery_window" VARCHAR(120);
ALTER TABLE "storefront_orders" ADD COLUMN "customer_notes" TEXT;
ALTER TABLE "storefront_orders" ADD COLUMN "discount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "storefront_orders" ADD COLUMN "payment_mode" "StorefrontOrderPaymentMode" NOT NULL DEFAULT 'PAY_LATER';
ALTER TABLE "storefront_orders" ADD COLUMN "payment_status" "StorefrontOrderPaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED';
ALTER TABLE "storefront_orders" ADD COLUMN "source" VARCHAR(64);

CREATE INDEX "storefront_orders_storefront_id_created_at_idx" ON "storefront_orders"("storefront_id", "created_at");

ALTER TABLE "storefront_orders" ADD CONSTRAINT "storefront_orders_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "storefront_orders" o
SET "storefront_id" = s."id"
FROM "storefront_settings" s
WHERE s."user_id" = o."user_id" AND o."storefront_id" IS NULL;

CREATE TABLE "storefront_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "storefront_id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "page_type" "StorefrontPageType" NOT NULL,
    "content_json" JSONB NOT NULL,
    "seo_title" VARCHAR(255),
    "seo_description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_pages_storefront_id_slug_key" ON "storefront_pages"("storefront_id", "slug");
CREATE INDEX "storefront_pages_storefront_id_published_idx" ON "storefront_pages"("storefront_id", "published");
CREATE INDEX "storefront_pages_storefront_id_sort_order_idx" ON "storefront_pages"("storefront_id", "sort_order");

ALTER TABLE "storefront_pages" ADD CONSTRAINT "storefront_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_pages" ADD CONSTRAINT "storefront_pages_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_id" UUID NOT NULL,
    "type" "StorefrontSectionType" NOT NULL,
    "content_json" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_sections_page_id_sort_order_idx" ON "storefront_sections"("page_id", "sort_order");

ALTER TABLE "storefront_sections" ADD CONSTRAINT "storefront_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "storefront_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_themes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "theme_json" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_themes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_themes_user_id_idx" ON "storefront_themes"("user_id");

ALTER TABLE "storefront_themes" ADD CONSTRAINT "storefront_themes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_order_id" UUID NOT NULL,
    "product_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "prepared_date" DATE,
    "modifiers_json" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_order_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_order_items_storefront_order_id_idx" ON "storefront_order_items"("storefront_order_id");

ALTER TABLE "storefront_order_items" ADD CONSTRAINT "storefront_order_items_storefront_order_id_fkey" FOREIGN KEY ("storefront_order_id") REFERENCES "storefront_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_order_items" ADD CONSTRAINT "storefront_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "storefront_contact_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(64),
    "message" TEXT NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'NEW',
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_contact_submissions_storefront_id_created_at_idx" ON "storefront_contact_submissions"("storefront_id", "created_at");

ALTER TABLE "storefront_contact_submissions" ADD CONSTRAINT "storefront_contact_submissions_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_domains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "storefront_id" UUID NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "type" "StorefrontDomainRecordType" NOT NULL,
    "status" "StorefrontDomainRecordStatus" NOT NULL DEFAULT 'PENDING',
    "verification_token" VARCHAR(128),
    "dns_instructions_json" JSONB,
    "last_checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_domains_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_domains_domain_key" ON "storefront_domains"("domain");
CREATE INDEX "storefront_domains_storefront_id_idx" ON "storefront_domains"("storefront_id");
CREATE INDEX "storefront_domains_user_id_idx" ON "storefront_domains"("user_id");

ALTER TABLE "storefront_domains" ADD CONSTRAINT "storefront_domains_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_domains" ADD CONSTRAINT "storefront_domains_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_visits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "path" VARCHAR(512) NOT NULL,
    "referrer" TEXT,
    "user_agent_hash" VARCHAR(64),
    "ip_hash" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_visits_storefront_id_created_at_idx" ON "storefront_visits"("storefront_id", "created_at");

ALTER TABLE "storefront_visits" ADD CONSTRAINT "storefront_visits_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "storefront_conversion_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "event_name" VARCHAR(80) NOT NULL,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storefront_conversion_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_conversion_events_storefront_id_created_at_idx" ON "storefront_conversion_events"("storefront_id", "created_at");
CREATE INDEX "storefront_conversion_events_storefront_id_event_name_idx" ON "storefront_conversion_events"("storefront_id", "event_name");

ALTER TABLE "storefront_conversion_events" ADD CONSTRAINT "storefront_conversion_events_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
