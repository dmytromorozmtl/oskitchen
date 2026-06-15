-- Staff Workforce Management Center
-- Additive only. Existing `staff_members` rows retain all current columns.

DO $$ BEGIN
  CREATE TYPE "StaffRoleType" AS ENUM (
    'OWNER', 'MANAGER', 'KITCHEN_LEAD', 'PREP_COOK', 'LINE_COOK',
    'PACKER', 'DRIVER', 'CUSTOMER_SERVICE', 'CATERING_COORDINATOR',
    'PURCHASING', 'INVENTORY', 'ACCOUNTING', 'MARKETING', 'VIEWER', 'CUSTOM'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StaffStatus" AS ENUM (
    'ACTIVE', 'INVITED', 'TRAINING', 'PAUSED', 'INACTIVE', 'ARCHIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StaffEmploymentType" AS ENUM (
    'FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'SEASONAL', 'VOLUNTEER', 'CUSTOM'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StaffShiftStatus" AS ENUM (
    'SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StaffCertificationStatus" AS ENUM (
    'PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- staff_members: additive columns
ALTER TABLE "staff_members"
  ADD COLUMN IF NOT EXISTS "linked_user_id" UUID,
  ADD COLUMN IF NOT EXISTS "phone" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "role_type" "StaffRoleType" NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN IF NOT EXISTS "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "employment_type" "StaffEmploymentType" NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN IF NOT EXISTS "brand_id" UUID,
  ADD COLUMN IF NOT EXISTS "location_id" UUID,
  ADD COLUMN IF NOT EXISTS "custom_role_id" UUID,
  ADD COLUMN IF NOT EXISTS "departments_json" JSONB,
  ADD COLUMN IF NOT EXISTS "permissions_json" JSONB,
  ADD COLUMN IF NOT EXISTS "availability_json" JSONB,
  ADD COLUMN IF NOT EXISTS "emergency_contact_json" JSONB,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "invited_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "archived_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "staff_members"
    ADD CONSTRAINT "staff_members_linked_user_fkey"
    FOREIGN KEY ("linked_user_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_members"
    ADD CONSTRAINT "staff_members_brand_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_members"
    ADD CONSTRAINT "staff_members_location_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "staff_members_user_status_idx" ON "staff_members"("user_id", "status");
CREATE INDEX IF NOT EXISTS "staff_members_user_role_type_idx" ON "staff_members"("user_id", "role_type");
CREATE INDEX IF NOT EXISTS "staff_members_user_location_idx" ON "staff_members"("user_id", "location_id");
CREATE INDEX IF NOT EXISTS "staff_members_user_brand_idx" ON "staff_members"("user_id", "brand_id");
CREATE INDEX IF NOT EXISTS "staff_members_user_linked_idx" ON "staff_members"("user_id", "linked_user_id");
CREATE INDEX IF NOT EXISTS "staff_members_user_email_idx" ON "staff_members"("user_id", "email");

-- staff_roles
CREATE TABLE IF NOT EXISTS "staff_roles" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "key" VARCHAR(80) NOT NULL,
  "label" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "permissions_json" JSONB,
  "system_role" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "staff_roles_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "staff_roles"
    ADD CONSTRAINT "staff_roles_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "staff_roles_user_key_uniq" ON "staff_roles"("user_id", "key");
CREATE INDEX IF NOT EXISTS "staff_roles_user_active_idx" ON "staff_roles"("user_id", "active");

DO $$ BEGIN
  ALTER TABLE "staff_members"
    ADD CONSTRAINT "staff_members_custom_role_fkey"
    FOREIGN KEY ("custom_role_id") REFERENCES "staff_roles"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- staff_availability
CREATE TABLE IF NOT EXISTS "staff_availability" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "staff_member_id" UUID NOT NULL,
  "day_of_week" INTEGER NOT NULL,
  "start_time" VARCHAR(10) NOT NULL,
  "end_time" VARCHAR(10) NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT TRUE,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "staff_availability_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "staff_availability"
    ADD CONSTRAINT "staff_availability_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_availability"
    ADD CONSTRAINT "staff_availability_member_fkey"
    FOREIGN KEY ("staff_member_id") REFERENCES "staff_members"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "staff_availability_user_member_idx" ON "staff_availability"("user_id", "staff_member_id");
CREATE INDEX IF NOT EXISTS "staff_availability_user_day_idx" ON "staff_availability"("user_id", "day_of_week");

-- staff_shifts
CREATE TABLE IF NOT EXISTS "staff_shifts" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "staff_member_id" UUID NOT NULL,
  "location_id" UUID,
  "brand_id" UUID,
  "role" "StaffRoleType" NOT NULL DEFAULT 'CUSTOM',
  "role_label" VARCHAR(160),
  "shift_date" DATE NOT NULL,
  "start_time" VARCHAR(10) NOT NULL,
  "end_time" VARCHAR(10) NOT NULL,
  "status" "StaffShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,
  "checked_in_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "staff_shifts_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "staff_shifts"
    ADD CONSTRAINT "staff_shifts_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_shifts"
    ADD CONSTRAINT "staff_shifts_member_fkey"
    FOREIGN KEY ("staff_member_id") REFERENCES "staff_members"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_shifts"
    ADD CONSTRAINT "staff_shifts_location_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_shifts"
    ADD CONSTRAINT "staff_shifts_brand_fkey"
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "staff_shifts_user_member_idx" ON "staff_shifts"("user_id", "staff_member_id");
CREATE INDEX IF NOT EXISTS "staff_shifts_user_date_idx" ON "staff_shifts"("user_id", "shift_date");
CREATE INDEX IF NOT EXISTS "staff_shifts_user_status_idx" ON "staff_shifts"("user_id", "status");
CREATE INDEX IF NOT EXISTS "staff_shifts_user_location_idx" ON "staff_shifts"("user_id", "location_id");

-- staff_certifications
CREATE TABLE IF NOT EXISTS "staff_certifications" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "staff_member_id" UUID NOT NULL,
  "certification_type" VARCHAR(120) NOT NULL,
  "status" "StaffCertificationStatus" NOT NULL DEFAULT 'ACTIVE',
  "issued_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "source_training_id" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "staff_certifications_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "staff_certifications"
    ADD CONSTRAINT "staff_certifications_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_certifications"
    ADD CONSTRAINT "staff_certifications_member_fkey"
    FOREIGN KEY ("staff_member_id") REFERENCES "staff_members"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "staff_certifications_user_member_idx" ON "staff_certifications"("user_id", "staff_member_id");
CREATE INDEX IF NOT EXISTS "staff_certifications_user_status_idx" ON "staff_certifications"("user_id", "status");
CREATE INDEX IF NOT EXISTS "staff_certifications_user_expires_idx" ON "staff_certifications"("user_id", "expires_at");

-- staff_events
CREATE TABLE IF NOT EXISTS "staff_events" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "staff_member_id" UUID,
  "event_type" VARCHAR(80) NOT NULL,
  "performed_by_id" UUID,
  "summary" VARCHAR(500),
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "staff_events_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "staff_events"
    ADD CONSTRAINT "staff_events_user_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_events"
    ADD CONSTRAINT "staff_events_member_fkey"
    FOREIGN KEY ("staff_member_id") REFERENCES "staff_members"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "staff_events"
    ADD CONSTRAINT "staff_events_actor_fkey"
    FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "staff_events_user_created_idx" ON "staff_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "staff_events_user_member_idx" ON "staff_events"("user_id", "staff_member_id");
CREATE INDEX IF NOT EXISTS "staff_events_user_type_idx" ON "staff_events"("user_id", "event_type");
