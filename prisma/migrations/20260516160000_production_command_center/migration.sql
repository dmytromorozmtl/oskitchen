-- Production command center: additive enums and tables (legacy `production_tasks` unchanged).

CREATE TYPE "ProductionCommandMode" AS ENUM (
  'DAILY_PREP',
  'SERVICE_PREP',
  'BATCH_PRODUCTION',
  'WEEKLY_MEAL_PREP',
  'EVENT_PRODUCTION',
  'BAKERY_BATCH',
  'BAR_PREP',
  'CAFE_MORNING_PREP',
  'GHOST_KITCHEN_RUSH',
  'PACKING_HANDOFF'
);

CREATE TYPE "ProductionSourceType" AS ENUM (
  'MENU',
  'ORDER',
  'CATERING_EVENT',
  'MANUAL',
  'FORECAST',
  'IMPORTED'
);

CREATE TYPE "ProductionBatchStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'COMPLETED',
  'ARCHIVED'
);

CREATE TYPE "ProductionWorkStatus" AS ENUM (
  'TO_PREP',
  'IN_PROGRESS',
  'READY',
  'HOLD',
  'PACK_HANDOFF',
  'DONE',
  'CANCELLED'
);

CREATE TYPE "ProductionWorkPriority" AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'CRITICAL'
);

CREATE TYPE "ProductionWorkEventType" AS ENUM (
  'CREATED',
  'STARTED',
  'COMPLETED',
  'REASSIGNED',
  'STAGE_CHANGED',
  'NOTE_ADDED',
  'SENT_TO_PACKING',
  'RESET'
);

CREATE TABLE "production_batches" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "brand_id" UUID,
  "location_id" UUID,
  "menu_id" UUID,
  "order_id" UUID,
  "catering_event_id" UUID,
  "production_date" DATE NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "mode" "ProductionCommandMode" NOT NULL DEFAULT 'DAILY_PREP',
  "status" "ProductionBatchStatus" NOT NULL DEFAULT 'DRAFT',
  "priority" "ProductionWorkPriority" NOT NULL DEFAULT 'NORMAL',
  "source_type" "ProductionSourceType" NOT NULL DEFAULT 'MANUAL',
  "total_items" INTEGER NOT NULL DEFAULT 0,
  "completed_items" INTEGER NOT NULL DEFAULT 0,
  "estimated_minutes" INTEGER,
  "actual_minutes" INTEGER,
  "assigned_station" VARCHAR(120),
  "assigned_to_id" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_work_items" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "batch_id" UUID,
  "brand_id" UUID,
  "location_id" UUID,
  "order_id" UUID,
  "order_item_id" UUID,
  "product_id" UUID,
  "title" VARCHAR(512) NOT NULL,
  "description" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unit" VARCHAR(64),
  "station" VARCHAR(120),
  "stage" VARCHAR(120),
  "status" "ProductionWorkStatus" NOT NULL DEFAULT 'TO_PREP',
  "priority" "ProductionWorkPriority" NOT NULL DEFAULT 'NORMAL',
  "source_type" "ProductionSourceType" NOT NULL DEFAULT 'MANUAL',
  "due_at" TIMESTAMP(3),
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "assigned_to_id" UUID,
  "requires_packing" BOOLEAN NOT NULL DEFAULT false,
  "requires_label" BOOLEAN NOT NULL DEFAULT false,
  "allergen_warning" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "production_work_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_stations" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "location_id" UUID,
  "name" VARCHAR(120) NOT NULL,
  "type" VARCHAR(64) NOT NULL,
  "capacity_units" INTEGER NOT NULL DEFAULT 1,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "production_stations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_stage_presets" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "mode" "ProductionCommandMode" NOT NULL DEFAULT 'DAILY_PREP',
  "title" VARCHAR(160) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "color" VARCHAR(32),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "production_stage_presets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_work_events" (
  "id" UUID NOT NULL,
  "work_item_id" UUID NOT NULL,
  "batch_id" UUID,
  "event_type" "ProductionWorkEventType" NOT NULL,
  "performed_by" UUID,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "production_work_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_templates" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "business_mode" "BusinessType" NOT NULL,
  "mode" "ProductionCommandMode" NOT NULL DEFAULT 'DAILY_PREP',
  "title" VARCHAR(255) NOT NULL,
  "stages_json" JSONB NOT NULL,
  "stations_json" JSONB NOT NULL,
  "tasks_json" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "production_templates_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_stations" ADD CONSTRAINT "production_stations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_stations" ADD CONSTRAINT "production_stations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_stage_presets" ADD CONSTRAINT "production_stage_presets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "production_work_events" ADD CONSTRAINT "production_work_events_work_item_id_fkey" FOREIGN KEY ("work_item_id") REFERENCES "production_work_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "production_work_events" ADD CONSTRAINT "production_work_events_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_work_events" ADD CONSTRAINT "production_work_events_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_templates" ADD CONSTRAINT "production_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "production_batches_user_id_production_date_idx" ON "production_batches"("user_id", "production_date");
CREATE INDEX "production_batches_brand_id_production_date_idx" ON "production_batches"("brand_id", "production_date");
CREATE INDEX "production_batches_location_id_production_date_idx" ON "production_batches"("location_id", "production_date");
CREATE INDEX "production_batches_status_idx" ON "production_batches"("status");
CREATE INDEX "production_batches_order_id_idx" ON "production_batches"("order_id");
CREATE INDEX "production_batches_menu_id_idx" ON "production_batches"("menu_id");

CREATE INDEX "production_work_items_user_id_idx" ON "production_work_items"("user_id");
CREATE INDEX "production_work_items_batch_id_idx" ON "production_work_items"("batch_id");
CREATE INDEX "production_work_items_brand_id_idx" ON "production_work_items"("brand_id");
CREATE INDEX "production_work_items_location_id_idx" ON "production_work_items"("location_id");
CREATE INDEX "production_work_items_status_idx" ON "production_work_items"("status");
CREATE INDEX "production_work_items_station_idx" ON "production_work_items"("station");
CREATE INDEX "production_work_items_stage_idx" ON "production_work_items"("stage");
CREATE INDEX "production_work_items_assigned_to_id_idx" ON "production_work_items"("assigned_to_id");
CREATE INDEX "production_work_items_order_id_idx" ON "production_work_items"("order_id");
CREATE INDEX "production_work_items_product_id_idx" ON "production_work_items"("product_id");
CREATE INDEX "production_work_items_due_at_idx" ON "production_work_items"("due_at");

CREATE INDEX "production_stations_user_id_idx" ON "production_stations"("user_id");
CREATE INDEX "production_stations_location_id_idx" ON "production_stations"("location_id");
CREATE INDEX "production_stations_user_id_active_idx" ON "production_stations"("user_id", "active");

CREATE INDEX "production_stage_presets_user_id_mode_idx" ON "production_stage_presets"("user_id", "mode");

CREATE INDEX "production_work_events_work_item_id_created_at_idx" ON "production_work_events"("work_item_id", "created_at");
CREATE INDEX "production_work_events_batch_id_idx" ON "production_work_events"("batch_id");

CREATE INDEX "production_templates_user_id_idx" ON "production_templates"("user_id");
CREATE INDEX "production_templates_user_id_business_mode_idx" ON "production_templates"("user_id", "business_mode");
