CREATE TYPE "VendorType" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'SERVICE_COMPANY', 'COMBO');

CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'DEACTIVATED');

CREATE TYPE "VendorPlanTier" AS ENUM ('FREE', 'GROWTH', 'ENTERPRISE');

CREATE TYPE "MarketplaceProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED');

CREATE TYPE "MarketplacePriceUnit" AS ENUM ('PER_UNIT', 'PER_CASE', 'PER_KG', 'PER_LITRE', 'PER_PALLET');

CREATE TYPE "MarketplaceCurrency" AS ENUM ('USD', 'EUR', 'GBP', 'CAD');

CREATE TYPE "MarketplaceStorageRequirement" AS ENUM ('AMBIENT', 'REFRIGERATED', 'FROZEN', 'HAZMAT');

CREATE TYPE "MarketplaceWeightUnit" AS ENUM ('G', 'KG', 'OZ', 'LB');

CREATE TYPE "MarketplacePOStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'SUBMITTED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'CANCELLED');

CREATE TYPE "MarketplacePaymentMethod" AS ENUM ('CARD', 'ACH', 'NET_TERMS', 'WALLET');

CREATE TYPE "MarketplaceRecurringFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

CREATE TYPE "MarketplaceDisputeReason" AS ENUM ('DAMAGED', 'NOT_AS_DESCRIBED', 'WRONG_ITEM', 'DEFECTIVE', 'NOT_DELIVERED', 'OVERAGE');

CREATE TYPE "MarketplaceDisputeStatus" AS ENUM ('OPEN', 'VENDOR_RESPONSE', 'ADMIN_REVIEW', 'RESOLVED');

CREATE TYPE "MarketplaceTransactionStatus" AS ENUM ('PENDING', 'AVAILABLE', 'PAID_OUT');

CREATE TYPE "MarketplaceSenderType" AS ENUM ('BUYER', 'VENDOR', 'ADMIN');

