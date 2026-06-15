-- Go-live Command Center
-- New enums + 6 new tables. Existing GoLiveTestRun is untouched.

DO $$ BEGIN
  CREATE TYPE "GoLiveLaunchStatus" AS ENUM (
    'NOT_STARTED', 'IN_PROGRESS', 'NEEDS_REVIEW', 'BLOCKED',
    'READY', 'APPROVED', 'LIVE', 'POST_LAUNCH_MONITORING',
    'ROLLBACK_MODE', 'COMPLETED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveLaunchStage" AS ENUM (
    'DISCOVERY', 'DATA_MIGRATION', 'CATALOG_SETUP', 'CHANNEL_INTEGRATIONS',
    'PRODUCTION_VALIDATION', 'PACKING_VALIDATION', 'DELIVERY_VALIDATION',
    'STAFF_TRAINING', 'FINANCIAL_VALIDATION', 'SIMULATION',
    'SOFT_LAUNCH', 'FULL_GO_LIVE', 'POST_LAUNCH_MONITORING'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveLaunchMode" AS ENUM ('PILOT', 'SOFT', 'FULL', 'PHASED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveBlockerSeverity" AS ENUM ('INFO', 'WARNING', 'HIGH_RISK', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveChecklistStatus" AS ENUM (
    'TODO', 'IN_PROGRESS', 'NEEDS_REVIEW', 'BLOCKED', 'DONE', 'WAIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveSimulationType" AS ENUM (
    'LUNCH_RUSH', 'MEAL_PREP_BATCH', 'CATERING_EVENT', 'MULTI_LOCATION_DAY',
    'DELIVERY_SURGE', 'HOLIDAY_VOLUME', 'GHOST_KITCHEN_SPIKE', 'CUSTOM'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveSimulationResult" AS ENUM (
    'PENDING', 'RUNNING', 'PASSED', 'WARNING', 'FAILED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveApprovalType" AS ENUM (
    'OPERATIONS', 'KITCHEN', 'FINANCE', 'INTEGRATIONS', 'SUPPORT', 'OWNERSHIP'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveIncidentSeverity" AS ENUM ('INFO', 'WARNING', 'MAJOR', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveIncidentStatus" AS ENUM (
    'OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GoLiveIncidentCategory" AS ENUM (
    'INTEGRATIONS', 'KITCHEN', 'PACKING', 'ROUTES', 'STAFFING',
    'PAYMENTS', 'STOREFRONT', 'ANALYTICS', 'IMPORTS', 'PERMISSIONS', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- go_live_projects
CREATE TABLE IF NOT EXISTS "go_live_projects" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "brand_id" UUID,
  "location_id" UUID,
  "implementation_project_id" UUID,
  "business_type" "BusinessType",
  "current_stage" "GoLiveLaunchStage" NOT NULL DEFAULT 'DISCOVERY',
  "status" "GoLiveLaunchStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "launch_mode" "GoLiveLaunchMode" NOT NULL DEFAULT 'SOFT',
  "risk_level" "GoLiveRiskLevel" NOT NULL DEFAULT 'LOW',
  "readiness_score" INTEGER NOT NULL DEFAULT 0,
  "launch_date" TIMESTAMP(3),
  "go_live_owner_id" UUID,
  "notes" TEXT,
  "metadata_json" JSONB,
  "locked_at" TIMESTAMP(3),
  "live_at" TIMESTAMP(3),
  "monitoring_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "go_live_projects_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "go_live_projects"
    ADD CONSTRAINT "go_live_projects_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_projects"
    ADD CONSTRAINT "go_live_projects_brand_id_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_projects"
    ADD CONSTRAINT "go_live_projects_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_projects"
    ADD CONSTRAINT "go_live_projects_go_live_owner_id_fkey"
    FOREIGN KEY ("go_live_owner_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "go_live_projects_user_status_idx" ON "go_live_projects" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "go_live_projects_user_stage_idx" ON "go_live_projects" ("user_id", "current_stage");
CREATE INDEX IF NOT EXISTS "go_live_projects_user_brand_idx" ON "go_live_projects" ("user_id", "brand_id");
CREATE INDEX IF NOT EXISTS "go_live_projects_user_location_idx" ON "go_live_projects" ("user_id", "location_id");
CREATE INDEX IF NOT EXISTS "go_live_projects_user_launch_idx" ON "go_live_projects" ("user_id", "launch_date");

-- go_live_checklist_items
CREATE TABLE IF NOT EXISTS "go_live_checklist_items" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "stage" "GoLiveLaunchStage" NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "key" VARCHAR(120) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "action_route" VARCHAR(512),
  "required" BOOLEAN NOT NULL DEFAULT FALSE,
  "auto_validated" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" "GoLiveChecklistStatus" NOT NULL DEFAULT 'TODO',
  "blocker_severity" "GoLiveBlockerSeverity",
  "assigned_to_id" UUID,
  "validated_by_id" UUID,
  "validated_at" TIMESTAMP(3),
  "due_at" TIMESTAMP(3),
  "weight" INTEGER NOT NULL DEFAULT 1,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "go_live_checklist_items_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "go_live_checklist_items"
    ADD CONSTRAINT "go_live_checklist_items_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "go_live_projects"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_checklist_items"
    ADD CONSTRAINT "go_live_checklist_items_assigned_to_id_fkey"
    FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_checklist_items"
    ADD CONSTRAINT "go_live_checklist_items_validated_by_id_fkey"
    FOREIGN KEY ("validated_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "go_live_checklist_items_project_key_uniq"
  ON "go_live_checklist_items" ("project_id", "key");
CREATE INDEX IF NOT EXISTS "go_live_checklist_items_project_status_idx"
  ON "go_live_checklist_items" ("project_id", "status");
CREATE INDEX IF NOT EXISTS "go_live_checklist_items_project_stage_idx"
  ON "go_live_checklist_items" ("project_id", "stage");
CREATE INDEX IF NOT EXISTS "go_live_checklist_items_project_required_idx"
  ON "go_live_checklist_items" ("project_id", "required");

-- go_live_simulations
CREATE TABLE IF NOT EXISTS "go_live_simulations" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "simulation_type" "GoLiveSimulationType" NOT NULL,
  "result" "GoLiveSimulationResult" NOT NULL DEFAULT 'PENDING',
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "duration_ms" INTEGER,
  "output_json" JSONB,
  "triggered_by_id" UUID,
  CONSTRAINT "go_live_simulations_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "go_live_simulations"
    ADD CONSTRAINT "go_live_simulations_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "go_live_projects"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_simulations"
    ADD CONSTRAINT "go_live_simulations_triggered_by_id_fkey"
    FOREIGN KEY ("triggered_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "go_live_simulations_project_started_idx"
  ON "go_live_simulations" ("project_id", "started_at");
CREATE INDEX IF NOT EXISTS "go_live_simulations_project_result_idx"
  ON "go_live_simulations" ("project_id", "result");

-- go_live_approvals
CREATE TABLE IF NOT EXISTS "go_live_approvals" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "approval_type" "GoLiveApprovalType" NOT NULL,
  "approved_by_id" UUID NOT NULL,
  "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "metadata_json" JSONB,
  CONSTRAINT "go_live_approvals_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "go_live_approvals"
    ADD CONSTRAINT "go_live_approvals_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "go_live_projects"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_approvals"
    ADD CONSTRAINT "go_live_approvals_approved_by_id_fkey"
    FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "go_live_approvals_project_type_uniq"
  ON "go_live_approvals" ("project_id", "approval_type");
CREATE INDEX IF NOT EXISTS "go_live_approvals_project_idx"
  ON "go_live_approvals" ("project_id");

-- go_live_incidents
CREATE TABLE IF NOT EXISTS "go_live_incidents" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "severity" "GoLiveIncidentSeverity" NOT NULL,
  "category" "GoLiveIncidentCategory" NOT NULL,
  "status" "GoLiveIncidentStatus" NOT NULL DEFAULT 'OPEN',
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "acknowledged_at" TIMESTAMP(3),
  "resolved_at" TIMESTAMP(3),
  "resolution" TEXT,
  "assigned_to_id" UUID,
  "reported_by_id" UUID,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "go_live_incidents_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "go_live_incidents"
    ADD CONSTRAINT "go_live_incidents_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "go_live_projects"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_incidents"
    ADD CONSTRAINT "go_live_incidents_assigned_to_id_fkey"
    FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_incidents"
    ADD CONSTRAINT "go_live_incidents_reported_by_id_fkey"
    FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "go_live_incidents_project_status_idx"
  ON "go_live_incidents" ("project_id", "status");
CREATE INDEX IF NOT EXISTS "go_live_incidents_project_severity_idx"
  ON "go_live_incidents" ("project_id", "severity");
CREATE INDEX IF NOT EXISTS "go_live_incidents_created_idx"
  ON "go_live_incidents" ("created_at");

-- go_live_rollback_plans
CREATE TABLE IF NOT EXISTS "go_live_rollback_plans" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "trigger_condition" TEXT NOT NULL,
  "rollback_steps_json" JSONB NOT NULL,
  "owner_id" UUID,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "go_live_rollback_plans_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "go_live_rollback_plans"
    ADD CONSTRAINT "go_live_rollback_plans_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "go_live_projects"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_rollback_plans"
    ADD CONSTRAINT "go_live_rollback_plans_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "go_live_rollback_plans_project_idx"
  ON "go_live_rollback_plans" ("project_id");

-- go_live_project_events
CREATE TABLE IF NOT EXISTS "go_live_project_events" (
  "id" UUID NOT NULL,
  "project_id" UUID NOT NULL,
  "event_type" VARCHAR(80) NOT NULL,
  "performed_by_id" UUID,
  "summary" VARCHAR(500),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "go_live_project_events_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "go_live_project_events"
    ADD CONSTRAINT "go_live_project_events_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "go_live_projects"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "go_live_project_events"
    ADD CONSTRAINT "go_live_project_events_performed_by_id_fkey"
    FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "go_live_project_events_project_created_idx"
  ON "go_live_project_events" ("project_id", "created_at");
