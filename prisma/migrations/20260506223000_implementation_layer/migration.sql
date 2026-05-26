-- Implementation onboarding layer: additive only.

CREATE TYPE "ImplementationStatus" AS ENUM ('NOT_STARTED', 'DISCOVERY', 'DATA_IMPORT', 'CONFIGURATION', 'STAFF_TRAINING', 'TEST_RUN', 'GO_LIVE', 'COMPLETED', 'BLOCKED');
CREATE TYPE "ImplementationTaskCategory" AS ENUM ('DISCOVERY', 'DATA', 'INTEGRATIONS', 'MENU', 'PRODUCTION', 'PACKING', 'STAFF', 'BILLING', 'LAUNCH');
CREATE TYPE "ImplementationTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');
CREATE TYPE "ImplementationTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ImportType" AS ENUM ('PRODUCTS', 'CUSTOMERS', 'ORDERS', 'INGREDIENTS', 'RECIPES', 'STAFF', 'SUPPLIERS');
CREATE TYPE "ImportStatus" AS ENUM ('UPLOADED', 'MAPPING', 'VALIDATED', 'IMPORTED', 'FAILED', 'CANCELLED');
CREATE TYPE "ProductMappingStatus" AS ENUM ('SUGGESTED', 'CONFIRMED', 'IGNORED', 'NEEDS_REVIEW');
CREATE TYPE "StagedOrderImportStatus" AS ENUM ('READY_TO_IMPORT', 'NEEDS_MAPPING', 'DUPLICATE', 'ERROR');
CREATE TYPE "PartnerAccountStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');
CREATE TYPE "PartnerClientStatus" AS ENUM ('PROSPECT', 'IMPLEMENTING', 'LIVE', 'PAUSED');
CREATE TYPE "WorkspaceType" AS ENUM ('BUSINESS', 'DEMO', 'PARTNER_CLIENT');
CREATE TYPE "WorkspaceMemberRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'PARTNER');
CREATE TYPE "GoLiveTestRunStatus" AS ENUM ('DRAFT', 'PASSED', 'FAILED', 'NEEDS_REVIEW');

CREATE TABLE "implementation_projects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "business_name" VARCHAR(255) NOT NULL,
  "business_type" VARCHAR(120),
  "status" "ImplementationStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "assigned_owner" VARCHAR(255),
  "target_go_live_date" DATE,
  "current_platform" VARCHAR(255),
  "weekly_order_volume" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "implementation_projects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "implementation_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "implementation_tasks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" "ImplementationTaskCategory" NOT NULL,
  "status" "ImplementationTaskStatus" NOT NULL DEFAULT 'TODO',
  "priority" "ImplementationTaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "due_date" DATE,
  "assigned_to" VARCHAR(255),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "implementation_tasks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "implementation_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "import_jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "type" "ImportType" NOT NULL,
  "filename" VARCHAR(512) NOT NULL,
  "status" "ImportStatus" NOT NULL DEFAULT 'UPLOADED',
  "total_rows" INTEGER NOT NULL DEFAULT 0,
  "valid_rows" INTEGER NOT NULL DEFAULT 0,
  "error_rows" INTEGER NOT NULL DEFAULT 0,
  "mapping_json" JSONB,
  "result_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "import_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "import_row_errors" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "import_job_id" UUID NOT NULL,
  "row_number" INTEGER NOT NULL,
  "field" VARCHAR(120),
  "message" TEXT NOT NULL,
  "raw_row_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "import_row_errors_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "import_row_errors_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "import_mapping_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "type" "ImportType" NOT NULL,
  "mapping_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "import_mapping_templates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "import_mapping_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "product_mappings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "provider" VARCHAR(80) NOT NULL,
  "external_product_id" VARCHAR(255) NOT NULL,
  "external_variant_id" VARCHAR(255),
  "external_title" VARCHAR(512) NOT NULL,
  "external_sku" VARCHAR(255),
  "internal_product_id" UUID,
  "confidence" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "status" "ProductMappingStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_mappings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "product_mappings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_mappings_internal_product_id_fkey" FOREIGN KEY ("internal_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "customer_merge_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "primary_customer_id" UUID NOT NULL,
  "merged_customer_ids_json" JSONB NOT NULL,
  "performed_by" VARCHAR(255),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_merge_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customer_merge_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "staged_order_imports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "import_job_id" UUID NOT NULL,
  "row_number" INTEGER NOT NULL,
  "external_ref" VARCHAR(255),
  "status" "StagedOrderImportStatus" NOT NULL DEFAULT 'NEEDS_MAPPING',
  "issue_summary" TEXT,
  "impact_json" JSONB,
  "raw_row_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "staged_order_imports_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "staged_order_imports_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "go_live_test_runs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "status" "GoLiveTestRunStatus" NOT NULL DEFAULT 'DRAFT',
  "result_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "go_live_test_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "go_live_test_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "partner_accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "owner_user_id" UUID NOT NULL,
  "status" "PartnerAccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "partner_accounts_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "partner_clients" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "partner_account_id" UUID NOT NULL,
  "client_user_id" UUID NOT NULL,
  "business_name" VARCHAR(255) NOT NULL,
  "status" "PartnerClientStatus" NOT NULL DEFAULT 'PROSPECT',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_clients_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "partner_clients_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "partner_clients_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "workspaces" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "type" "WorkspaceType" NOT NULL DEFAULT 'BUSINESS',
  "owner_user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "workspaces_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "workspace_members" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "WorkspaceMemberRole" NOT NULL DEFAULT 'STAFF',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "implementation_projects_user_id_idx" ON "implementation_projects"("user_id");