CREATE TABLE "marketplace_vendors" (
    "id" UUID NOT NULL,
    "workspace_id" UUID,
    "company_name" VARCHAR(255) NOT NULL,
    "legal_name" VARCHAR(255) NOT NULL,
    "type" "VendorType" NOT NULL,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_account_id" VARCHAR(255),
    "commission_rate" DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    "plan_tier" "VendorPlanTier" NOT NULL DEFAULT 'FREE',
    "verified_at" TIMESTAMP(3),
    "documents" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_vendors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_vendor_products" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(120) NOT NULL,
    "gtin" VARCHAR(64),
    "category_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "rich_description" TEXT,
    "status" "MarketplaceProductStatus" NOT NULL DEFAULT 'DRAFT',
    "base_price" DECIMAL(14,2) NOT NULL,
    "currency" "MarketplaceCurrency" NOT NULL DEFAULT 'USD',
    "price_unit" "MarketplacePriceUnit" NOT NULL,
    "case_size" INTEGER,
    "moq" INTEGER NOT NULL DEFAULT 1,
    "order_increment" INTEGER NOT NULL DEFAULT 1,
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "min_stock_alert" INTEGER,
    "lead_time_days" INTEGER NOT NULL DEFAULT 3,
    "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
    "weight" DECIMAL(12,4),
    "weight_unit" "MarketplaceWeightUnit",
    "dimensions" JSONB,
    "storage_requirement" "MarketplaceStorageRequirement",
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "media" JSONB NOT NULL DEFAULT '[]',
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seo_title" VARCHAR(255),
    "seo_description" TEXT,
    "slug" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_vendor_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_product_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 1,
    "icon" VARCHAR(120),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_product_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(120) NOT NULL,
    "price" DECIMAL(14,2),
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_product_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_volume_prices" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "min_quantity" INTEGER NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "marketplace_volume_prices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_purchase_orders" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "status" "MarketplacePOStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "delivery_fee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "currency" "MarketplaceCurrency" NOT NULL DEFAULT 'USD',
    "payment_method" "MarketplacePaymentMethod" NOT NULL,
    "payment_intent_id" VARCHAR(255),
    "delivery_address" JSONB NOT NULL,
    "requested_delivery_date" TIMESTAMP(3),
    "confirmed_delivery_date" TIMESTAMP(3),
    "tracking_number" VARCHAR(255),
    "po_number" VARCHAR(64),
    "notes" TEXT,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_purchase_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_po_line_items" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "product_name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(120) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "received_quantity" INTEGER NOT NULL DEFAULT 0,
    "returned_quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "marketplace_po_line_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_recurring_orders" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "items" JSONB NOT NULL,
    "frequency" "MarketplaceRecurringFrequency" NOT NULL,
    "next_run_at" TIMESTAMP(3) NOT NULL,
    "last_run_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "approval_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_recurring_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_carts" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "marketplace_carts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_vendor_reviews" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "quality_score" INTEGER NOT NULL,
    "accuracy_score" INTEGER NOT NULL,
    "delivery_score" INTEGER NOT NULL,
    "packaging_score" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "comment" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_vendor_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_disputes" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "opened_by_id" UUID NOT NULL,
    "reason" "MarketplaceDisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MarketplaceDisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_disputes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_vendor_transactions" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "gross_amount" DECIMAL(14,2) NOT NULL,
    "commission_amount" DECIMAL(14,2) NOT NULL,
    "net_amount" DECIMAL(14,2) NOT NULL,
    "status" "MarketplaceTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "payout_id" VARCHAR(255),
    "available_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_vendor_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_vendor_messages" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID,
    "sender_id" UUID NOT NULL,
    "sender_type" "MarketplaceSenderType" NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_vendor_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "marketplace_vendors_status_idx" ON "marketplace_vendors"("status");

CREATE INDEX "marketplace_vendors_workspace_id_idx" ON "marketplace_vendors"("workspace_id");

CREATE UNIQUE INDEX "marketplace_vendor_products_slug_key" ON "marketplace_vendor_products"("slug");

CREATE INDEX "marketplace_vendor_products_category_id_idx" ON "marketplace_vendor_products"("category_id");

CREATE INDEX "marketplace_vendor_products_status_idx" ON "marketplace_vendor_products"("status");

CREATE INDEX "marketplace_vendor_products_vendor_id_status_idx" ON "marketplace_vendor_products"("vendor_id", "status");

CREATE UNIQUE INDEX "marketplace_vendor_products_vendor_id_sku_key" ON "marketplace_vendor_products"("vendor_id", "sku");

CREATE UNIQUE INDEX "marketplace_product_categories_slug_key" ON "marketplace_product_categories"("slug");

CREATE INDEX "marketplace_product_categories_parent_id_idx" ON "marketplace_product_categories"("parent_id");

CREATE UNIQUE INDEX "marketplace_product_variants_product_id_sku_key" ON "marketplace_product_variants"("product_id", "sku");

CREATE UNIQUE INDEX "marketplace_volume_prices_product_id_min_quantity_key" ON "marketplace_volume_prices"("product_id", "min_quantity");

CREATE INDEX "marketplace_purchase_orders_workspace_id_idx" ON "marketplace_purchase_orders"("workspace_id");

CREATE INDEX "marketplace_purchase_orders_vendor_id_idx" ON "marketplace_purchase_orders"("vendor_id");

CREATE INDEX "marketplace_purchase_orders_status_idx" ON "marketplace_purchase_orders"("status");

CREATE INDEX "marketplace_purchase_orders_workspace_id_status_idx" ON "marketplace_purchase_orders"("workspace_id", "status");

CREATE INDEX "marketplace_po_line_items_purchase_order_id_idx" ON "marketplace_po_line_items"("purchase_order_id");

CREATE INDEX "marketplace_po_line_items_product_id_idx" ON "marketplace_po_line_items"("product_id");

CREATE INDEX "marketplace_recurring_orders_workspace_id_idx" ON "marketplace_recurring_orders"("workspace_id");

CREATE INDEX "marketplace_recurring_orders_vendor_id_idx" ON "marketplace_recurring_orders"("vendor_id");

CREATE INDEX "marketplace_recurring_orders_next_run_at_is_active_idx" ON "marketplace_recurring_orders"("next_run_at", "is_active");

CREATE UNIQUE INDEX "marketplace_carts_workspace_id_key" ON "marketplace_carts"("workspace_id");

CREATE UNIQUE INDEX "marketplace_vendor_reviews_purchase_order_id_key" ON "marketplace_vendor_reviews"("purchase_order_id");

CREATE INDEX "marketplace_vendor_reviews_vendor_id_idx" ON "marketplace_vendor_reviews"("vendor_id");

CREATE UNIQUE INDEX "marketplace_vendor_reviews_workspace_id_purchase_order_id_key" ON "marketplace_vendor_reviews"("workspace_id", "purchase_order_id");

CREATE UNIQUE INDEX "marketplace_disputes_purchase_order_id_key" ON "marketplace_disputes"("purchase_order_id");

CREATE INDEX "marketplace_disputes_status_idx" ON "marketplace_disputes"("status");

CREATE UNIQUE INDEX "marketplace_vendor_transactions_purchase_order_id_key" ON "marketplace_vendor_transactions"("purchase_order_id");

CREATE INDEX "marketplace_vendor_transactions_vendor_id_idx" ON "marketplace_vendor_transactions"("vendor_id");

CREATE INDEX "marketplace_vendor_transactions_status_idx" ON "marketplace_vendor_transactions"("status");

CREATE INDEX "marketplace_vendor_messages_purchase_order_id_idx" ON "marketplace_vendor_messages"("purchase_order_id");

ALTER TABLE "marketplace_vendors" ADD CONSTRAINT "marketplace_vendors_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "marketplace_vendor_products" ADD CONSTRAINT "marketplace_vendor_products_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "marketplace_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_vendor_products" ADD CONSTRAINT "marketplace_vendor_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "marketplace_product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "marketplace_product_categories" ADD CONSTRAINT "marketplace_product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "marketplace_product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "marketplace_product_variants" ADD CONSTRAINT "marketplace_product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_vendor_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_volume_prices" ADD CONSTRAINT "marketplace_volume_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_vendor_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_purchase_orders" ADD CONSTRAINT "marketplace_purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "marketplace_vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "marketplace_purchase_orders" ADD CONSTRAINT "marketplace_purchase_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_po_line_items" ADD CONSTRAINT "marketplace_po_line_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "marketplace_purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_po_line_items" ADD CONSTRAINT "marketplace_po_line_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_vendor_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "marketplace_po_line_items" ADD CONSTRAINT "marketplace_po_line_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "marketplace_product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "marketplace_recurring_orders" ADD CONSTRAINT "marketplace_recurring_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "marketplace_vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "marketplace_recurring_orders" ADD CONSTRAINT "marketplace_recurring_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_carts" ADD CONSTRAINT "marketplace_carts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_vendor_reviews" ADD CONSTRAINT "marketplace_vendor_reviews_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "marketplace_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_vendor_reviews" ADD CONSTRAINT "marketplace_vendor_reviews_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_vendor_reviews" ADD CONSTRAINT "marketplace_vendor_reviews_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "marketplace_purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "marketplace_purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_vendor_transactions" ADD CONSTRAINT "marketplace_vendor_transactions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "marketplace_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketplace_vendor_transactions" ADD CONSTRAINT "marketplace_vendor_transactions_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "marketplace_purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;