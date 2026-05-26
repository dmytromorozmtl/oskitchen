-- P3 medium priority

ALTER TYPE "ProductionWorkStatus" ADD VALUE IF NOT EXISTS 'HANDOFF';
ALTER TYPE "ProductionWorkEventType" ADD VALUE IF NOT EXISTS 'STATION_HANDOFF';

ALTER TABLE "food_safety_audits" ADD COLUMN IF NOT EXISTS "status" VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS';
ALTER TABLE "food_safety_audits" ADD COLUMN IF NOT EXISTS "corrective_action_required" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "food_safety_audits" ADD COLUMN IF NOT EXISTS "corrective_action_notes" TEXT;
ALTER TABLE "food_safety_audits" ADD COLUMN IF NOT EXISTS "corrective_due_at" TIMESTAMP(3);
ALTER TABLE "food_safety_audits" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3);
ALTER TABLE "food_safety_audits" ADD COLUMN IF NOT EXISTS "verified_by_id" UUID;

CREATE TABLE IF NOT EXISTS "food_safety_corrective_actions" (
    "id" UUID NOT NULL,
    "audit_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    "due_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "verified_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "food_safety_corrective_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "delivery_proofs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "dispatch_id" UUID,
    "photo_url" VARCHAR(512),
    "signature_data_url" TEXT,
    "driver_label" VARCHAR(120),
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "delivery_proofs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pnl_snapshots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period_key" VARCHAR(32) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "summary_json" JSONB NOT NULL,
    "lines_json" JSONB NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'READY',
    "refreshed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pnl_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "menu_rotation_rules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "publish_hour" INTEGER NOT NULL DEFAULT 6,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "menu_rotation_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "holiday_packages" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "available_from" DATE NOT NULL,
    "available_until" DATE NOT NULL,
    "product_ids_json" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "holiday_packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "holiday_package_orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "order_id" UUID,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_name" VARCHAR(255),
    "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "holiday_package_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_proofs_order_id_key" ON "delivery_proofs"("order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "delivery_proofs_dispatch_id_key" ON "delivery_proofs"("dispatch_id");
CREATE UNIQUE INDEX IF NOT EXISTS "pnl_snapshots_user_id_period_key_key" ON "pnl_snapshots"("user_id", "period_key");
CREATE UNIQUE INDEX IF NOT EXISTS "menu_rotation_rules_user_id_menu_id_day_of_week_key" ON "menu_rotation_rules"("user_id", "menu_id", "day_of_week");

ALTER TABLE "food_safety_corrective_actions" ADD CONSTRAINT "food_safety_corrective_actions_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "food_safety_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_safety_corrective_actions" ADD CONSTRAINT "food_safety_corrective_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_safety_audits" ADD CONSTRAINT "food_safety_audits_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_dispatch_id_fkey" FOREIGN KEY ("dispatch_id") REFERENCES "delivery_dispatches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pnl_snapshots" ADD CONSTRAINT "pnl_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_rotation_rules" ADD CONSTRAINT "menu_rotation_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_rotation_rules" ADD CONSTRAINT "menu_rotation_rules_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holiday_packages" ADD CONSTRAINT "holiday_packages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holiday_package_orders" ADD CONSTRAINT "holiday_package_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holiday_package_orders" ADD CONSTRAINT "holiday_package_orders_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "holiday_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holiday_package_orders" ADD CONSTRAINT "holiday_package_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
