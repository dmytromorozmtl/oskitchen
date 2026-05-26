-- Costing profitability command center: additive tables + optional link on legacy cost_snapshots.

CREATE TYPE "CostingRunType" AS ENUM ('FULL', 'PRODUCT', 'MENU', 'BRAND', 'LOCATION', 'CHANNEL', 'SCENARIO');
CREATE TYPE "CostingRunStatus" AS ENUM ('DRAFT', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "CostComponentType" AS ENUM ('INGREDIENT', 'LABOR', 'PACKAGING', 'DELIVERY', 'PLATFORM_FEE', 'PAYMENT_FEE', 'OVERHEAD', 'WASTE', 'CUSTOM');
CREATE TYPE "ChannelFeeType" AS ENUM ('PERCENTAGE', 'FIXED', 'MIXED');
CREATE TYPE "ProfitabilityWarningLevel" AS ENUM ('NONE', 'INFO', 'LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "kitchen_settings" ADD COLUMN "costing_settings_json" JSONB;

ALTER TABLE "cost_snapshots" ADD COLUMN "costing_run_id" UUID;

CREATE TABLE "costing_runs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "run_type" "CostingRunType" NOT NULL DEFAULT 'FULL',
    "status" "CostingRunStatus" NOT NULL DEFAULT 'COMPLETED',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "costing_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "profitability_lines" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "menu_id" UUID,
    "brand_id" UUID,
    "location_id" UUID,
    "channel_provider" VARCHAR(80),
    "sku" VARCHAR(120),
    "item_title" VARCHAR(512) NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "ingredient_cost" DECIMAL(12,2) NOT NULL,
    "labor_cost" DECIMAL(12,2) NOT NULL,
    "packaging_cost" DECIMAL(12,2) NOT NULL,
    "delivery_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "platform_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "overhead_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "waste_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "gross_profit" DECIMAL(12,2) NOT NULL,
    "gross_margin_percent" DECIMAL(8,4) NOT NULL,
    "food_cost_percent" DECIMAL(8,4) NOT NULL,
    "contribution_margin" DECIMAL(12,2) NOT NULL,
    "suggested_price" DECIMAL(12,2),
    "warning_level" "ProfitabilityWarningLevel" NOT NULL DEFAULT 'NONE',
    "warning_reasons_json" JSONB,
    "source_summary_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profitability_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cost_components" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "profitability_line_id" UUID,
    "type" "CostComponentType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(14,4),
    "unit" VARCHAR(64),
    "cost" DECIMAL(12,4) NOT NULL,
    "source" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cost_components_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "labor_rates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(120) NOT NULL,
    "hourly_rate" DECIMAL(12,4) NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "labor_rates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packaging_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "supplier_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "packaging_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_packaging_rules" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "packaging_item_id" UUID NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_packaging_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "channel_fee_rules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel_provider" VARCHAR(80) NOT NULL,
    "fee_type" "ChannelFeeType" NOT NULL,
    "percentage" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "fixed_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "channel_fee_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "margin_rules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_mode" "BusinessType",
    "product_type" VARCHAR(64),
    "target_margin_percent" DECIMAL(6,2) NOT NULL,
    "warning_margin_percent" DECIMAL(6,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "margin_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "price_scenarios" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "product_id" UUID,
    "menu_id" UUID,
    "scenario_json" JSONB NOT NULL,
    "result_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_scenarios_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "costing_runs" ADD CONSTRAINT "costing_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "costing_runs" ADD CONSTRAINT "costing_runs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "profitability_lines" ADD CONSTRAINT "profitability_lines_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "costing_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profitability_lines" ADD CONSTRAINT "profitability_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profitability_lines" ADD CONSTRAINT "profitability_lines_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "profitability_lines" ADD CONSTRAINT "profitability_lines_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "profitability_lines" ADD CONSTRAINT "profitability_lines_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cost_components" ADD CONSTRAINT "cost_components_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cost_components" ADD CONSTRAINT "cost_components_profitability_line_id_fkey" FOREIGN KEY ("profitability_line_id") REFERENCES "profitability_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "labor_rates" ADD CONSTRAINT "labor_rates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "packaging_items" ADD CONSTRAINT "packaging_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packaging_items" ADD CONSTRAINT "packaging_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_packaging_rules" ADD CONSTRAINT "product_packaging_rules_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_packaging_rules" ADD CONSTRAINT "product_packaging_rules_packaging_item_id_fkey" FOREIGN KEY ("packaging_item_id") REFERENCES "packaging_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_fee_rules" ADD CONSTRAINT "channel_fee_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "margin_rules" ADD CONSTRAINT "margin_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "price_scenarios" ADD CONSTRAINT "price_scenarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "price_scenarios" ADD CONSTRAINT "price_scenarios_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "price_scenarios" ADD CONSTRAINT "price_scenarios_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cost_snapshots" ADD CONSTRAINT "cost_snapshots_costing_run_id_fkey" FOREIGN KEY ("costing_run_id") REFERENCES "costing_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "costing_runs_user_id_created_at_idx" ON "costing_runs"("user_id", "created_at");
CREATE INDEX "costing_runs_user_id_status_idx" ON "costing_runs"("user_id", "status");

CREATE INDEX "profitability_lines_run_id_idx" ON "profitability_lines"("run_id");
CREATE INDEX "profitability_lines_product_id_idx" ON "profitability_lines"("product_id");
CREATE INDEX "profitability_lines_menu_id_idx" ON "profitability_lines"("menu_id");
CREATE INDEX "profitability_lines_brand_id_idx" ON "profitability_lines"("brand_id");
CREATE INDEX "profitability_lines_location_id_idx" ON "profitability_lines"("location_id");
CREATE INDEX "profitability_lines_channel_provider_idx" ON "profitability_lines"("channel_provider");
CREATE INDEX "profitability_lines_warning_level_idx" ON "profitability_lines"("warning_level");
CREATE INDEX "profitability_lines_created_at_idx" ON "profitability_lines"("created_at");

CREATE INDEX "cost_components_product_id_idx" ON "cost_components"("product_id");
CREATE INDEX "cost_components_profitability_line_id_idx" ON "cost_components"("profitability_line_id");
CREATE INDEX "cost_components_type_idx" ON "cost_components"("type");

CREATE INDEX "labor_rates_user_id_active_idx" ON "labor_rates"("user_id", "active");
CREATE INDEX "packaging_items_user_id_active_idx" ON "packaging_items"("user_id", "active");
CREATE INDEX "product_packaging_rules_packaging_item_id_idx" ON "product_packaging_rules"("packaging_item_id");
CREATE UNIQUE INDEX "product_packaging_rules_product_id_packaging_item_id_key" ON "product_packaging_rules"("product_id", "packaging_item_id");

CREATE INDEX "channel_fee_rules_user_id_channel_provider_active_idx" ON "channel_fee_rules"("user_id", "channel_provider", "active");
CREATE INDEX "margin_rules_user_id_active_idx" ON "margin_rules"("user_id", "active");
CREATE INDEX "margin_rules_user_id_business_mode_idx" ON "margin_rules"("user_id", "business_mode");

CREATE INDEX "price_scenarios_user_id_created_at_idx" ON "price_scenarios"("user_id", "created_at");
CREATE INDEX "price_scenarios_product_id_idx" ON "price_scenarios"("product_id");
CREATE INDEX "price_scenarios_menu_id_idx" ON "price_scenarios"("menu_id");

CREATE INDEX "cost_snapshots_costing_run_id_idx" ON "cost_snapshots"("costing_run_id");
