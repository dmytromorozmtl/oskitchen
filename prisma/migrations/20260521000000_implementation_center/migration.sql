-- Implementation & Go-Live Center
-- Additive migration: extends ImplementationProject + adds Phase, ChecklistItem,
-- Event, and GoLiveReadinessCheck models. Does not modify live order data.

-- Extend ImplementationStatus enum with new lifecycle values.
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'SETUP';
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'MIGRATION';
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'TRAINING';
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'TESTING';
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_GO_LIVE';
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'LIVE';
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'POST_LAUNCH';
ALTER TYPE "ImplementationStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Phase + checklist + readiness enums.
DO $$ BEGIN
  CREATE TYPE "ImplementationPhaseKey" AS ENUM (
    'DISCOVERY',
    'WORKSPACE_SETUP',
    'DATA_MIGRATION',
    'INTEGRATIONS',
    'STOREFRONT_SETUP',
    'OPERATIONS_SETUP',
    'TRAINING',
    'UAT',
    'GO_LIVE',
    'POST_LAUNCH'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ImplementationPhaseStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'BLOCKED',
    'COMPLETED',
    'SKIPPED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ImplementationChecklistStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'BLOCKED',
    'DONE',
    'SKIPPED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ImplementationChecklistPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveReadinessStatus" AS ENUM (
    'PASS',
    'WARN',
    'FAIL',
    'NOT_CHECKED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend implementation_projects with new columns.
ALTER TABLE "implementation_projects"
  ADD COLUMN IF NOT EXISTS "readiness_score" INTEGER,
  ADD COLUMN IF NOT EXISTS "readiness_snapshot_json" JSONB,
  ADD COLUMN IF NOT EXISTS "created_by" UUID;

CREATE INDEX IF NOT EXISTS "implementation_projects_target_go_live_date_idx"
  ON "implementation_projects" ("target_go_live_date");
CREATE INDEX IF NOT EXISTS "implementation_projects_assigned_owner_idx"
  ON "implementation_projects" ("assigned_owner");

-- New: implementation_phases
CREATE TABLE IF NOT EXISTS "implementation_phases" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "key" "ImplementationPhaseKey" NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "status" "ImplementationPhaseStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "due_date" DATE,
  "completed_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "implementation_phases_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "implementation_phases_project_id_key_key"
  ON "implementation_phases" ("project_id", "key");
CREATE INDEX IF NOT EXISTS "implementation_phases_project_id_idx"
  ON "implementation_phases" ("project_id");

ALTER TABLE "implementation_phases"
  ADD CONSTRAINT "implementation_phases_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE;

-- New: implementation_checklist_items
CREATE TABLE IF NOT EXISTS "implementation_checklist_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "phase_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" "ImplementationChecklistStatus" NOT NULL DEFAULT 'TODO',
  "priority" "ImplementationChecklistPriority" NOT NULL DEFAULT 'MEDIUM',
  "module_key" VARCHAR(80),
  "action_route" VARCHAR(512),
  "assigned_to_id" UUID,
  "due_at" TIMESTAMP(3),
  "task_id" UUID,
  "required_for_go_live" BOOLEAN NOT NULL DEFAULT FALSE,
  "blocker_reason" TEXT,
  "completed_at" TIMESTAMP(3),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "implementation_checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "implementation_checklist_items_project_id_idx"
  ON "implementation_checklist_items" ("project_id");
CREATE INDEX IF NOT EXISTS "implementation_checklist_items_phase_id_idx"
  ON "implementation_checklist_items" ("phase_id");
CREATE INDEX IF NOT EXISTS "implementation_checklist_items_status_idx"
  ON "implementation_checklist_items" ("status");
CREATE INDEX IF NOT EXISTS "implementation_checklist_items_required_for_go_live_idx"
  ON "implementation_checklist_items" ("required_for_go_live");

ALTER TABLE "implementation_checklist_items"
  ADD CONSTRAINT "implementation_checklist_items_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE;
ALTER TABLE "implementation_checklist_items"
  ADD CONSTRAINT "implementation_checklist_items_phase_id_fkey"
  FOREIGN KEY ("phase_id") REFERENCES "implementation_phases"("id") ON DELETE SET NULL;

-- New: implementation_events
CREATE TABLE IF NOT EXISTS "implementation_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "event_type" VARCHAR(80) NOT NULL,
  "performed_by" VARCHAR(255),
  "summary" VARCHAR(500),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "implementation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "implementation_events_project_id_idx"
  ON "implementation_events" ("project_id");
CREATE INDEX IF NOT EXISTS "implementation_events_created_at_idx"
  ON "implementation_events" ("created_at");

ALTER TABLE "implementation_events"
  ADD CONSTRAINT "implementation_events_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE;

-- New: go_live_readiness_checks
CREATE TABLE IF NOT EXISTS "go_live_readiness_checks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "status" "GoLiveReadinessStatus" NOT NULL DEFAULT 'NOT_CHECKED',
  "required" BOOLEAN NOT NULL DEFAULT FALSE,
  "result_json" JSONB,
  "action_route" VARCHAR(512),
  "explanation" TEXT,
  "checked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "go_live_readiness_checks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "go_live_readiness_checks_project_category_title_key"
  ON "go_live_readiness_checks" ("project_id", "category", "title");
CREATE INDEX IF NOT EXISTS "go_live_readiness_checks_project_id_idx"
  ON "go_live_readiness_checks" ("project_id");
CREATE INDEX IF NOT EXISTS "go_live_readiness_checks_required_idx"
  ON "go_live_readiness_checks" ("required");

ALTER TABLE "go_live_readiness_checks"
  ADD CONSTRAINT "go_live_readiness_checks_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE;
