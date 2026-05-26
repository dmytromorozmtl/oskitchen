-- Order Creation Center
-- Additive only. No existing data is rewritten.

-- orders: new optional columns
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "customer_id" UUID,
  ADD COLUMN IF NOT EXISTS "status_detail" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "order_type" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "payment_mode" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "payment_status" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "creation_source" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "fulfillment_detail" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "fulfillment_window_start" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "fulfillment_window_end" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "pickup_location_id" UUID,
  ADD COLUMN IF NOT EXISTS "delivery_address_json" JSONB,
  ADD COLUMN IF NOT EXISTS "kitchen_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "packing_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "delivery_notes_ext" TEXT,
  ADD COLUMN IF NOT EXISTS "allergy_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "dietary_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "tax_amount" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "fees_amount" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "discount_amount" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "channel_provider" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "external_order_id_ext" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "source_metadata_json" JSONB;

DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "orders_customer_fkey"
    FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "orders_user_order_type_idx" ON "orders"("user_id", "order_type");
CREATE INDEX IF NOT EXISTS "orders_user_status_detail_idx" ON "orders"("user_id", "status_detail");
CREATE INDEX IF NOT EXISTS "orders_user_customer_idx" ON "orders"("user_id", "customer_id");

-- order_items: relax productId + add custom-line fields
ALTER TABLE "order_items"
  ALTER COLUMN "product_id" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "title" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "sku" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "unit_price" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "line_total" DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "modifiers_json" JSONB,
  ADD COLUMN IF NOT EXISTS "prepared_date" DATE,
  ADD COLUMN IF NOT EXISTS "source_mapping_id" UUID;
