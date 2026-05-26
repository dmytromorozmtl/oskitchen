-- Packing command center: additive enums and tables (existing `packing_events` unchanged).

CREATE TYPE "PackingCommandMode" AS ENUM (
  'MEAL_PREP_PACKING',
  'TAKEOUT_PACKING',
  'DELIVERY_PACKING',
  'PICKUP_PACKING',
  'CATERING_PACKING',
  'EVENT_LOADOUT',
  'BAKERY_PICKUP',
  'CAFE_PICKUP',
  'GHOST_KITCHEN_PACKING',
  'ROUTE_HANDOFF'
);

CREATE TYPE "PackingBatchStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "PackingTaskStatus" AS ENUM (
  'QUEUED',
  'IN_PROGRESS',
  'PACKED',
  'VERIFIED',
  'HANDED_OFF',
  'CANCELLED'
);

CREATE TYPE "PackingTaskPriority" AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'CRITICAL'
);

CREATE TYPE "PackingAggregateLabelStatus" AS ENUM (
  'NOT_REQUIRED',
  'PENDING',
  'PARTIAL',
  'COMPLETE'
);

CREATE TYPE "PackingAggregateVerificationStatus" AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETE',
  'FAILED'
);

CREATE TYPE "PrintedLabelStatus" AS ENUM (
  'QUEUED',
  'PRINTED',
  'FAILED'
);

