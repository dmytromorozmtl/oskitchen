-- Channel import staging, conflicts, rules, rollbacks, retries, Order Hub trace fields,
-- production handoff JSON on kitchen settings, webhook idempotency index.

CREATE TYPE "ChannelImportSourceType" AS ENUM ('WEBHOOK', 'SYNC', 'CSV', 'MANUAL', 'FORM');

CREATE TYPE "ChannelImportBatchStatus" AS ENUM (
    'DRAFT',
    'VALIDATING',
    'NEEDS_REVIEW',
    'READY_TO_IMPORT',
    'IMPORTED',
    'PARTIAL',
    'FAILED',
    'CANCELLED'
);

CREATE TYPE "ChannelImportRecordType" AS ENUM ('ORDER', 'PRODUCT', 'CUSTOMER');

CREATE TYPE "ChannelRecordValidationStatus" AS ENUM (
    'VALID',
    'WARNING',
    'ERROR',
    'DUPLICATE',
    'NEEDS_MAPPING'
);

CREATE TYPE "ChannelConflictSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'BLOCKER');

CREATE TYPE "ChannelConflictResolutionStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

CREATE TYPE "ChannelRuleTrigger" AS ENUM (
    'ORDER_IMPORTED',
    'PRODUCT_IMPORTED',
    'CUSTOMER_IMPORTED',
    'WEBHOOK_RECEIVED',
    'SYNC_COMPLETED',
    'IMPORT_FAILED'
);

CREATE TYPE "ChannelRetryAttemptStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED');

CREATE TABLE "channel_import_batches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "connection_id" UUID,
    "provider" "IntegrationProvider" NOT NULL,
    "source_type" "ChannelImportSourceType" NOT NULL,
    "status" "ChannelImportBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "source_dedupe_key" VARCHAR(320) NOT NULL,
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "valid_records" INTEGER NOT NULL DEFAULT 0,
    "warning_records" INTEGER NOT NULL DEFAULT 0,
    "error_records" INTEGER NOT NULL DEFAULT 0,
    "imported_records" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_import_batches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "channel_import_batches_source_dedupe_key_key" ON "channel_import_batches"("source_dedupe_key");

CREATE INDEX "channel_import_batches_user_id_created_at_idx" ON "channel_import_batches"("user_id", "created_at");

CREATE INDEX "channel_import_batches_user_id_status_idx" ON "channel_import_batches"("user_id", "status");

CREATE INDEX "channel_import_batches_connection_id_idx" ON "channel_import_batches"("connection_id");

ALTER TABLE "channel_import_batches" ADD CONSTRAINT "channel_import_batches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_import_batches" ADD CONSTRAINT "channel_import_batches_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "channel_import_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batch_id" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "external_id" VARCHAR(255) NOT NULL,
    "record_type" "ChannelImportRecordType" NOT NULL,
    "raw_payload_json" JSONB NOT NULL,
    "normalized_json" JSONB,
    "validation_status" "ChannelRecordValidationStatus" NOT NULL DEFAULT 'VALID',
    "conflict_json" JSONB,
    "suggested_fix_json" JSONB,
    "imported_entity_id" UUID,
    "webhook_event_id" UUID,
    "imported_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_import_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "channel_import_records_batch_id_idx" ON "channel_import_records"("batch_id");

CREATE INDEX "channel_import_records_provider_external_id_idx" ON "channel_import_records"("provider", "external_id");

CREATE INDEX "channel_import_records_webhook_event_id_idx" ON "channel_import_records"("webhook_event_id");

CREATE UNIQUE INDEX "channel_import_records_batch_id_provider_external_id_key" ON "channel_import_records"("batch_id", "provider", "external_id");

ALTER TABLE "channel_import_records" ADD CONSTRAINT "channel_import_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "channel_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_import_records" ADD CONSTRAINT "channel_import_records_webhook_event_id_fkey" FOREIGN KEY ("webhook_event_id") REFERENCES "webhook_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "channel_conflicts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "record_id" UUID NOT NULL,
    "conflict_type" VARCHAR(80) NOT NULL,
    "severity" "ChannelConflictSeverity" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "suggested_action" TEXT,
    "status" "ChannelConflictResolutionStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_by" VARCHAR(320),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_conflicts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "channel_conflicts_user_id_status_idx" ON "channel_conflicts"("user_id", "status");

CREATE INDEX "channel_conflicts_record_id_idx" ON "channel_conflicts"("record_id");

CREATE INDEX "channel_conflicts_batch_id_idx" ON "channel_conflicts"("batch_id");

ALTER TABLE "channel_conflicts" ADD CONSTRAINT "channel_conflicts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_conflicts" ADD CONSTRAINT "channel_conflicts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "channel_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_conflicts" ADD CONSTRAINT "channel_conflicts_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "channel_import_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "channel_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "connection_id" UUID,
    "provider" "IntegrationProvider",
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "trigger" "ChannelRuleTrigger" NOT NULL,
    "conditions_json" JSONB NOT NULL,
    "actions_json" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "channel_rules_user_id_active_idx" ON "channel_rules"("user_id", "active");

ALTER TABLE "channel_rules" ADD CONSTRAINT "channel_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_rules" ADD CONSTRAINT "channel_rules_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "channel_import_rollbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batch_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "performed_by" VARCHAR(320) NOT NULL,
    "reason" TEXT,
    "records_rolled_back" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_import_rollbacks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "channel_import_rollbacks_batch_id_idx" ON "channel_import_rollbacks"("batch_id");

ALTER TABLE "channel_import_rollbacks" ADD CONSTRAINT "channel_import_rollbacks_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "channel_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channel_import_rollbacks" ADD CONSTRAINT "channel_import_rollbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "channel_retry_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "webhook_event_id" UUID,
    "sync_job_id" UUID,
    "record_id" UUID,
    "attempt_number" INTEGER NOT NULL,
    "status" "ChannelRetryAttemptStatus" NOT NULL,
    "error_code" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_retry_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "channel_retry_attempts_user_id_created_at_idx" ON "channel_retry_attempts"("user_id", "created_at");

CREATE INDEX "channel_retry_attempts_webhook_event_id_idx" ON "channel_retry_attempts"("webhook_event_id");

CREATE INDEX "channel_retry_attempts_sync_job_id_idx" ON "channel_retry_attempts"("sync_job_id");

ALTER TABLE "channel_retry_attempts" ADD CONSTRAINT "channel_retry_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "orders" ADD COLUMN "channel_import_batch_id" UUID;
ALTER TABLE "orders" ADD COLUMN "channel_trace_json" JSONB;
ALTER TABLE "orders" ADD COLUMN "is_channel_test_order" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "orders_channel_import_batch_id_idx" ON "orders"("channel_import_batch_id");

ALTER TABLE "orders" ADD CONSTRAINT "orders_channel_import_batch_id_fkey" FOREIGN KEY ("channel_import_batch_id") REFERENCES "channel_import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "kitchen_settings" ADD COLUMN "channel_handoff_json" JSONB;

-- DB-level idempotency for webhook external ids (matches application duplicate check).
CREATE UNIQUE INDEX "webhook_events_user_provider_external_event_uidx" ON "webhook_events" ("user_id", "provider", "external_event_id")
WHERE "external_event_id" IS NOT NULL;
