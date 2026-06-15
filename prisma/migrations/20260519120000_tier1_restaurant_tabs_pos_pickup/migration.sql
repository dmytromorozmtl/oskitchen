-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'DIRTY', 'CLEANING');

-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('RECTANGLE', 'CIRCLE', 'SQUARE');

-- CreateTable
CREATE TABLE "restaurant_tables" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "section" VARCHAR(120),
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "shape" "TableShape" NOT NULL DEFAULT 'RECTANGLE',
    "position_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 120,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 120,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_tabs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "table_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tip" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_tabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_tab_items" (
    "id" UUID NOT NULL,
    "tab_id" UUID NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid_by_id" VARCHAR(64),

    CONSTRAINT "pos_tab_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_windows" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "store_slug" VARCHAR(120) NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" VARCHAR(8) NOT NULL,
    "end_time" VARCHAR(8) NOT NULL,
    "max_orders" INTEGER NOT NULL DEFAULT 20,
    "current_orders" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pickup_windows_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "table_id" UUID;

-- CreateIndex
CREATE INDEX "restaurant_tables_user_id_idx" ON "restaurant_tables"("user_id");

-- CreateIndex
CREATE INDEX "pos_tabs_user_id_idx" ON "pos_tabs"("user_id");

-- CreateIndex
CREATE INDEX "pos_tabs_user_id_status_idx" ON "pos_tabs"("user_id", "status");

-- CreateIndex
CREATE INDEX "pos_tab_items_tab_id_idx" ON "pos_tab_items"("tab_id");

-- CreateIndex
CREATE INDEX "pickup_windows_user_id_store_slug_idx" ON "pickup_windows"("user_id", "store_slug");

-- CreateIndex
CREATE INDEX "pickup_windows_user_id_store_slug_day_of_week_idx" ON "pickup_windows"("user_id", "store_slug", "day_of_week");

-- CreateIndex
CREATE INDEX "orders_table_id_idx" ON "orders"("table_id");

-- AddForeignKey
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_tabs" ADD CONSTRAINT "pos_tabs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_tab_items" ADD CONSTRAINT "pos_tab_items_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "pos_tabs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_windows" ADD CONSTRAINT "pickup_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
