-- Gap closure: inventory waste/counts, labor time clock, food safety (HACCP scaffold)

-- CreateEnum
CREATE TYPE "WasteReason" AS ENUM ('SPOILAGE', 'PREP_WASTE', 'OVER_PRODUCTION', 'THEFT', 'DAMAGED', 'EXPIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryCountStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimeEntryStatus" AS ENUM ('ACTIVE', 'ON_BREAK', 'CLOCKED_OUT');

-- CreateEnum
CREATE TYPE "TempCheckType" AS ENUM ('REFRIGERATOR', 'FREEZER', 'HOT_HOLDING', 'COLD_HOLDING', 'COOKING', 'COOLING', 'REHEATING', 'RECEIVING');

-- CreateEnum
CREATE TYPE "TempCheckStatus" AS ENUM ('OK', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FoodSafetyCheckFrequency" AS ENUM ('DAILY', 'SHIFT', 'WEEKLY');

-- CreateTable
CREATE TABLE "waste_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "reason" "WasteReason" NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "recorded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waste_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_counts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "location_id" UUID,
    "status" "InventoryCountStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "counted_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "inventory_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_count_items" (
    "id" UUID NOT NULL,
    "inventory_count_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "expected_qty" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "counted_qty" DECIMAL(14,4),
    "unit" VARCHAR(64) NOT NULL,
    "variance_qty" DECIMAL(14,4),
    "variance_cost" DECIMAL(12,2),
    "notes" TEXT,

    CONSTRAINT "inventory_count_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_lots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "lot_number" VARCHAR(120) NOT NULL,
    "expiry_date" DATE NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(64) NOT NULL,
    "remaining_qty" DECIMAL(14,4) NOT NULL,

    CONSTRAINT "ingredient_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "clock_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clock_out" TIMESTAMP(3),
    "break_start" TIMESTAMP(3),
    "break_end" TIMESTAMP(3),
    "total_hours" DECIMAL(8,2),
    "status" "TimeEntryStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temperature_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "location_id" UUID,
    "check_type" "TempCheckType" NOT NULL,
    "temperature" DECIMAL(6,2) NOT NULL,
    "unit" VARCHAR(8) NOT NULL DEFAULT 'F',
    "target_min" DECIMAL(6,2),
    "target_max" DECIMAL(6,2),
    "status" "TempCheckStatus" NOT NULL DEFAULT 'OK',
    "checked_by_id" UUID NOT NULL,
    "notes" TEXT,
    "corrective_action" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temperature_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_safety_checklists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "frequency" "FoodSafetyCheckFrequency" NOT NULL DEFAULT 'DAILY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_safety_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_safety_checklist_items" (
    "id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "food_safety_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_safety_audits" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "completed_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_safety_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_safety_audit_responses" (
    "id" UUID NOT NULL,
    "audit_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "pass" BOOLEAN NOT NULL,
    "notes" TEXT,
    "photo_url" VARCHAR(512),

    CONSTRAINT "food_safety_audit_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waste_events_user_id_created_at_idx" ON "waste_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "waste_events_ingredient_id_idx" ON "waste_events"("ingredient_id");

-- CreateIndex
CREATE INDEX "inventory_counts_user_id_created_at_idx" ON "inventory_counts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "inventory_count_items_inventory_count_id_idx" ON "inventory_count_items"("inventory_count_id");

-- CreateIndex
CREATE INDEX "inventory_count_items_ingredient_id_idx" ON "inventory_count_items"("ingredient_id");

-- CreateIndex
CREATE INDEX "ingredient_lots_user_id_ingredient_id_expiry_date_idx" ON "ingredient_lots"("user_id", "ingredient_id", "expiry_date");

-- CreateIndex
CREATE INDEX "time_entries_user_id_staff_id_clock_in_idx" ON "time_entries"("user_id", "staff_id", "clock_in");

-- CreateIndex
CREATE INDEX "temperature_logs_user_id_created_at_idx" ON "temperature_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "food_safety_checklists_user_id_idx" ON "food_safety_checklists"("user_id");

-- CreateIndex
CREATE INDEX "food_safety_checklist_items_checklist_id_idx" ON "food_safety_checklist_items"("checklist_id");

-- CreateIndex
CREATE INDEX "food_safety_audits_user_id_created_at_idx" ON "food_safety_audits"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "food_safety_audit_responses_audit_id_idx" ON "food_safety_audit_responses"("audit_id");

-- AddForeignKey
ALTER TABLE "waste_events" ADD CONSTRAINT "waste_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_events" ADD CONSTRAINT "waste_events_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_events" ADD CONSTRAINT "waste_events_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_counts" ADD CONSTRAINT "inventory_counts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_counts" ADD CONSTRAINT "inventory_counts_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_counts" ADD CONSTRAINT "inventory_counts_counted_by_id_fkey" FOREIGN KEY ("counted_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_count_items" ADD CONSTRAINT "inventory_count_items_inventory_count_id_fkey" FOREIGN KEY ("inventory_count_id") REFERENCES "inventory_counts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_count_items" ADD CONSTRAINT "inventory_count_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_lots" ADD CONSTRAINT "ingredient_lots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_lots" ADD CONSTRAINT "ingredient_lots_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_logs" ADD CONSTRAINT "temperature_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_logs" ADD CONSTRAINT "temperature_logs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_logs" ADD CONSTRAINT "temperature_logs_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_safety_checklists" ADD CONSTRAINT "food_safety_checklists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_safety_checklist_items" ADD CONSTRAINT "food_safety_checklist_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "food_safety_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_safety_audits" ADD CONSTRAINT "food_safety_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_safety_audits" ADD CONSTRAINT "food_safety_audits_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "food_safety_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_safety_audits" ADD CONSTRAINT "food_safety_audits_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_safety_audit_responses" ADD CONSTRAINT "food_safety_audit_responses_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "food_safety_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
