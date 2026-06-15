-- POS Terminal module (front-of-house commerce)

CREATE TYPE "PosTerminalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
CREATE TYPE "PosTerminalMode" AS ENUM ('COUNTER', 'PICKUP', 'KIOSK');
CREATE TYPE "PosRegisterStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "PosShiftStatus" AS ENUM ('OPEN', 'CLOSED', 'SUSPENDED');
CREATE TYPE "PosCartStatus" AS ENUM ('ACTIVE', 'HELD', 'CHECKED_OUT', 'CANCELLED');
CREATE TYPE "PosTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'VOIDED', 'FAILED');
CREATE TYPE "PosPaymentRecordStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'VOIDED');

ALTER TABLE "products" ADD COLUMN "pos_visible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "barcode" VARCHAR(64);

ALTER TABLE "kitchen_settings" ADD COLUMN "pos_settings_json" JSONB;

CREATE TABLE "pos_terminals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "location_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "device_label" VARCHAR(255),
    "status" "PosTerminalStatus" NOT NULL DEFAULT 'ACTIVE',
    "mode" "PosTerminalMode" NOT NULL DEFAULT 'COUNTER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_terminals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_registers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "location_id" UUID,
    "pos_terminal_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "status" "PosRegisterStatus" NOT NULL DEFAULT 'ACTIVE',
    "cash_tracking_enabled" BOOLEAN NOT NULL DEFAULT true,
    "receipt_printer_name" VARCHAR(255),
    "kitchen_printer_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_registers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_shifts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "location_id" UUID,
    "register_id" UUID NOT NULL,
    "opened_by_staff_id" UUID NOT NULL,
    "closed_by_staff_id" UUID,
    "opening_cash_amount" DECIMAL(12,2) NOT NULL,
    "closing_cash_amount" DECIMAL(12,2),
    "expected_cash_amount" DECIMAL(12,2),
    "variance_amount" DECIMAL(12,2),
    "status" "PosShiftStatus" NOT NULL DEFAULT 'OPEN',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "pos_shifts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_carts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "location_id" UUID,
    "register_id" UUID NOT NULL,
    "staff_id" UUID,
    "status" "PosCartStatus" NOT NULL DEFAULT 'ACTIVE',
    "customer_id" UUID,
    "cart_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_carts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "location_id" UUID,
    "register_id" UUID NOT NULL,
    "shift_id" UUID,
    "order_id" UUID NOT NULL,
    "customer_id" UUID,
    "staff_id" UUID,
    "payment_mode" VARCHAR(64) NOT NULL,
    "payment_status" VARCHAR(40) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tip" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "external_payment_reference" VARCHAR(255),
    "receipt_number" VARCHAR(64) NOT NULL,
    "status" "PosTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_payments" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "payment_mode" VARCHAR(64) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PosPaymentRecordStatus" NOT NULL DEFAULT 'PAID',
    "provider" VARCHAR(64) NOT NULL DEFAULT 'INTERNAL',
    "provider_reference" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_receipts" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "receipt_number" VARCHAR(64) NOT NULL,
    "receipt_html" TEXT,
    "receipt_text" TEXT NOT NULL,
    "printed_at" TIMESTAMP(3),
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_receipts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_held_orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "customer_name" VARCHAR(255),
    "held_by_staff_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "pos_held_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_audit_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "register_id" UUID,
    "shift_id" UUID,
    "transaction_id" UUID,
    "staff_id" UUID,
    "action" VARCHAR(120) NOT NULL,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_inventory_impact_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "transaction_id" UUID,
    "product_id" UUID,
    "quantity" DECIMAL(14,4) NOT NULL,
    "note" TEXT,
    "status" VARCHAR(64) NOT NULL DEFAULT 'PENDING_CONFIGURATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_inventory_impact_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pos_transactions_order_id_key" ON "pos_transactions"("order_id");
CREATE UNIQUE INDEX "pos_receipts_transaction_id_key" ON "pos_receipts"("transaction_id");

