-- Gap closure phase 3: high + medium priority features

CREATE TABLE IF NOT EXISTS "recipe_sub_recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "sub_recipe_id" UUID NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipe_sub_recipes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "recipe_sub_recipes_recipe_id_sub_recipe_id_key" ON "recipe_sub_recipes"("recipe_id", "sub_recipe_id");
CREATE INDEX IF NOT EXISTS "recipe_sub_recipes_sub_recipe_id_idx" ON "recipe_sub_recipes"("sub_recipe_id");

ALTER TABLE "recipe_sub_recipes" ADD CONSTRAINT "recipe_sub_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_sub_recipes" ADD CONSTRAINT "recipe_sub_recipes_sub_recipe_id_fkey" FOREIGN KEY ("sub_recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "grubhub_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "external_order_id" VARCHAR(120),
    "status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grubhub_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "grubhub_deliveries_user_id_created_at_idx" ON "grubhub_deliveries"("user_id", "created_at");
ALTER TABLE "grubhub_deliveries" ADD CONSTRAINT "grubhub_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "bank_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "category" VARCHAR(120),
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "matched_order_id" UUID,
    "matched_invoice_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "bank_transactions_user_id_date_idx" ON "bank_transactions"("user_id", "date");
CREATE INDEX IF NOT EXISTS "bank_transactions_user_id_reconciled_idx" ON "bank_transactions"("user_id", "reconciled");
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "franchises" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "franchisee_id" UUID NOT NULL,
    "royalty_rate" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "status" VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "franchises_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "franchises_user_id_idx" ON "franchises"("user_id");
CREATE INDEX IF NOT EXISTS "franchises_user_id_status_idx" ON "franchises"("user_id", "status");
ALTER TABLE "franchises" ADD CONSTRAINT "franchises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "cash_counts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "shift_id" VARCHAR(120),
    "counted_by_id" UUID NOT NULL,
    "expected_amount" DECIMAL(14,2) NOT NULL,
    "counted_amount" DECIMAL(14,2) NOT NULL,
    "variance" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cash_counts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "cash_counts_user_id_created_at_idx" ON "cash_counts"("user_id", "created_at");
ALTER TABLE "cash_counts" ADD CONSTRAINT "cash_counts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cash_counts" ADD CONSTRAINT "cash_counts_counted_by_id_fkey" FOREIGN KEY ("counted_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "commissary_transfers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "from_location_id" UUID NOT NULL,
    "to_location_id" UUID NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMP(3),
    CONSTRAINT "commissary_transfers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "commissary_transfers_user_id_created_at_idx" ON "commissary_transfers"("user_id", "created_at");
ALTER TABLE "commissary_transfers" ADD CONSTRAINT "commissary_transfers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "commissary_transfer_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transfer_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    CONSTRAINT "commissary_transfer_lines_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "commissary_transfer_lines_transfer_id_idx" ON "commissary_transfer_lines"("transfer_id");
ALTER TABLE "commissary_transfer_lines" ADD CONSTRAINT "commissary_transfer_lines_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "commissary_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commissary_transfer_lines" ADD CONSTRAINT "commissary_transfer_lines_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "production_plan_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "plan_date" DATE NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'SCHEDULED',
    "batch_size" INTEGER,
    "recipe_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_plan_tasks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "production_plan_tasks_user_id_plan_date_idx" ON "production_plan_tasks"("user_id", "plan_date");
ALTER TABLE "production_plan_tasks" ADD CONSTRAINT "production_plan_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
