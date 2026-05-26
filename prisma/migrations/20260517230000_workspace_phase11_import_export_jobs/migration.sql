-- Phase 11: ImportJob / ExportJob workspace scoping (nullable during migration).
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;

CREATE INDEX IF NOT EXISTS "import_jobs_workspace_id_created_at_idx"
  ON "import_jobs" ("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "export_jobs_workspace_id_created_at_idx"
  ON "export_jobs" ("workspace_id", "created_at");

ALTER TABLE "import_jobs"
  ADD CONSTRAINT "import_jobs_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "export_jobs"
  ADD CONSTRAINT "export_jobs_workspace_id_fkey"
  FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
