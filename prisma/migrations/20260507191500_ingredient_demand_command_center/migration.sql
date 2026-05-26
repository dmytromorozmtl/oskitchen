-- Ingredient demand engine: runs, run lines, substitutions, location stock, ingredient/recipe extensions.

CREATE TYPE "IngredientDemandRunStatus" AS ENUM ('DRAFT', 'COMPLETED', 'FAILED', 'REVIEWED', 'LOCKED');
CREATE TYPE "IngredientDemandRunLineStatus" AS ENUM ('OPEN', 'IGNORED', 'SENT_TO_PURCHASING');

ALTER TABLE "kitchen_settings" ADD COLUMN IF NOT EXISTS "ingredient_demand_settings_json" JSONB;

ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "category" VARCHAR(120);
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "purchase_unit" VARCHAR(64);
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "conversion_json" JSONB;
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "reorder_point" DECIMAL(14,4);
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "recipe_ingredients" ADD COLUMN IF NOT EXISTS "notes" TEXT;

CREATE INDEX IF NOT EXISTS "ingredients_user_id_name_idx" ON "ingredients"("user_id", "name");
CREATE INDEX IF NOT EXISTS "ingredients_user_id_category_idx" ON "ingredients"("user_id", "category");
CREATE INDEX IF NOT EXISTS "ingredients_user_id_active_idx" ON "ingredients"("user_id", "active");

CREATE INDEX IF NOT EXISTS "recipes_user_id_active_idx" ON "recipes"("user_id", "active");

CREATE TABLE "ingredient_demand_runs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "date_from" DATE NOT NULL,
    "date_to" DATE NOT NULL,
    "source_types_json" JSONB NOT NULL,
    "filter_brand_id" UUID,
    "filter_location_id" UUID,
    "status" "IngredientDemandRunStatus" NOT NULL DEFAULT 'DRAFT',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "shortage_lines" INTEGER NOT NULL DEFAULT 0,
    "estimated_cost" DECIMAL(14,2),
    "warnings_json" JSONB,
    "created_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_demand_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ingredient_demand_run_lines" (
    "id" UUID NOT NULL,
    "demand_run_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "demand_date" DATE NOT NULL,
    "required_quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "available_quantity" DECIMAL(14,4),
    "shortage_quantity" DECIMAL(14,4),
    "waste_percent_applied" DECIMAL(8,4) NOT NULL,
    "estimated_cost" DECIMAL(14,2),
    "source_summary_json" JSONB,
    "related_products_json" JSONB,
    "related_orders_json" JSONB,
    "related_menus_json" JSONB,
    "related_events_json" JSONB,
    "supplier_label" VARCHAR(255),
    "status" "IngredientDemandRunLineStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_demand_run_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory_stock" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "location_id" UUID,
    "quantity_on_hand" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_stock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ingredient_substitutions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "substitute_ingredient_id" UUID NOT NULL,
    "conversion_ratio" DECIMAL(14,6),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_substitutions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ingredient_substitutions_user_id_ingredient_id_substitute_ingredient_id_key" ON "ingredient_substitutions"("user_id", "ingredient_id", "substitute_ingredient_id");
CREATE INDEX "ingredient_substitutions_user_id_ingredient_id_idx" ON "ingredient_substitutions"("user_id", "ingredient_id");
CREATE INDEX "ingredient_substitutions_user_id_active_idx" ON "ingredient_substitutions"("user_id", "active");

CREATE INDEX "ingredient_demand_runs_user_id_date_from_date_to_idx" ON "ingredient_demand_runs"("user_id", "date_from", "date_to");
CREATE INDEX "ingredient_demand_runs_user_id_status_idx" ON "ingredient_demand_runs"("user_id", "status");

CREATE INDEX "ingredient_demand_run_lines_demand_run_id_idx" ON "ingredient_demand_run_lines"("demand_run_id");
CREATE INDEX "ingredient_demand_run_lines_ingredient_id_idx" ON "ingredient_demand_run_lines"("ingredient_id");

CREATE INDEX "inventory_stock_user_id_ingredient_id_idx" ON "inventory_stock"("user_id", "ingredient_id");
CREATE INDEX "inventory_stock_location_id_idx" ON "inventory_stock"("location_id");

ALTER TABLE "ingredient_demand_runs" ADD CONSTRAINT "ingredient_demand_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ingredient_demand_run_lines" ADD CONSTRAINT "ingredient_demand_run_lines_demand_run_id_fkey" FOREIGN KEY ("demand_run_id") REFERENCES "ingredient_demand_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredient_demand_run_lines" ADD CONSTRAINT "ingredient_demand_run_lines_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ingredient_substitutions" ADD CONSTRAINT "ingredient_substitutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredient_substitutions" ADD CONSTRAINT "ingredient_substitutions_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredient_substitutions" ADD CONSTRAINT "ingredient_substitutions_substitute_ingredient_id_fkey" FOREIGN KEY ("substitute_ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
