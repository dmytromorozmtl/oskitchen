-- Data operations: extend import_jobs, add preview rows, rollbacks, export jobs, data templates.

ALTER TABLE "import_jobs" ADD COLUMN "file_size" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "import_jobs" ADD COLUMN "warning_rows" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "import_jobs" ADD COLUMN "duplicate_rows" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "import_jobs" ADD COLUMN "skipped_rows" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "import_jobs" ADD COLUMN "updated_rows" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "import_jobs" ADD COLUMN "created_rows" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "import_jobs" ADD COLUMN "settings_json" JSONB;
ALTER TABLE "import_jobs" ADD COLUMN "error_message" TEXT;
ALTER TABLE "import_jobs" ADD COLUMN "created_by_id" UUID;

CREATE TYPE "ImportPreviewRowStatus" AS ENUM ('VALID', 'WARNING', 'ERROR', 'DUPLICATE', 'SKIPPED');
CREATE TYPE "ImportPreviewRowAction" AS ENUM ('CREATE', 'UPDATE', 'SKIP', 'REJECT');
CREATE TYPE "ImportRollbackRecordStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "ExportJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

CREATE TABLE "import_job_preview_rows" (
    "id" UUID NOT NULL,
    "import_job_id" UUID NOT NULL,
    "row_number" INTEGER NOT NULL,
    "raw_json" JSONB NOT NULL,
    "normalized_json" JSONB,
    "validation_status" "ImportPreviewRowStatus" NOT NULL DEFAULT 'ERROR',
    "errors_json" JSONB,
    "warnings_json" JSONB,
    "action" "ImportPreviewRowAction" NOT NULL DEFAULT 'REJECT',
    "target_entity_id" UUID,
    "imported_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "import_job_preview_rows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "import_rollbacks" (
    "id" UUID NOT NULL,
    "import_job_id" UUID NOT NULL,
    "performed_by_id" UUID,
    "reason" TEXT NOT NULL,
    "records_rolled_back" INTEGER NOT NULL DEFAULT 0,
    "status" "ImportRollbackRecordStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "import_rollbacks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "export_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "status" "ExportJobStatus" NOT NULL DEFAULT 'COMPLETED',
    "filters_json" JSONB,
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "file_name" VARCHAR(512) NOT NULL,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_templates" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "type" VARCHAR(80) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "columns_json" JSONB NOT NULL,
    "sample_rows_json" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "data_templates_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "import_jobs" DROP CONSTRAINT IF EXISTS "import_jobs_created_by_id_fkey";
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "import_job_preview_rows" ADD CONSTRAINT "import_job_preview_rows_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "import_rollbacks" ADD CONSTRAINT "import_rollbacks_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "import_rollbacks" ADD CONSTRAINT "import_rollbacks_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "data_templates" ADD CONSTRAINT "data_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "import_job_preview_rows_import_job_id_idx" ON "import_job_preview_rows"("import_job_id");
CREATE INDEX "import_job_preview_rows_import_job_id_validation_status_idx" ON "import_job_preview_rows"("import_job_id", "validation_status");

CREATE INDEX "import_rollbacks_import_job_id_idx" ON "import_rollbacks"("import_job_id");

CREATE INDEX "export_jobs_user_id_type_idx" ON "export_jobs"("user_id", "type");
CREATE INDEX "export_jobs_user_id_created_at_idx" ON "export_jobs"("user_id", "created_at");

CREATE INDEX "data_templates_type_active_idx" ON "data_templates"("type", "active");
CREATE INDEX "data_templates_user_id_type_idx" ON "data_templates"("user_id", "type");