CREATE INDEX "pos_terminals_user_id_location_id_idx" ON "pos_terminals"("user_id", "location_id");
CREATE INDEX "pos_terminals_user_id_status_idx" ON "pos_terminals"("user_id", "status");

CREATE INDEX "pos_registers_user_id_location_id_idx" ON "pos_registers"("user_id", "location_id");
CREATE INDEX "pos_registers_user_id_status_idx" ON "pos_registers"("user_id", "status");

CREATE INDEX "pos_shifts_user_id_register_id_status_idx" ON "pos_shifts"("user_id", "register_id", "status");
CREATE INDEX "pos_shifts_register_id_status_idx" ON "pos_shifts"("register_id", "status");

CREATE INDEX "pos_carts_user_id_register_id_status_idx" ON "pos_carts"("user_id", "register_id", "status");

CREATE INDEX "pos_transactions_user_id_created_at_idx" ON "pos_transactions"("user_id", "created_at");
CREATE INDEX "pos_transactions_register_id_created_at_idx" ON "pos_transactions"("register_id", "created_at");
CREATE INDEX "pos_transactions_shift_id_idx" ON "pos_transactions"("shift_id");
CREATE INDEX "pos_transactions_staff_id_idx" ON "pos_transactions"("staff_id");
CREATE INDEX "pos_transactions_receipt_number_idx" ON "pos_transactions"("receipt_number");

CREATE INDEX "pos_payments_transaction_id_idx" ON "pos_payments"("transaction_id");
CREATE INDEX "pos_receipts_receipt_number_idx" ON "pos_receipts"("receipt_number");

CREATE INDEX "pos_held_orders_user_id_created_at_idx" ON "pos_held_orders"("user_id", "created_at");

CREATE INDEX "pos_audit_events_user_id_created_at_idx" ON "pos_audit_events"("user_id", "created_at");
CREATE INDEX "pos_audit_events_register_id_idx" ON "pos_audit_events"("register_id");

CREATE INDEX "pos_inventory_impact_events_user_id_created_at_idx" ON "pos_inventory_impact_events"("user_id", "created_at");
CREATE INDEX "pos_inventory_impact_events_order_id_idx" ON "pos_inventory_impact_events"("order_id");

ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pos_registers" ADD CONSTRAINT "pos_registers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_registers" ADD CONSTRAINT "pos_registers_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_registers" ADD CONSTRAINT "pos_registers_pos_terminal_id_fkey" FOREIGN KEY ("pos_terminal_id") REFERENCES "pos_terminals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "pos_registers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_opened_by_staff_id_fkey" FOREIGN KEY ("opened_by_staff_id") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_closed_by_staff_id_fkey" FOREIGN KEY ("closed_by_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pos_carts" ADD CONSTRAINT "pos_carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_carts" ADD CONSTRAINT "pos_carts_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "pos_registers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_carts" ADD CONSTRAINT "pos_carts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_carts" ADD CONSTRAINT "pos_carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "pos_registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "pos_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pos_payments" ADD CONSTRAINT "pos_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "pos_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pos_receipts" ADD CONSTRAINT "pos_receipts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "pos_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pos_held_orders" ADD CONSTRAINT "pos_held_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_held_orders" ADD CONSTRAINT "pos_held_orders_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "pos_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_held_orders" ADD CONSTRAINT "pos_held_orders_held_by_staff_id_fkey" FOREIGN KEY ("held_by_staff_id") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pos_audit_events" ADD CONSTRAINT "pos_audit_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_audit_events" ADD CONSTRAINT "pos_audit_events_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "pos_registers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_audit_events" ADD CONSTRAINT "pos_audit_events_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "pos_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_audit_events" ADD CONSTRAINT "pos_audit_events_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "pos_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_audit_events" ADD CONSTRAINT "pos_audit_events_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pos_inventory_impact_events" ADD CONSTRAINT "pos_inventory_impact_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