CREATE TABLE "packing_batches" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "brand_id" UUID,
  "location_id" UUID,
  "route_id" UUID,
  "event_id" UUID,
  "production_batch_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "packing_date" DATE NOT NULL,
  "mode" "PackingCommandMode" NOT NULL DEFAULT 'MEAL_PREP_PACKING',
  "status" "PackingBatchStatus" NOT NULL DEFAULT 'DRAFT',
  "fulfillment_type" "FulfillmentType",
  "total_orders" INTEGER NOT NULL DEFAULT 0,
  "total_items" INTEGER NOT NULL DEFAULT 0,
  "packed_items" INTEGER NOT NULL DEFAULT 0,
  "label_status" "PackingAggregateLabelStatus" NOT NULL DEFAULT 'PENDING',
  "verification_status" "PackingAggregateVerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "assigned_to_id" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "packing_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packing_waves" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "batch_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "packing_date" DATE NOT NULL,
  "fulfillment_type" "FulfillmentType",
  "route_id" UUID,
  "pickup_window" VARCHAR(120),
  "delivery_window" VARCHAR(120),
  "status" "PackingBatchStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "packing_waves_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packing_tasks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "batch_id" UUID,
  "wave_id" UUID,
  "order_id" UUID NOT NULL,
  "order_item_id" UUID,
  "product_id" UUID,
  "customer_id" UUID,
  "brand_id" UUID,
  "location_id" UUID,
  "title" VARCHAR(512) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unit" VARCHAR(64),
  "fulfillment_type" "FulfillmentType" NOT NULL,
  "pickup_window" VARCHAR(120),
  "delivery_window" VARCHAR(120),
  "route_id" UUID,
  "status" "PackingTaskStatus" NOT NULL DEFAULT 'QUEUED',
  "priority" "PackingTaskPriority" NOT NULL DEFAULT 'NORMAL',
  "requires_label" BOOLEAN NOT NULL DEFAULT false,
  "requires_nutrition_label" BOOLEAN NOT NULL DEFAULT false,
  "requires_allergen_check" BOOLEAN NOT NULL DEFAULT false,
  "allergen_warnings_json" JSONB,
  "label_printed_at" TIMESTAMP(3),
  "packed_at" TIMESTAMP(3),
  "verified_at" TIMESTAMP(3),
  "assigned_to_id" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "packing_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "label_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "type" VARCHAR(64) NOT NULL,
  "size" VARCHAR(32) NOT NULL,
  "content_json" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "label_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "printed_labels" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "packing_task_id" UUID,
  "order_id" UUID,
  "product_id" UUID,
  "template_id" UUID NOT NULL,
  "type" VARCHAR(64) NOT NULL,
  "status" "PrintedLabelStatus" NOT NULL DEFAULT 'QUEUED',
  "printed_at" TIMESTAMP(3),
  "printed_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "printed_labels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packing_verification_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "packing_task_id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "action" VARCHAR(64) NOT NULL,
  "performed_by_id" UUID,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "packing_verification_events_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "packing_batches" ADD CONSTRAINT "packing_batches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_batches" ADD CONSTRAINT "packing_batches_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_batches" ADD CONSTRAINT "packing_batches_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_batches" ADD CONSTRAINT "packing_batches_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_batches" ADD CONSTRAINT "packing_batches_production_batch_id_fkey" FOREIGN KEY ("production_batch_id") REFERENCES "production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_batches" ADD CONSTRAINT "packing_batches_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "packing_waves" ADD CONSTRAINT "packing_waves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_waves" ADD CONSTRAINT "packing_waves_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "packing_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_waves" ADD CONSTRAINT "packing_waves_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "packing_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_wave_id_fkey" FOREIGN KEY ("wave_id") REFERENCES "packing_waves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "label_templates" ADD CONSTRAINT "label_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "printed_labels" ADD CONSTRAINT "printed_labels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "printed_labels" ADD CONSTRAINT "printed_labels_packing_task_id_fkey" FOREIGN KEY ("packing_task_id") REFERENCES "packing_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "printed_labels" ADD CONSTRAINT "printed_labels_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "printed_labels" ADD CONSTRAINT "printed_labels_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "printed_labels" ADD CONSTRAINT "printed_labels_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "label_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "printed_labels" ADD CONSTRAINT "printed_labels_printed_by_id_fkey" FOREIGN KEY ("printed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "packing_verification_events" ADD CONSTRAINT "packing_verification_events_packing_task_id_fkey" FOREIGN KEY ("packing_task_id") REFERENCES "packing_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_verification_events" ADD CONSTRAINT "packing_verification_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_verification_events" ADD CONSTRAINT "packing_verification_events_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "packing_batches_user_id_packing_date_idx" ON "packing_batches"("user_id", "packing_date");
CREATE INDEX "packing_batches_brand_id_packing_date_idx" ON "packing_batches"("brand_id", "packing_date");
CREATE INDEX "packing_batches_location_id_packing_date_idx" ON "packing_batches"("location_id", "packing_date");
CREATE INDEX "packing_batches_status_idx" ON "packing_batches"("status");
CREATE INDEX "packing_batches_fulfillment_type_idx" ON "packing_batches"("fulfillment_type");
CREATE INDEX "packing_batches_route_id_idx" ON "packing_batches"("route_id");

CREATE INDEX "packing_waves_user_id_packing_date_idx" ON "packing_waves"("user_id", "packing_date");
CREATE INDEX "packing_waves_route_id_idx" ON "packing_waves"("route_id");

CREATE INDEX "packing_tasks_user_id_idx" ON "packing_tasks"("user_id");
CREATE INDEX "packing_tasks_user_id_status_idx" ON "packing_tasks"("user_id", "status");
CREATE INDEX "packing_tasks_batch_id_idx" ON "packing_tasks"("batch_id");
CREATE INDEX "packing_tasks_wave_id_idx" ON "packing_tasks"("wave_id");
CREATE INDEX "packing_tasks_order_id_idx" ON "packing_tasks"("order_id");
CREATE INDEX "packing_tasks_customer_id_idx" ON "packing_tasks"("customer_id");
CREATE INDEX "packing_tasks_brand_id_idx" ON "packing_tasks"("brand_id");
CREATE INDEX "packing_tasks_location_id_idx" ON "packing_tasks"("location_id");
CREATE INDEX "packing_tasks_fulfillment_type_idx" ON "packing_tasks"("fulfillment_type");
CREATE INDEX "packing_tasks_route_id_idx" ON "packing_tasks"("route_id");
CREATE INDEX "packing_tasks_assigned_to_id_idx" ON "packing_tasks"("assigned_to_id");

CREATE INDEX "label_templates_user_id_idx" ON "label_templates"("user_id");
CREATE INDEX "label_templates_user_id_active_idx" ON "label_templates"("user_id", "active");

CREATE INDEX "printed_labels_user_id_idx" ON "printed_labels"("user_id");
CREATE INDEX "printed_labels_packing_task_id_idx" ON "printed_labels"("packing_task_id");
CREATE INDEX "printed_labels_order_id_idx" ON "printed_labels"("order_id");

CREATE INDEX "packing_verification_events_packing_task_id_created_at_idx" ON "packing_verification_events"("packing_task_id", "created_at");
CREATE INDEX "packing_verification_events_order_id_idx" ON "packing_verification_events"("order_id");
