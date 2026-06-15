-- Enterprise audit trail: enums, AuditLog extensions, retention + export tables.

CREATE TYPE "AuditLogSeverity" AS ENUM ('INFO', 'NOTICE', 'WARNING', 'CRITICAL');
CREATE TYPE "AuditLogSource" AS ENUM ('USER', 'SYSTEM', 'WEBHOOK', 'IMPORT', 'AUTOMATION', 'AI_COPILOT', 'BILLING_PROVIDER', 'SALES_CHANNEL', 'API', 'CRON', 'SUPERADMIN');
CREATE TYPE "AuditExportFormat" AS ENUM ('CSV', 'JSON');
CREATE TYPE "AuditExportStatus" AS ENUM ('PENDING', 'COMPLETE', 'FAILED');

ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "actor_staff_id" UUID;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "actor_email" VARCHAR(255);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "actor_role" VARCHAR(64);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "category" VARCHAR(40);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "severity" "AuditLogSeverity";
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "source" "AuditLogSource";
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "entity_label" VARCHAR(500);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "route" VARCHAR(512);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "method" VARCHAR(16);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ip_hash" VARCHAR(128);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "user_agent_hash" VARCHAR(128);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "request_id" VARCHAR(80);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "before_json" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "after_json" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "diff_json" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "redaction_applied" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_actor_staff_id_fkey'
  ) THEN
    ALTER TABLE "audit_logs"
      ADD CONSTRAINT "audit_logs_actor_staff_id_fkey"
      FOREIGN KEY ("actor_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "audit_logs_category_idx" ON "audit_logs" ("category");
CREATE INDEX IF NOT EXISTS "audit_logs_source_idx" ON "audit_logs" ("source");
CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs" ("severity");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_type_entity_id_idx" ON "audit_logs" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "audit_logs_request_id_idx" ON "audit_logs" ("request_id");

CREATE TABLE IF NOT EXISTS "audit_retention_policies" (
  "id" UUID NOT NULL,
  "workspace_id" UUID NOT NULL,
  "retention_days" INTEGER NOT NULL DEFAULT 365,
  "export_before_delete" BOOLEAN NOT NULL DEFAULT true,
  "archive_before_delete" BOOLEAN NOT NULL DEFAULT false,
  "legal_hold_note" VARCHAR(500),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "audit_retention_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_retention_policies_workspace_id_key" UNIQUE ("workspace_id"),
  CONSTRAINT "audit_retention_policies_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "audit_exports" (
  "id" UUID NOT NULL,
  "workspace_id" UUID NOT NULL,
  "requested_by_id" UUID NOT NULL,
  "filters_json" JSONB NOT NULL,
  "format" "AuditExportFormat" NOT NULL,
  "status" "AuditExportStatus" NOT NULL DEFAULT 'PENDING',
  "row_count" INTEGER NOT NULL DEFAULT 0,
  "file_url" TEXT,
  "error_message" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),

  CONSTRAINT "audit_exports_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_exports_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "audit_exports_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "audit_exports_workspace_id_created_at_idx" ON "audit_exports" ("workspace_id", "created_at");