CREATE INDEX "implementation_projects_status_idx" ON "implementation_projects"("status");
CREATE INDEX "implementation_tasks_project_id_idx" ON "implementation_tasks"("project_id");
CREATE INDEX "implementation_tasks_status_idx" ON "implementation_tasks"("status");
CREATE INDEX "implementation_tasks_category_idx" ON "implementation_tasks"("category");
CREATE INDEX "import_jobs_user_id_created_at_idx" ON "import_jobs"("user_id", "created_at");
CREATE INDEX "import_jobs_type_idx" ON "import_jobs"("type");
CREATE INDEX "import_jobs_status_idx" ON "import_jobs"("status");
CREATE INDEX "import_row_errors_import_job_id_idx" ON "import_row_errors"("import_job_id");
CREATE UNIQUE INDEX "import_mapping_templates_user_id_name_type_key" ON "import_mapping_templates"("user_id", "name", "type");
CREATE INDEX "import_mapping_templates_user_id_type_idx" ON "import_mapping_templates"("user_id", "type");
CREATE UNIQUE INDEX "product_mappings_user_id_provider_external_product_id_external_variant_id_key" ON "product_mappings"("user_id", "provider", "external_product_id", "external_variant_id");
CREATE INDEX "product_mappings_user_id_status_idx" ON "product_mappings"("user_id", "status");
CREATE INDEX "product_mappings_internal_product_id_idx" ON "product_mappings"("internal_product_id");
CREATE INDEX "customer_merge_events_user_id_created_at_idx" ON "customer_merge_events"("user_id", "created_at");
CREATE INDEX "customer_merge_events_primary_customer_id_idx" ON "customer_merge_events"("primary_customer_id");
CREATE INDEX "staged_order_imports_import_job_id_status_idx" ON "staged_order_imports"("import_job_id", "status");
CREATE INDEX "go_live_test_runs_user_id_created_at_idx" ON "go_live_test_runs"("user_id", "created_at");
CREATE INDEX "partner_accounts_owner_user_id_idx" ON "partner_accounts"("owner_user_id");
CREATE UNIQUE INDEX "partner_clients_partner_account_id_client_user_id_key" ON "partner_clients"("partner_account_id", "client_user_id");
CREATE INDEX "partner_clients_client_user_id_idx" ON "partner_clients"("client_user_id");
CREATE INDEX "workspaces_owner_user_id_idx" ON "workspaces"("owner_user_id");
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");
CREATE INDEX "workspace_members_user_id_idx" ON "workspace_members"("user_id");
