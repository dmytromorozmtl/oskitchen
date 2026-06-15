-- CreateEnum
CREATE TYPE "ErrorRecoverySource" AS ENUM ('WEBHOOK_JOB');

-- CreateEnum
CREATE TYPE "ErrorRecoveryItemStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'IGNORED');

-- CreateTable
CREATE TABLE "error_recovery_items" (
    "id" UUID NOT NULL,
    "source" "ErrorRecoverySource" NOT NULL,
    "source_id" VARCHAR(80) NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "provider" "IntegrationProvider",
    "event_type" VARCHAR(255),
    "webhook_event_id" UUID,
    "webhook_job_id" UUID,
    "status" "ErrorRecoveryItemStatus" NOT NULL DEFAULT 'OPEN',
    "severity" VARCHAR(32) NOT NULL DEFAULT 'high',
    "last_error" TEXT,
    "attempts" INTEGER,
    "max_attempts" INTEGER,
    "suggested_action" TEXT,
    "safe_retry_href" VARCHAR(512),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "error_recovery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "error_recovery_items_source_source_id_key" ON "error_recovery_items"("source", "source_id");

-- CreateIndex
CREATE INDEX "error_recovery_items_user_id_status_idx" ON "error_recovery_items"("user_id", "status");

-- CreateIndex
CREATE INDEX "error_recovery_items_workspace_id_status_idx" ON "error_recovery_items"("workspace_id", "status");

-- AddForeignKey
ALTER TABLE "error_recovery_items" ADD CONSTRAINT "error_recovery_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_recovery_items" ADD CONSTRAINT "error_recovery_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
