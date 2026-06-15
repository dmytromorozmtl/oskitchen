-- Workspace Templates

DO $$ BEGIN
  CREATE TYPE "TemplateCategory" AS ENUM (
    'WORKSPACE_STARTER','MODULE_PACK','MENU_TEMPLATE','PLAYBOOK_TEMPLATE',
    'IMPORT_TEMPLATE','DEMO_DATASET','STOREFRONT_TEMPLATE',
    'PRODUCTION_TEMPLATE','REPORT_PACK'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TemplateApplicationStatus" AS ENUM (
    'PREVIEWED','APPLYING','APPLIED','PARTIALLY_APPLIED','FAILED','ROLLED_BACK'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TemplateApplyMode" AS ENUM (
    'PREVIEW_ONLY','APPLY_CONFIGURATION_ONLY','APPLY_SAMPLE_DATA',
    'APPLY_SELECTED_MODULES','APPLY_PLAYBOOKS_ONLY','APPLY_IMPORT_TEMPLATES_ONLY'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "workspace_templates" (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "key"                 VARCHAR(120) NOT NULL,
    "title"               VARCHAR(255) NOT NULL,
    "description"         TEXT NOT NULL,
    "category"            "TemplateCategory" NOT NULL DEFAULT 'WORKSPACE_STARTER',
    "business_modes_json" JSONB,
    "version"             VARCHAR(32) NOT NULL DEFAULT '1',
    "system_template"     BOOLEAN NOT NULL DEFAULT TRUE,
    "active"              BOOLEAN NOT NULL DEFAULT TRUE,
    "template_json"       JSONB,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workspace_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_templates_key_key" ON "workspace_templates"("key");
CREATE INDEX IF NOT EXISTS "workspace_templates_category_idx" ON "workspace_templates"("category");
CREATE INDEX IF NOT EXISTS "workspace_templates_active_idx" ON "workspace_templates"("active");

CREATE TABLE IF NOT EXISTS "template_applications" (
    "id"                     UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"                UUID NOT NULL,
    "template_key"           VARCHAR(120) NOT NULL,
    "template_version"       VARCHAR(32) NOT NULL DEFAULT '1',
    "status"                 "TemplateApplicationStatus" NOT NULL DEFAULT 'PREVIEWED',
    "apply_mode"             "TemplateApplyMode" NOT NULL DEFAULT 'PREVIEW_ONLY',
    "selected_sections_json" JSONB,
    "preview_json"           JSONB,
    "result_json"            JSONB,
    "rollback_json"          JSONB,
    "applied_by"             VARCHAR(255),
    "applied_at"             TIMESTAMP(3),
    "rolled_back_at"         TIMESTAMP(3),
    "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "template_applications_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'template_applications_user_fkey') THEN
    ALTER TABLE "template_applications"
      ADD CONSTRAINT "template_applications_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'template_applications_template_fkey') THEN
    ALTER TABLE "template_applications"
      ADD CONSTRAINT "template_applications_template_fkey"
      FOREIGN KEY ("template_key") REFERENCES "workspace_templates"("key") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "template_applications_user_key_idx" ON "template_applications"("user_id", "template_key");
CREATE INDEX IF NOT EXISTS "template_applications_user_status_idx" ON "template_applications"("user_id", "status");
CREATE INDEX IF NOT EXISTS "template_applications_applied_at_idx" ON "template_applications"("applied_at");

CREATE TABLE IF NOT EXISTS "template_application_events" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "user_id"        UUID NOT NULL,
    "event_type"     VARCHAR(80) NOT NULL,
    "performed_by"   VARCHAR(255) NOT NULL,
    "metadata_json"  JSONB,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "template_application_events_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'template_application_events_app_fkey') THEN
    ALTER TABLE "template_application_events"
      ADD CONSTRAINT "template_application_events_app_fkey"
      FOREIGN KEY ("application_id") REFERENCES "template_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'template_application_events_user_fkey') THEN
    ALTER TABLE "template_application_events"
      ADD CONSTRAINT "template_application_events_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "template_application_events_app_idx" ON "template_application_events"("application_id", "created_at");
CREATE INDEX IF NOT EXISTS "template_application_events_user_idx" ON "template_application_events"("user_id", "created_at");
