-- Operations Task Center: extend KitchenTask, add comments / events / templates / dependencies / recurrence.

-- 1. Extend existing enums (additive only).
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'PURCHASING';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'INVENTORY';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'CUSTOMER';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'CATERING';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'EVENT';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'BAR_PREP';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'CAFE_PREP';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'BAKERY_BATCH';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'MAINTENANCE';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'TRAINING';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'IMPLEMENTATION';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'SUPPORT';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'FOLLOW_UP';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'QUALITY_CHECK';
ALTER TYPE "KitchenTaskType" ADD VALUE IF NOT EXISTS 'LABELING';

ALTER TYPE "KitchenTaskStatus" ADD VALUE IF NOT EXISTS 'TODO';
ALTER TYPE "KitchenTaskStatus" ADD VALUE IF NOT EXISTS 'BLOCKED';
ALTER TYPE "KitchenTaskStatus" ADD VALUE IF NOT EXISTS 'WAITING';

ALTER TYPE "KitchenTaskPriority" ADD VALUE IF NOT EXISTS 'NORMAL';
ALTER TYPE "KitchenTaskPriority" ADD VALUE IF NOT EXISTS 'CRITICAL';

-- 2. New enums.
CREATE TYPE "KitchenTaskSource" AS ENUM (
  'MANUAL',
  'PRODUCTION',
  'PACKING',
  'ROUTE',
  'PLAYBOOK',
  'ALERT',
  'IMPLEMENTATION',
  'STORE_FRONT',
  'SALES_CHANNEL',
  'PURCHASING',
  'CUSTOMER',
  'CATERING_QUOTE',
  'CALENDAR_EVENT'
);

CREATE TYPE "KitchenTaskEventType" AS ENUM (
  'CREATED',
  'UPDATED',
  'ASSIGNED',
  'ROLE_ASSIGNED',
  'STARTED',
  'COMPLETED',
  'BLOCKED',
  'UNBLOCKED',
  'RESCHEDULED',
  'CANCELLED',
  'PRIORITY_CHANGED',
  'STATUS_CHANGED',
  'CHECKLIST_ITEM_COMPLETED',
  'CHECKLIST_ITEM_UNCHECKED',
  'COMMENT_ADDED',
  'TEMPLATE_APPLIED',
  'RECURRENCE_GENERATED',
  'DEPENDENCY_ADDED',
  'DEPENDENCY_REMOVED'
);

-- 3. Extend kitchen_tasks.
ALTER TABLE "kitchen_tasks"
  ADD COLUMN IF NOT EXISTS "brand_id" UUID,
  ADD COLUMN IF NOT EXISTS "location_id" UUID,
  ADD COLUMN IF NOT EXISTS "source_type" "KitchenTaskSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS "source_id" UUID,
  ADD COLUMN IF NOT EXISTS "source_label" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "assigned_role" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completed_by_id" UUID,
  ADD COLUMN IF NOT EXISTS "blocked_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "estimated_minutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "actual_minutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "checklist_json" JSONB,
  ADD COLUMN IF NOT EXISTS "tags_json" JSONB,
  ADD COLUMN IF NOT EXISTS "metadata_json" JSONB,
  ADD COLUMN IF NOT EXISTS "recurrence_rule" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "created_by_id" UUID;

CREATE INDEX IF NOT EXISTS "kitchen_tasks_user_id_status_idx"     ON "kitchen_tasks"("user_id", "status");
CREATE INDEX IF NOT EXISTS "kitchen_tasks_assigned_to_id_status_idx" ON "kitchen_tasks"("assigned_to_id", "status");
CREATE INDEX IF NOT EXISTS "kitchen_tasks_due_at_idx"             ON "kitchen_tasks"("due_at");
CREATE INDEX IF NOT EXISTS "kitchen_tasks_task_type_idx"          ON "kitchen_tasks"("task_type");
CREATE INDEX IF NOT EXISTS "kitchen_tasks_source_type_source_id_idx" ON "kitchen_tasks"("source_type", "source_id");
CREATE INDEX IF NOT EXISTS "kitchen_tasks_brand_id_idx"           ON "kitchen_tasks"("brand_id");
CREATE INDEX IF NOT EXISTS "kitchen_tasks_location_id_idx"        ON "kitchen_tasks"("location_id");

ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_location_id_fkey"
  FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kitchen_tasks" ADD CONSTRAINT "kitchen_tasks_completed_by_id_fkey"
  FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. kitchen_task_comments.
