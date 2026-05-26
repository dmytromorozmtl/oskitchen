-- Channel Operations Center: sync job log (additive).

CREATE TYPE "ChannelSyncJobType" AS ENUM ('ORDERS', 'PRODUCTS', 'MENUS', 'CUSTOMERS', 'STATUS');

CREATE TYPE "ChannelSyncJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

CREATE TABLE "channel_sync_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "connection_id" UUID,
    "provider" "IntegrationProvider" NOT NULL,
    "type" "ChannelSyncJobType" NOT NULL,
    "status" "ChannelSyncJobStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "records_created" INTEGER NOT NULL DEFAULT 0,
    "records_updated" INTEGER NOT NULL DEFAULT 0,
    "records_failed" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "result_json" JSONB,

    CONSTRAINT "channel_sync_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "channel_sync_jobs_user_id_started_at_idx" ON "channel_sync_jobs"("user_id", "started_at");

CREATE INDEX "channel_sync_jobs_connection_id_idx" ON "channel_sync_jobs"("connection_id");

ALTER TABLE "channel_sync_jobs" ADD CONSTRAINT "channel_sync_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_sync_jobs" ADD CONSTRAINT "channel_sync_jobs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
