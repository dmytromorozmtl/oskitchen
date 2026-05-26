-- Operations Playbooks

DO $$ BEGIN
  CREATE TYPE "PlaybookType" AS ENUM (
    'DAILY_OPERATIONS','WEEKLY_CYCLE','EVENT_WORKFLOW','PREORDER_WORKFLOW',
    'SERVICE_SHIFT','PRODUCTION_DAY','PACKING_DAY','DELIVERY_DAY',
    'OPENING_CHECKLIST','CLOSING_CHECKLIST','INCIDENT_RESPONSE',
    'ONBOARDING','GO_LIVE'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PlaybookStatus" AS ENUM (
    'TEMPLATE','READY','RUNNING','BLOCKED','COMPLETED','CANCELLED','ARCHIVED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PlaybookRunStepStatus" AS ENUM (
    'NOT_STARTED','IN_PROGRESS','BLOCKED','COMPLETED','SKIPPED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PlaybookTriggerType" AS ENUM (
    'MANUAL','DAILY','WEEKLY','EVENT_DATE','MENU_CUTOFF',
    'PRODUCTION_DATE','ORDER_VOLUME','INCIDENT'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "playbooks" (
    "id"                        UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"                   UUID,
    "title"                     VARCHAR(255) NOT NULL,
    "slug"                      VARCHAR(120),
    "description"               TEXT NOT NULL,
    "type"                      "PlaybookType" NOT NULL DEFAULT 'DAILY_OPERATIONS',
    "business_modes_json"       JSONB,
    "recommended_modules_json"  JSONB,
    "default_roles_json"        JSONB,
    "trigger_type"              "PlaybookTriggerType" NOT NULL DEFAULT 'MANUAL',
    "recurrence_rule"           VARCHAR(255),
    "active"                    BOOLEAN NOT NULL DEFAULT TRUE,
    "system_template"           BOOLEAN NOT NULL DEFAULT FALSE,
    "status"                    "PlaybookStatus" NOT NULL DEFAULT 'READY',
    "created_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playbooks_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbooks_user_fkey') THEN
    ALTER TABLE "playbooks"
      ADD CONSTRAINT "playbooks_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "playbooks_user_active_idx" ON "playbooks"("user_id", "active");
CREATE INDEX IF NOT EXISTS "playbooks_type_idx" ON "playbooks"("type");
CREATE INDEX IF NOT EXISTS "playbooks_system_template_idx" ON "playbooks"("system_template");

CREATE TABLE IF NOT EXISTS "playbook_steps" (
    "id"                         UUID NOT NULL DEFAULT gen_random_uuid(),
    "playbook_id"                UUID NOT NULL,
    "title"                      VARCHAR(255) NOT NULL,
    "description"                TEXT,
    "sort_order"                 INTEGER NOT NULL,
    "recommended_role"           VARCHAR(64),
    "module_key"                 VARCHAR(80),
    "action_route"               VARCHAR(512),
    "estimated_minutes"          INTEGER,
    "required"                   BOOLEAN NOT NULL DEFAULT TRUE,
    "checklist_json"             JSONB,
    "task_template_json"         JSONB,
    "dependency_step_ids_json"   JSONB,
    "created_at"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playbook_steps_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_steps_playbook_fkey') THEN
    ALTER TABLE "playbook_steps"
      ADD CONSTRAINT "playbook_steps_playbook_fkey"
      FOREIGN KEY ("playbook_id") REFERENCES "playbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "playbook_steps_playbook_sort_idx" ON "playbook_steps"("playbook_id", "sort_order");

CREATE TABLE IF NOT EXISTS "playbook_runs" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "playbook_id"      UUID NOT NULL,
    "user_id"          UUID NOT NULL,
    "brand_id"         UUID,
    "location_id"      UUID,
    "title"            VARCHAR(255) NOT NULL,
    "status"           "PlaybookStatus" NOT NULL DEFAULT 'RUNNING',
    "business_mode"    VARCHAR(40),
    "started_by"       VARCHAR(255),
    "started_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at"     TIMESTAMP(3),
    "due_at"           TIMESTAMP(3),
    "source_type"      VARCHAR(80),
    "source_id"        VARCHAR(120),
    "notes"            TEXT,
    "tasks_generated"  BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playbook_runs_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_runs_playbook_fkey') THEN
    ALTER TABLE "playbook_runs"
      ADD CONSTRAINT "playbook_runs_playbook_fkey"
      FOREIGN KEY ("playbook_id") REFERENCES "playbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_runs_user_fkey') THEN
    ALTER TABLE "playbook_runs"
      ADD CONSTRAINT "playbook_runs_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_runs_brand_fkey') THEN
    ALTER TABLE "playbook_runs"
      ADD CONSTRAINT "playbook_runs_brand_fkey"
      FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_runs_location_fkey') THEN
    ALTER TABLE "playbook_runs"
      ADD CONSTRAINT "playbook_runs_location_fkey"
      FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "playbook_runs_user_status_idx" ON "playbook_runs"("user_id", "status");
CREATE INDEX IF NOT EXISTS "playbook_runs_user_due_idx" ON "playbook_runs"("user_id", "due_at");
CREATE INDEX IF NOT EXISTS "playbook_runs_playbook_idx" ON "playbook_runs"("playbook_id");
CREATE INDEX IF NOT EXISTS "playbook_runs_source_idx" ON "playbook_runs"("source_type", "source_id");

CREATE TABLE IF NOT EXISTS "playbook_run_steps" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id"           UUID NOT NULL,
    "step_id"          UUID NOT NULL,
    "status"           "PlaybookRunStepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "assigned_to_id"   UUID,
    "assigned_role"    VARCHAR(64),
    "task_id"          UUID,
    "started_at"       TIMESTAMP(3),
    "completed_at"     TIMESTAMP(3),
    "blocked_reason"   TEXT,
    "notes"            TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playbook_run_steps_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_run_steps_run_fkey') THEN
    ALTER TABLE "playbook_run_steps"
      ADD CONSTRAINT "playbook_run_steps_run_fkey"
      FOREIGN KEY ("run_id") REFERENCES "playbook_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_run_steps_step_fkey') THEN
    ALTER TABLE "playbook_run_steps"
      ADD CONSTRAINT "playbook_run_steps_step_fkey"
      FOREIGN KEY ("step_id") REFERENCES "playbook_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_run_steps_task_fkey') THEN
    ALTER TABLE "playbook_run_steps"
      ADD CONSTRAINT "playbook_run_steps_task_fkey"
      FOREIGN KEY ("task_id") REFERENCES "kitchen_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "playbook_run_steps_run_step_key" ON "playbook_run_steps"("run_id", "step_id");
CREATE INDEX IF NOT EXISTS "playbook_run_steps_run_status_idx" ON "playbook_run_steps"("run_id", "status");
CREATE INDEX IF NOT EXISTS "playbook_run_steps_assigned_idx" ON "playbook_run_steps"("assigned_to_id");

CREATE TABLE IF NOT EXISTS "playbook_events" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "playbook_id"   UUID,
    "run_id"        UUID,
    "step_id"       UUID,
    "user_id"       UUID NOT NULL,
    "event_type"    VARCHAR(80) NOT NULL,
    "performed_by"  VARCHAR(255) NOT NULL,
    "metadata_json" JSONB,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playbook_events_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_events_playbook_fkey') THEN
    ALTER TABLE "playbook_events"
      ADD CONSTRAINT "playbook_events_playbook_fkey"
      FOREIGN KEY ("playbook_id") REFERENCES "playbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_events_run_fkey') THEN
    ALTER TABLE "playbook_events"
      ADD CONSTRAINT "playbook_events_run_fkey"
      FOREIGN KEY ("run_id") REFERENCES "playbook_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_events_user_fkey') THEN
    ALTER TABLE "playbook_events"
      ADD CONSTRAINT "playbook_events_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "playbook_events_user_created_idx" ON "playbook_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "playbook_events_run_created_idx" ON "playbook_events"("run_id", "created_at");