CREATE TABLE IF NOT EXISTS "kitchen_task_comments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "author_id" UUID,
    "author_label" VARCHAR(255),
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kitchen_task_comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "kitchen_task_comments_task_id_created_at_idx" ON "kitchen_task_comments"("task_id", "created_at");

ALTER TABLE "kitchen_task_comments" ADD CONSTRAINT "kitchen_task_comments_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "kitchen_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kitchen_task_comments" ADD CONSTRAINT "kitchen_task_comments_author_id_fkey"
  FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. kitchen_task_events.
CREATE TABLE IF NOT EXISTS "kitchen_task_events" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "event_type" "KitchenTaskEventType" NOT NULL,
    "performed_by" VARCHAR(255),
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kitchen_task_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "kitchen_task_events_task_id_created_at_idx" ON "kitchen_task_events"("task_id", "created_at");
CREATE INDEX IF NOT EXISTS "kitchen_task_events_event_type_idx"         ON "kitchen_task_events"("event_type");

ALTER TABLE "kitchen_task_events" ADD CONSTRAINT "kitchen_task_events_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "kitchen_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. kitchen_task_templates.
CREATE TABLE IF NOT EXISTS "kitchen_task_templates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_mode" "BusinessType",
    "title" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "type" "KitchenTaskType" NOT NULL,
    "priority" "KitchenTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_role" VARCHAR(64),
    "checklist_json" JSONB,
    "tags_json" JSONB,
    "estimated_minutes" INTEGER,
    "recurrence_rule" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kitchen_task_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "kitchen_task_templates_user_id_title_key" ON "kitchen_task_templates"("user_id", "title");
CREATE INDEX IF NOT EXISTS "kitchen_task_templates_user_id_active_idx"       ON "kitchen_task_templates"("user_id", "active");
CREATE INDEX IF NOT EXISTS "kitchen_task_templates_business_mode_idx"        ON "kitchen_task_templates"("business_mode");

ALTER TABLE "kitchen_task_templates" ADD CONSTRAINT "kitchen_task_templates_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. kitchen_task_dependencies.
CREATE TABLE IF NOT EXISTS "kitchen_task_dependencies" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "depends_on_task_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kitchen_task_dependencies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "kitchen_task_dependencies_task_id_depends_on_task_id_key" ON "kitchen_task_dependencies"("task_id", "depends_on_task_id");
CREATE INDEX IF NOT EXISTS "kitchen_task_dependencies_depends_on_task_id_idx"                ON "kitchen_task_dependencies"("depends_on_task_id");

ALTER TABLE "kitchen_task_dependencies" ADD CONSTRAINT "kitchen_task_dependencies_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "kitchen_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kitchen_task_dependencies" ADD CONSTRAINT "kitchen_task_dependencies_depends_on_task_id_fkey"
  FOREIGN KEY ("depends_on_task_id") REFERENCES "kitchen_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. kitchen_task_recurrences.
CREATE TABLE IF NOT EXISTS "kitchen_task_recurrences" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "rule" VARCHAR(255) NOT NULL,
    "next_run_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kitchen_task_recurrences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "kitchen_task_recurrences_task_id_key"      ON "kitchen_task_recurrences"("task_id");
CREATE INDEX IF NOT EXISTS "kitchen_task_recurrences_active_next_run_at_idx" ON "kitchen_task_recurrences"("active", "next_run_at");

ALTER TABLE "kitchen_task_recurrences" ADD CONSTRAINT "kitchen_task_recurrences_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "kitchen_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
