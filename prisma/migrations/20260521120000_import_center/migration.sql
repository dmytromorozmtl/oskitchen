-- Import Center expansion
-- Additive: extends ImportType enum, adds ImportCommitMode enum, augments
-- import_jobs + import_job_preview_rows with audit + rollback fields. No
-- existing data is touched.

-- Extend ImportType enum.
ALTER TYPE "ImportType" ADD VALUE IF NOT EXISTS 'BRANDS';
ALTER TYPE "ImportType" ADD VALUE IF NOT EXISTS 'LOCATIONS';
ALTER TYPE "ImportType" ADD VALUE IF NOT EXISTS 'NUTRITION_ALLERGENS';
ALTER TYPE "ImportType" ADD VALUE IF NOT EXISTS 'PRODUCT_MAPPINGS';
ALTER TYPE "ImportType" ADD VALUE IF NOT EXISTS 'MENU_ASSIGNMENTS';
ALTER TYPE "ImportType" ADD VALUE IF NOT EXISTS 'PURCHASE_ITEMS';

DO $$ BEGIN
  CREATE TYPE "ImportCommitMode" AS ENUM (
    'CREATE_ONLY',
    'UPDATE_EXISTING',
    'UPSERT',
    'SKIP_DUPLICATES'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend import_jobs.
ALTER TABLE "import_jobs"
  ADD COLUMN IF NOT EXISTS "rejected_rows" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "commit_mode" "ImportCommitMode",
  ADD COLUMN IF NOT EXISTS "preview_json" JSONB,
  ADD COLUMN IF NOT EXISTS "rollback_json" JSONB,
  ADD COLUMN IF NOT EXISTS "validated_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "committed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rolled_back_at" TIMESTAMP(3);

-- Extend import_job_preview_rows.
ALTER TABLE "import_job_preview_rows"
  ADD COLUMN IF NOT EXISTS "duplicate_of_id" UUID;

CREATE INDEX IF NOT EXISTS "import_jobs_user_id_status_idx"
  ON "import_jobs" ("user_id", "status");
