-- Training Command Center
-- New enums + tables. Additive only. No legacy training routes touched.

DO $$ BEGIN
  CREATE TYPE "TrainingRoleType" AS ENUM (
    'KITCHEN_STAFF', 'PACKING_STAFF', 'MANAGER', 'DELIVERY_DRIVER',
    'PREP_COOK', 'LINE_COOK', 'EXECUTIVE_CHEF', 'OPERATIONS_MANAGER',
    'INVENTORY_MANAGER', 'CATERING_COORDINATOR', 'CUSTOMER_SUPPORT',
    'ADMIN', 'IMPLEMENTATION_MANAGER', 'GENERAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingModuleType" AS ENUM (
    'ONBOARDING', 'SOP', 'SAFETY', 'KITCHEN', 'PACKING', 'DELIVERY',
    'CATERING', 'MANAGER', 'COMPLIANCE', 'CUSTOMER_SERVICE',
    'SIMULATION', 'DRILL'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingLessonType" AS ENUM (
    'TEXT', 'VIDEO', 'PDF', 'DIAGRAM', 'INTERACTIVE_CHECKLIST',
    'WALKTHROUGH', 'IMAGE_TASK', 'SIMULATION', 'QUIZ', 'SOP_ACK'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingAssignmentStatus" AS ENUM (
    'ASSIGNED', 'IN_PROGRESS', 'NEEDS_REVIEW', 'COMPLETED', 'FAILED', 'WAIVED', 'EXPIRED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingQuestionType" AS ENUM (
    'MULTIPLE_CHOICE', 'TRUE_FALSE', 'IMAGE_RECOGNITION', 'PROCESS_ORDERING',
    'SCENARIO_RESPONSE', 'OPERATIONAL_DECISION', 'PACKING_VERIFICATION',
    'ALLERGEN_IDENTIFICATION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingCertificationType" AS ENUM (
    'KITCHEN_CERTIFIED', 'PACKING_CERTIFIED', 'ROUTE_CERTIFIED',
    'MANAGER_CERTIFIED', 'SAFETY_CERTIFIED', 'CATERING_CERTIFIED',
    'CUSTOMER_SERVICE_CERTIFIED', 'ALLERGEN_CERTIFIED', 'CUSTOM'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingSimulationType" AS ENUM (
    'LUNCH_RUSH', 'DINNER_RUSH', 'CATERING_PREP', 'GHOST_KITCHEN_SPIKE',
    'FAILED_DELIVERY', 'INVENTORY_SHORTAGE', 'ALLERGY_INCIDENT',
    'PACKING_MISMATCH', 'ROUTE_DELAY', 'POS_OUTAGE', 'INTEGRATION_FAILURE',
    'KITCHEN_BOTTLENECK', 'CUSTOM'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingDrillCategory" AS ENUM (
    'ALLERGY', 'FIRE_SAFETY', 'POWER_OUTAGE', 'POS_OUTAGE', 'ROBBERY',
    'INJURY', 'CONTAMINATION', 'EVACUATION', 'CYBER_INCIDENT', 'WEATHER', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TrainingLanguage" AS ENUM ('EN', 'FR', 'ES', 'DE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SOPCategory" AS ENUM (
    'KITCHEN_PREP', 'FOOD_SAFETY', 'ALLERGEN_HANDLING', 'PACKING',
    'DELIVERY', 'CUSTOMER_SERVICE', 'OPENING', 'CLOSING', 'CLEANING',
    'INVENTORY', 'EMERGENCIES', 'CATERING', 'CASH_HANDLING',
    'EQUIPMENT_MAINTENANCE', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SOPStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- training_programs
CREATE TABLE IF NOT EXISTS "training_programs" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "brand_id" UUID,
  "location_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "role_type" "TrainingRoleType" NOT NULL DEFAULT 'GENERAL',
  "difficulty" "TrainingDifficulty" NOT NULL DEFAULT 'BEGINNER',
  "estimated_minutes" INTEGER NOT NULL DEFAULT 30,
  "language" "TrainingLanguage" NOT NULL DEFAULT 'EN',
  "is_onboarding_path" BOOLEAN NOT NULL DEFAULT FALSE,
  "practice_mode_only" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "training_programs"
    ADD CONSTRAINT "training_programs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_programs"
    ADD CONSTRAINT "training_programs_brand_id_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_programs"
    ADD CONSTRAINT "training_programs_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_programs"
    ADD CONSTRAINT "training_programs_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "training_programs_user_slug_uniq" ON "training_programs"("user_id", "slug");
CREATE INDEX IF NOT EXISTS "training_programs_user_role_idx" ON "training_programs"("user_id", "role_type");
CREATE INDEX IF NOT EXISTS "training_programs_user_active_idx" ON "training_programs"("user_id", "active");
CREATE INDEX IF NOT EXISTS "training_programs_user_brand_idx" ON "training_programs"("user_id", "brand_id");
CREATE INDEX IF NOT EXISTS "training_programs_user_location_idx" ON "training_programs"("user_id", "location_id");

-- training_modules
CREATE TABLE IF NOT EXISTS "training_modules" (
  "id" UUID NOT NULL,
  "program_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "module_type" "TrainingModuleType" NOT NULL,
  "content_json" JSONB,
  "simulation_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "quiz_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "required" BOOLEAN NOT NULL DEFAULT TRUE,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_modules_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_modules"
    ADD CONSTRAINT "training_modules_program_id_fkey"
    FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "training_modules_program_slug_uniq" ON "training_modules"("program_id", "slug");
CREATE INDEX IF NOT EXISTS "training_modules_program_order_idx" ON "training_modules"("program_id", "order_index");

-- training_lessons
CREATE TABLE IF NOT EXISTS "training_lessons" (
  "id" UUID NOT NULL,
  "module_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "lesson_type" "TrainingLessonType" NOT NULL,
  "content" TEXT,
  "video_url" VARCHAR(1024),
  "attachment_url" VARCHAR(1024),
  "language" "TrainingLanguage" NOT NULL DEFAULT 'EN',
  "estimated_minutes" INTEGER NOT NULL DEFAULT 10,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "required" BOOLEAN NOT NULL DEFAULT TRUE,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_lessons_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_lessons"
    ADD CONSTRAINT "training_lessons_module_id_fkey"
    FOREIGN KEY ("module_id") REFERENCES "training_modules"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "training_lessons_module_slug_uniq" ON "training_lessons"("module_id", "slug");
CREATE INDEX IF NOT EXISTS "training_lessons_module_order_idx" ON "training_lessons"("module_id", "order_index");

-- training_quizzes
CREATE TABLE IF NOT EXISTS "training_quizzes" (
  "id" UUID NOT NULL,
  "lesson_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "passing_score" INTEGER NOT NULL DEFAULT 80,
  "retry_limit" INTEGER NOT NULL DEFAULT 3,
  "questions_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_quizzes_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_quizzes"
    ADD CONSTRAINT "training_quizzes_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "training_lessons"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_quizzes_lesson_idx" ON "training_quizzes"("lesson_id");

-- training_quiz_attempts
CREATE TABLE IF NOT EXISTS "training_quiz_attempts" (
  "id" UUID NOT NULL,
  "quiz_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "score" INTEGER NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "answers_json" JSONB,
  "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "training_quiz_attempts_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_quiz_attempts"
    ADD CONSTRAINT "training_quiz_attempts_quiz_id_fkey"
    FOREIGN KEY ("quiz_id") REFERENCES "training_quizzes"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_quiz_attempts"
    ADD CONSTRAINT "training_quiz_attempts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_quiz_attempts_quiz_user_idx" ON "training_quiz_attempts"("quiz_id", "user_id");
CREATE INDEX IF NOT EXISTS "training_quiz_attempts_user_attempted_idx" ON "training_quiz_attempts"("user_id", "attempted_at");

-- training_assignments
CREATE TABLE IF NOT EXISTS "training_assignments" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "program_id" UUID NOT NULL,
  "assigned_to_profile_id" UUID,
  "assigned_to_staff_id" UUID,
  "assigned_to_name" VARCHAR(255),
  "assigned_to_email" VARCHAR(255),
  "assigned_by_id" UUID,
  "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "due_at" TIMESTAMP(3),
  "status" "TrainingAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
  "completion_percent" INTEGER NOT NULL DEFAULT 0,
  "practice_mode" BOOLEAN NOT NULL DEFAULT FALSE,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_assignments_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_assignments"
    ADD CONSTRAINT "training_assignments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_assignments"
    ADD CONSTRAINT "training_assignments_program_id_fkey"
    FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_assignments"
    ADD CONSTRAINT "training_assignments_assigned_to_profile_fkey"
    FOREIGN KEY ("assigned_to_profile_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_assignments"
    ADD CONSTRAINT "training_assignments_assigned_to_staff_fkey"
    FOREIGN KEY ("assigned_to_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_assignments"
    ADD CONSTRAINT "training_assignments_assigned_by_fkey"
    FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_assignments_user_status_idx" ON "training_assignments"("user_id", "status");
CREATE INDEX IF NOT EXISTS "training_assignments_user_program_idx" ON "training_assignments"("user_id", "program_id");
CREATE INDEX IF NOT EXISTS "training_assignments_user_profile_idx" ON "training_assignments"("user_id", "assigned_to_profile_id");
CREATE INDEX IF NOT EXISTS "training_assignments_user_staff_idx" ON "training_assignments"("user_id", "assigned_to_staff_id");
CREATE INDEX IF NOT EXISTS "training_assignments_user_due_idx" ON "training_assignments"("user_id", "due_at");

-- training_progress
CREATE TABLE IF NOT EXISTS "training_progress" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "assignment_id" UUID,
  "lesson_id" UUID NOT NULL,
  "trainee_profile_id" UUID,
  "trainee_staff_id" UUID,
  "status" "TrainingProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "progress_percent" INTEGER NOT NULL DEFAULT 0,
  "score" INTEGER,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "practice_mode" BOOLEAN NOT NULL DEFAULT FALSE,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_progress_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_progress"
    ADD CONSTRAINT "training_progress_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_progress"
    ADD CONSTRAINT "training_progress_assignment_fkey"
    FOREIGN KEY ("assignment_id") REFERENCES "training_assignments"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_progress"
    ADD CONSTRAINT "training_progress_lesson_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "training_lessons"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_progress"
    ADD CONSTRAINT "training_progress_trainee_profile_fkey"
    FOREIGN KEY ("trainee_profile_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_progress"
    ADD CONSTRAINT "training_progress_trainee_staff_fkey"
    FOREIGN KEY ("trainee_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_progress_user_status_idx" ON "training_progress"("user_id", "status");
CREATE INDEX IF NOT EXISTS "training_progress_user_lesson_idx" ON "training_progress"("user_id", "lesson_id");
CREATE INDEX IF NOT EXISTS "training_progress_user_assignment_idx" ON "training_progress"("user_id", "assignment_id");
CREATE INDEX IF NOT EXISTS "training_progress_user_trainee_profile_idx" ON "training_progress"("user_id", "trainee_profile_id");
CREATE INDEX IF NOT EXISTS "training_progress_user_trainee_staff_idx" ON "training_progress"("user_id", "trainee_staff_id");

-- training_certifications
CREATE TABLE IF NOT EXISTS "training_certifications" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "program_id" UUID,
  "assignment_id" UUID,
  "certification_type" "TrainingCertificationType" NOT NULL,
  "recipient_profile_id" UUID,
  "recipient_staff_id" UUID,
  "recipient_name" VARCHAR(255),
  "recipient_email" VARCHAR(255),
  "issued_by_id" UUID,
  "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "revoked_reason" TEXT,
  "metadata_json" JSONB,
  CONSTRAINT "training_certifications_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_certifications"
    ADD CONSTRAINT "training_certifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_certifications"
    ADD CONSTRAINT "training_certifications_program_fkey"
    FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_certifications"
    ADD CONSTRAINT "training_certifications_assignment_fkey"
    FOREIGN KEY ("assignment_id") REFERENCES "training_assignments"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_certifications"
    ADD CONSTRAINT "training_certifications_recipient_profile_fkey"
    FOREIGN KEY ("recipient_profile_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_certifications"
    ADD CONSTRAINT "training_certifications_recipient_staff_fkey"
    FOREIGN KEY ("recipient_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_certifications"
    ADD CONSTRAINT "training_certifications_issuer_fkey"
    FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_certifications_user_type_idx" ON "training_certifications"("user_id", "certification_type");
CREATE INDEX IF NOT EXISTS "training_certifications_user_profile_idx" ON "training_certifications"("user_id", "recipient_profile_id");
CREATE INDEX IF NOT EXISTS "training_certifications_user_staff_idx" ON "training_certifications"("user_id", "recipient_staff_id");
CREATE INDEX IF NOT EXISTS "training_certifications_user_expires_idx" ON "training_certifications"("user_id", "expires_at");

-- training_simulations
CREATE TABLE IF NOT EXISTS "training_simulations" (
  "id" UUID NOT NULL,
  "module_id" UUID,
  "user_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "simulation_type" "TrainingSimulationType" NOT NULL,
  "simulation_config_json" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_simulations_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_simulations"
    ADD CONSTRAINT "training_simulations_module_fkey"
    FOREIGN KEY ("module_id") REFERENCES "training_modules"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_simulations"
    ADD CONSTRAINT "training_simulations_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_simulations_user_type_idx" ON "training_simulations"("user_id", "simulation_type");

-- training_simulation_runs
CREATE TABLE IF NOT EXISTS "training_simulation_runs" (
  "id" UUID NOT NULL,
  "simulation_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "run_by_profile_id" UUID,
  "run_by_staff_id" UUID,
  "score" INTEGER,
  "result" "TrainingProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "output_json" JSONB,
  CONSTRAINT "training_simulation_runs_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_simulation_runs"
    ADD CONSTRAINT "training_simulation_runs_simulation_fkey"
    FOREIGN KEY ("simulation_id") REFERENCES "training_simulations"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_simulation_runs"
    ADD CONSTRAINT "training_simulation_runs_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_simulation_runs"
    ADD CONSTRAINT "training_simulation_runs_run_by_profile_fkey"
    FOREIGN KEY ("run_by_profile_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_simulation_runs"
    ADD CONSTRAINT "training_simulation_runs_run_by_staff_fkey"
    FOREIGN KEY ("run_by_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_simulation_runs_sim_started_idx" ON "training_simulation_runs"("simulation_id", "started_at");
CREATE INDEX IF NOT EXISTS "training_simulation_runs_user_result_idx" ON "training_simulation_runs"("user_id", "result");

-- training_incident_drills
CREATE TABLE IF NOT EXISTS "training_incident_drills" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "category" "TrainingDrillCategory" NOT NULL,
  "scenario_json" JSONB NOT NULL,
  "expected_actions_json" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_incident_drills_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_incident_drills"
    ADD CONSTRAINT "training_incident_drills_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_incident_drills_user_category_idx" ON "training_incident_drills"("user_id", "category");

-- sop_documents
CREATE TABLE IF NOT EXISTS "sop_documents" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "brand_id" UUID,
  "location_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "category" "SOPCategory" NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "content" TEXT NOT NULL,
  "summary" TEXT,
  "language" "TrainingLanguage" NOT NULL DEFAULT 'EN',
  "attachment_url" VARCHAR(1024),
  "video_url" VARCHAR(1024),
  "status" "SOPStatus" NOT NULL DEFAULT 'DRAFT',
  "requires_acknowledgement" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by_id" UUID,
  "published_at" TIMESTAMP(3),
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sop_documents_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "sop_documents"
    ADD CONSTRAINT "sop_documents_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "sop_documents"
    ADD CONSTRAINT "sop_documents_brand_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "sop_documents"
    ADD CONSTRAINT "sop_documents_location_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "sop_documents"
    ADD CONSTRAINT "sop_documents_created_by_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "sop_documents_user_slug_version_uniq" ON "sop_documents"("user_id", "slug", "version");
CREATE INDEX IF NOT EXISTS "sop_documents_user_category_idx" ON "sop_documents"("user_id", "category");
CREATE INDEX IF NOT EXISTS "sop_documents_user_status_idx" ON "sop_documents"("user_id", "status");
CREATE INDEX IF NOT EXISTS "sop_documents_user_brand_idx" ON "sop_documents"("user_id", "brand_id");
CREATE INDEX IF NOT EXISTS "sop_documents_user_location_idx" ON "sop_documents"("user_id", "location_id");

-- sop_acknowledgements
CREATE TABLE IF NOT EXISTS "sop_acknowledgements" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "sop_id" UUID NOT NULL,
  "acknowledged_profile_id" UUID,
  "acknowledged_staff_id" UUID,
  "acknowledged_name" VARCHAR(255),
  "acknowledged_email" VARCHAR(255),
  "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  CONSTRAINT "sop_acknowledgements_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "sop_acknowledgements"
    ADD CONSTRAINT "sop_acknowledgements_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "sop_acknowledgements"
    ADD CONSTRAINT "sop_acknowledgements_sop_fkey"
    FOREIGN KEY ("sop_id") REFERENCES "sop_documents"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "sop_acknowledgements"
    ADD CONSTRAINT "sop_acknowledgements_profile_fkey"
    FOREIGN KEY ("acknowledged_profile_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "sop_acknowledgements"
    ADD CONSTRAINT "sop_acknowledgements_staff_fkey"
    FOREIGN KEY ("acknowledged_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "sop_acknowledgements_user_sop_idx" ON "sop_acknowledgements"("user_id", "sop_id");
CREATE INDEX IF NOT EXISTS "sop_acknowledgements_user_profile_idx" ON "sop_acknowledgements"("user_id", "acknowledged_profile_id");
CREATE INDEX IF NOT EXISTS "sop_acknowledgements_user_staff_idx" ON "sop_acknowledgements"("user_id", "acknowledged_staff_id");

-- training_events
CREATE TABLE IF NOT EXISTS "training_events" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "event_type" VARCHAR(80) NOT NULL,
  "program_id" UUID,
  "assignment_id" UUID,
  "performed_by_id" UUID,
  "summary" VARCHAR(500),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "training_events_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "training_events"
    ADD CONSTRAINT "training_events_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "training_events"
    ADD CONSTRAINT "training_events_actor_fkey"
    FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "training_events_user_created_idx" ON "training_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "training_events_user_type_idx" ON "training_events"("user_id", "event_type");
