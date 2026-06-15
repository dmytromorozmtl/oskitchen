-- Critical gap closure phase 2: labor scheduling cost, AP, operations audits, DoorDash

-- CreateEnum
CREATE TYPE "SupplierInvoiceStatus" AS ENUM ('PENDING', 'MATCHED', 'APPROVED', 'PAID', 'DISPUTED');

-- CreateEnum
CREATE TYPE "OperationsCheckFrequency" AS ENUM ('DAILY', 'SHIFT', 'WEEKLY');

-- AlterTable
ALTER TABLE "staff_shifts" ADD COLUMN IF NOT EXISTS "labor_cost" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "supplier_invoices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "invoice_number" VARCHAR(120) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "due_date" DATE,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "SupplierInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "pdf_url" VARCHAR(512),
    "notes" TEXT,
    "approved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoice_lines" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "purchase_order_id" UUID,
    "ingredient_id" UUID,
    "description" VARCHAR(512) NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "total_price" DECIMAL(14,2) NOT NULL,
    "received_qty" DECIMAL(14,4),
    "variance_qty" DECIMAL(14,4),
    "variance_price" DECIMAL(14,2),

    CONSTRAINT "supplier_invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations_checklists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "frequency" "OperationsCheckFrequency" NOT NULL DEFAULT 'DAILY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operations_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations_checklist_items" (
    "id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "operations_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations_audits" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "completed_by_id" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operations_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations_audit_responses" (
    "id" UUID NOT NULL,
    "audit_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "pass" BOOLEAN NOT NULL,
    "notes" TEXT,
    "photo_url" VARCHAR(512),

    CONSTRAINT "operations_audit_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doordash_deliveries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "external_delivery_id" VARCHAR(120),
    "tracking_url" VARCHAR(512),
    "status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    "quote_fee" DECIMAL(12,2),
    "pickup_address" TEXT,
    "delivery_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doordash_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supplier_invoices_user_id_status_idx" ON "supplier_invoices"("user_id", "status");

-- CreateIndex
CREATE INDEX "supplier_invoices_supplier_id_idx" ON "supplier_invoices"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_invoice_lines_invoice_id_idx" ON "supplier_invoice_lines"("invoice_id");

-- CreateIndex
CREATE INDEX "operations_checklists_user_id_idx" ON "operations_checklists"("user_id");

-- CreateIndex
CREATE INDEX "operations_checklist_items_checklist_id_idx" ON "operations_checklist_items"("checklist_id");

-- CreateIndex
CREATE INDEX "operations_audits_user_id_created_at_idx" ON "operations_audits"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "operations_audit_responses_audit_id_idx" ON "operations_audit_responses"("audit_id");

-- CreateIndex
CREATE INDEX "doordash_deliveries_user_id_created_at_idx" ON "doordash_deliveries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "doordash_deliveries_order_id_idx" ON "doordash_deliveries"("order_id");

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "supplier_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoice_lines" ADD CONSTRAINT "supplier_invoice_lines_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations_checklists" ADD CONSTRAINT "operations_checklists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations_checklist_items" ADD CONSTRAINT "operations_checklist_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "operations_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations_audits" ADD CONSTRAINT "operations_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations_audits" ADD CONSTRAINT "operations_audits_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "operations_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations_audits" ADD CONSTRAINT "operations_audits_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations_audit_responses" ADD CONSTRAINT "operations_audit_responses_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "operations_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doordash_deliveries" ADD CONSTRAINT "doordash_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doordash_deliveries" ADD CONSTRAINT "doordash_deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
