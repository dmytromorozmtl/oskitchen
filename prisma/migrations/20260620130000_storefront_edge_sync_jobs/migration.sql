-- Storefront Edge Config sync outbox (theme experiment race hardening 5C).

CREATE TYPE "StorefrontEdgeSyncJobStatus" AS ENUM (
  'QUEUED',
  'PROCESSING',
  'SUCCEEDED',
  'FAILED',
  'DEAD'
);

CREATE TABLE "storefront_edge_sync_jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "store_slug" VARCHAR(120) NOT NULL,
  "kind" VARCHAR(64) NOT NULL DEFAULT 'theme_experiment',
  "payload_json" JSONB NOT NULL,
  "expected_version" INTEGER NOT NULL,
  "status" "StorefrontEdgeSyncJobStatus" NOT NULL DEFAULT 'QUEUED',
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "max_attempts" INTEGER NOT NULL DEFAULT 5,
  "next_attempt_at" TIMESTAMP(3),
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "storefront_edge_sync_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_edge_sync_jobs_storefront_id_status_idx"
  ON "storefront_edge_sync_jobs"("storefront_id", "status");

CREATE INDEX "storefront_edge_sync_jobs_status_next_attempt_at_idx"
  ON "storefront_edge_sync_jobs"("status", "next_attempt_at");

ALTER TABLE "storefront_edge_sync_jobs"
  ADD CONSTRAINT "storefront_edge_sync_jobs_storefront_id_fkey"
  FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
