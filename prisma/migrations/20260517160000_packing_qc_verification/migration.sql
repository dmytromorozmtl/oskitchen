-- Packing QC: sessions, items, audit events, overrides, scan log (additive; existing packing_verification_events unchanged).

CREATE TYPE "PackingVerificationSessionMode" AS ENUM (
  'ORDER_VERIFY',
  'BAG_VERIFY',
  'ITEM_VERIFY',
  'WAVE_VERIFY',
  'ROUTE_VERIFY',
  'EVENT_LOADOUT_VERIFY',
  'PICKUP_HANDOFF_VERIFY',
  'DELIVERY_HANDOFF_VERIFY'
);

CREATE TYPE "PackingVerificationSessionStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'PASSED',
  'FAILED',
  'PARTIAL',
  'OVERRIDDEN',
  'CANCELLED'
);

CREATE TYPE "PackingVerificationItemStatus" AS ENUM (
  'PENDING',
  'VERIFIED',
  'MISSING',
  'EXTRA',
  'WRONG_ITEM',
  'DAMAGED',
  'SUBSTITUTED'
);

CREATE TABLE "packing_verification_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "order_id" UUID,
  "packing_batch_id" UUID,
  "packing_wave_id" UUID,
  "route_id" UUID,
  "event_id" UUID,
  "mode" "PackingVerificationSessionMode" NOT NULL DEFAULT 'ORDER_VERIFY',
  "status" "PackingVerificationSessionStatus" NOT NULL DEFAULT 'OPEN',
  "started_by_id" UUID NOT NULL,
  "completed_by_id" UUID,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "packing_verification_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packing_verification_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "order_item_id" UUID,
  "packing_task_id" UUID,
  "product_id" UUID,
  "title" VARCHAR(512) NOT NULL,
  "expected_quantity" INTEGER NOT NULL,
  "verified_quantity" INTEGER NOT NULL DEFAULT 0,
  "status" "PackingVerificationItemStatus" NOT NULL DEFAULT 'PENDING',
  "allergen_check_status" VARCHAR(32),
  "label_check_status" VARCHAR(32),
  "notes" TEXT,
  "verified_by_id" UUID,
  "verified_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "packing_verification_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packing_qc_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "item_id" UUID,
  "order_id" UUID,
  "event_type" VARCHAR(80) NOT NULL,
  "performed_by_id" UUID,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "packing_qc_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packing_verification_overrides" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "reason" TEXT NOT NULL,
  "approved_by_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "packing_verification_overrides_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packing_scan_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token" VARCHAR(256) NOT NULL,
  "token_type" VARCHAR(64) NOT NULL,
  "source" VARCHAR(64) NOT NULL,
  "success" BOOLEAN NOT NULL DEFAULT false,
  "error_message" TEXT,
  "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "packing_scan_events_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_packing_batch_id_fkey" FOREIGN KEY ("packing_batch_id") REFERENCES "packing_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_packing_wave_id_fkey" FOREIGN KEY ("packing_wave_id") REFERENCES "packing_waves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_started_by_id_fkey" FOREIGN KEY ("started_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "packing_verification_items" ADD CONSTRAINT "packing_verification_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "packing_verification_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_verification_items" ADD CONSTRAINT "packing_verification_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_verification_items" ADD CONSTRAINT "packing_verification_items_packing_task_id_fkey" FOREIGN KEY ("packing_task_id") REFERENCES "packing_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_verification_items" ADD CONSTRAINT "packing_verification_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_verification_items" ADD CONSTRAINT "packing_verification_items_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "packing_qc_events" ADD CONSTRAINT "packing_qc_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "packing_verification_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_qc_events" ADD CONSTRAINT "packing_qc_events_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "packing_verification_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_qc_events" ADD CONSTRAINT "packing_qc_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "packing_qc_events" ADD CONSTRAINT "packing_qc_events_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "packing_verification_overrides" ADD CONSTRAINT "packing_verification_overrides_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "packing_verification_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packing_verification_overrides" ADD CONSTRAINT "packing_verification_overrides_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "packing_scan_events" ADD CONSTRAINT "packing_scan_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "packing_verification_sessions_user_id_idx" ON "packing_verification_sessions"("user_id");
CREATE INDEX "packing_verification_sessions_user_id_status_idx" ON "packing_verification_sessions"("user_id", "status");
CREATE INDEX "packing_verification_sessions_order_id_idx" ON "packing_verification_sessions"("order_id");
CREATE INDEX "packing_verification_sessions_packing_wave_id_idx" ON "packing_verification_sessions"("packing_wave_id");
CREATE INDEX "packing_verification_sessions_route_id_idx" ON "packing_verification_sessions"("route_id");
CREATE INDEX "packing_verification_sessions_event_id_idx" ON "packing_verification_sessions"("event_id");
CREATE INDEX "packing_verification_sessions_status_idx" ON "packing_verification_sessions"("status");

CREATE INDEX "packing_verification_items_session_id_idx" ON "packing_verification_items"("session_id");
CREATE INDEX "packing_verification_items_session_id_status_idx" ON "packing_verification_items"("session_id", "status");
CREATE INDEX "packing_verification_items_order_item_id_idx" ON "packing_verification_items"("order_item_id");

CREATE INDEX "packing_qc_events_session_id_created_at_idx" ON "packing_qc_events"("session_id", "created_at");
CREATE INDEX "packing_qc_events_order_id_idx" ON "packing_qc_events"("order_id");
CREATE INDEX "packing_qc_events_item_id_idx" ON "packing_qc_events"("item_id");

CREATE INDEX "packing_verification_overrides_session_id_idx" ON "packing_verification_overrides"("session_id");

CREATE INDEX "packing_scan_events_user_id_scanned_at_idx" ON "packing_scan_events"("user_id", "scanned_at");
CREATE INDEX "packing_scan_events_scanned_at_idx" ON "packing_scan_events"("scanned_at");
