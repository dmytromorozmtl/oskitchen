-- Commercial launch: reservation calendar + waitlist
ALTER TABLE "storefront_reservations"
  ADD COLUMN IF NOT EXISTS "duration_minutes" INTEGER NOT NULL DEFAULT 90,
  ADD COLUMN IF NOT EXISTS "table_id" VARCHAR(64);

CREATE TABLE IF NOT EXISTS "storefront_waitlist_entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "customer_name" VARCHAR(255) NOT NULL,
  "customer_phone" VARCHAR(64) NOT NULL,
  "party_size" INTEGER NOT NULL,
  "quoted_minutes" INTEGER NOT NULL DEFAULT 20,
  "status" VARCHAR(32) NOT NULL DEFAULT 'WAITING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_waitlist_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "storefront_waitlist_entries_storefront_id_status_idx"
  ON "storefront_waitlist_entries"("storefront_id", "status");

ALTER TABLE "storefront_waitlist_entries"
  ADD CONSTRAINT "storefront_waitlist_entries_storefront_id_fkey"
  FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
