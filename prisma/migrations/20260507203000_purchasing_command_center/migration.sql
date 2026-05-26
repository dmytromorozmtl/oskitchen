-- Purchasing command center: suppliers, POs, reorder queue, receiving, price history, approvals.

CREATE TYPE "PurchaseOrderStatus" AS ENUM (
  'DRAFT',
  'READY_FOR_REVIEW',
  'APPROVED',
  'SENT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
  'OVERDUE'
);

CREATE TYPE "PurchaseOrderSourceType" AS ENUM (
  'DEMAND_RUN',
  'SHORTAGE',
  'MANUAL',
  'PAR_REPLENISHMENT',
  'EVENT',
  'PRODUCTION'
);

CREATE TYPE "ReorderQueueItemStatus" AS ENUM (
  'OPEN',
  'ADDED_TO_PO',
  'IGNORED',
  'RESOLVED'
);

CREATE TYPE "PurchaseOrderLineStatus" AS ENUM (
  'OPEN',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED'
);

CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(64),
    "website" VARCHAR(512),
    "address_json" JSONB,
    "categories_json" JSONB,
    "payment_terms" VARCHAR(255),
    "delivery_days_json" JSONB,
    "lead_time_days" INTEGER,
    "minimum_order_amount" DECIMAL(12,2),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "supplier_items" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "supplier_sku" VARCHAR(120),
    "supplier_name" VARCHAR(255),
    "purchase_unit" VARCHAR(64) NOT NULL,
    "pack_size" DECIMAL(12,4),
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "minimum_quantity" DECIMAL(12,4),
    "lead_time_days" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "purchase_orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "location_id" UUID,
    "brand_id" UUID,
    "demand_run_id" UUID,
    "order_number" VARCHAR(64) NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "source_type" "PurchaseOrderSourceType" NOT NULL,
    "requested_delivery_date" DATE,
    "sent_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "shipping" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_by_id" UUID,
    "approved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "purchase_order_lines" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "supplier_item_id" UUID,
    "description" VARCHAR(512) NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "total_cost" DECIMAL(14,2) NOT NULL,
    "required_by_date" DATE,
    "demand_run_line_id" UUID,
    "received_quantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "status" "PurchaseOrderLineStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reorder_queue_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "supplier_id" UUID,
    "source_type" "PurchaseOrderSourceType" NOT NULL,
    "source_id" VARCHAR(255),
    "required_quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "shortage_quantity" DECIMAL(14,4),
    "suggested_purchase_quantity" DECIMAL(14,4) NOT NULL,
    "urgency" VARCHAR(32) NOT NULL DEFAULT 'normal',
    "required_by_date" DATE NOT NULL,
    "status" "ReorderQueueItemStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reorder_queue_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "receiving_events" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "line_id" UUID,
    "ingredient_id" UUID NOT NULL,
    "received_quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "received_by_id" UUID,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "receiving_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "supplier_price_history" (
    "id" UUID NOT NULL,
    "supplier_item_id" UUID,
    "ingredient_id" UUID NOT NULL,
    "old_unit_cost" DECIMAL(12,4),
    "new_unit_cost" DECIMAL(12,4) NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(120) NOT NULL,

    CONSTRAINT "supplier_price_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "purchase_approval_events" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "action" VARCHAR(120) NOT NULL,
    "performed_by_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_approval_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "purchase_orders_user_id_order_number_key" ON "purchase_orders"("user_id", "order_number");
CREATE INDEX "purchase_orders_user_id_status_idx" ON "purchase_orders"("user_id", "status");
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders"("supplier_id");
CREATE INDEX "purchase_orders_requested_delivery_date_idx" ON "purchase_orders"("requested_delivery_date");

CREATE INDEX "suppliers_user_id_idx" ON "suppliers"("user_id");
CREATE INDEX "suppliers_user_id_active_idx" ON "suppliers"("user_id", "active");

CREATE INDEX "supplier_items_supplier_id_idx" ON "supplier_items"("supplier_id");
CREATE INDEX "supplier_items_ingredient_id_idx" ON "supplier_items"("ingredient_id");
CREATE INDEX "supplier_items_supplier_id_active_idx" ON "supplier_items"("supplier_id", "active");

CREATE INDEX "purchase_order_lines_purchase_order_id_idx" ON "purchase_order_lines"("purchase_order_id");
CREATE INDEX "purchase_order_lines_ingredient_id_idx" ON "purchase_order_lines"("ingredient_id");

CREATE INDEX "reorder_queue_items_user_id_status_idx" ON "reorder_queue_items"("user_id", "status");
CREATE INDEX "reorder_queue_items_ingredient_id_idx" ON "reorder_queue_items"("ingredient_id");

CREATE INDEX "receiving_events_purchase_order_id_idx" ON "receiving_events"("purchase_order_id");
CREATE INDEX "receiving_events_ingredient_id_idx" ON "receiving_events"("ingredient_id");

CREATE INDEX "supplier_price_history_ingredient_id_effective_at_idx" ON "supplier_price_history"("ingredient_id", "effective_at");
CREATE INDEX "supplier_price_history_supplier_item_id_idx" ON "supplier_price_history"("supplier_item_id");

CREATE INDEX "purchase_approval_events_purchase_order_id_created_at_idx" ON "purchase_approval_events"("purchase_order_id", "created_at");

ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supplier_items" ADD CONSTRAINT "supplier_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplier_items" ADD CONSTRAINT "supplier_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_demand_run_id_fkey" FOREIGN KEY ("demand_run_id") REFERENCES "ingredient_demand_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_supplier_item_id_fkey" FOREIGN KEY ("supplier_item_id") REFERENCES "supplier_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_demand_run_line_id_fkey" FOREIGN KEY ("demand_run_line_id") REFERENCES "ingredient_demand_run_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reorder_queue_items" ADD CONSTRAINT "reorder_queue_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reorder_queue_items" ADD CONSTRAINT "reorder_queue_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reorder_queue_items" ADD CONSTRAINT "reorder_queue_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "receiving_events" ADD CONSTRAINT "receiving_events_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "receiving_events" ADD CONSTRAINT "receiving_events_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "purchase_order_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "receiving_events" ADD CONSTRAINT "receiving_events_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "receiving_events" ADD CONSTRAINT "receiving_events_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_supplier_item_id_fkey" FOREIGN KEY ("supplier_item_id") REFERENCES "supplier_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_approval_events" ADD CONSTRAINT "purchase_approval_events_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchase_approval_events" ADD CONSTRAINT "purchase_approval_events_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
