-- CreateEnum
CREATE TYPE "WebhookProcessingJobStatus" AS ENUM (
  'QUEUED',
  'PROCESSING',
  'PROCESSED',
  'FAILED',
  'RETRYING',
  'SIGNATURE_FAILED',
  'IGNORED',
  'UNSUPPORTED',
  'CANCELLED'
);

-- CreateTable
CREATE TABLE "webhook_processing_jobs" (
    "id" UUID NOT NULL,
    "webhook_event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "status" "WebhookProcessingJobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 8,
    "next_attempt_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_processing_jobs_webhook_event_id_key" ON "webhook_processing_jobs"("webhook_event_id");

-- CreateIndex
CREATE INDEX "webhook_processing_jobs_status_next_attempt_at_idx" ON "webhook_processing_jobs"("status", "next_attempt_at");

-- CreateIndex
CREATE INDEX "webhook_processing_jobs_user_id_created_at_idx" ON "webhook_processing_jobs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "webhook_processing_jobs" ADD CONSTRAINT "webhook_processing_jobs_webhook_event_id_fkey" FOREIGN KEY ("webhook_event_id") REFERENCES "webhook_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_processing_jobs" ADD CONSTRAINT "webhook_processing_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
