-- Scale readiness foundations. Additive/backward-compatible.

CREATE TYPE "OrganizationType" AS ENUM ('CUSTOMER', 'PARTNER', 'INTERNAL');
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'KITCHEN_LEAD', 'KITCHEN_STAFF', 'PACKING_STAFF', 'DELIVERY_STAFF', 'ACCOUNTANT', 'VIEWER', 'PARTNER_CONSULTANT');
CREATE TYPE "AdvisoryBoardApplicationStatus" AS ENUM ('NEW', 'REVIEWED', 'ACCEPTED', 'DECLINED');

CREATE TABLE "organizations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "type" "OrganizationType" NOT NULL DEFAULT 'CUSTOMER',
  "owner_user_id" UUID NOT NULL,
  "plan" "SubscriptionPlan" NOT NULL DEFAULT 'STARTER',
  "status" "OrganizationStatus" NOT NULL DEFAULT 'TRIAL',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "organizations_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "organization_members" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "OrganizationMemberRole" NOT NULL DEFAULT 'VIEWER',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "workspaces" ADD COLUMN "organization_id" UUID;
ALTER TABLE "workspaces" ADD COLUMN "brand_name" VARCHAR(255);
ALTER TABLE "workspaces" ADD COLUMN "location_name" VARCHAR(255);
ALTER TABLE "workspaces" ADD COLUMN "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC';
ALTER TABLE "workspaces" ADD COLUMN "currency" VARCHAR(8) NOT NULL DEFAULT 'USD';
ALTER TABLE "workspaces" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "workspace_members" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "brands" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "logo_url" TEXT,
  "brand_color" VARCHAR(32),
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "brands_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "brands_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "menus" ADD COLUMN "brand_id" UUID;
ALTER TABLE "products" ADD COLUMN "brand_id" UUID;
ALTER TABLE "orders" ADD COLUMN "brand_id" UUID;
ALTER TABLE "storefront_settings" ADD COLUMN "brand_id" UUID;
ALTER TABLE "integration_connections" ADD COLUMN "brand_id" UUID;

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID,
  "workspace_id" UUID,
  "user_id" UUID,
  "action" VARCHAR(120) NOT NULL,
  "entity_type" VARCHAR(120) NOT NULL,
  "entity_id" VARCHAR(255),
  "metadata_json" JSONB,
  "ip_address" VARCHAR(120),
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "partner_members" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "partner_account_id" UUID NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "role" VARCHAR(120) NOT NULL DEFAULT 'consultant',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "partner_members_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "partner_referrals" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "partner_account_id" UUID NOT NULL,
  "partner_client_id" UUID,
  "referral_code" VARCHAR(120) NOT NULL,
  "source" VARCHAR(120),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "partner_referrals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "partner_referrals_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "partner_referrals_partner_client_id_fkey" FOREIGN KEY ("partner_client_id") REFERENCES "partner_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "partner_commission_placeholders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "partner_account_id" UUID NOT NULL,
  "partner_client_id" UUID,
  "amount_cents" INTEGER NOT NULL DEFAULT 0,
  "status" VARCHAR(80) NOT NULL DEFAULT 'placeholder',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "partner_commission_placeholders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "partner_commission_placeholders_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "partner_commission_placeholders_partner_client_id_fkey" FOREIGN KEY ("partner_client_id") REFERENCES "partner_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "implementation_stakeholders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "role" VARCHAR(120),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "implementation_stakeholders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "implementation_stakeholders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "implementation_waves" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "target_date" DATE,
  "locations_json" JSONB,
  "status" VARCHAR(80) NOT NULL DEFAULT 'planned',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "implementation_waves_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "implementation_waves_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "implementation_risks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "severity" VARCHAR(80) NOT NULL DEFAULT 'medium',
  "mitigation" TEXT,
  "status" VARCHAR(80) NOT NULL DEFAULT 'open',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "implementation_risks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "implementation_risks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "implementation_signoffs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "signed_by" VARCHAR(255),
  "signed_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "implementation_signoffs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "implementation_signoffs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "implementation_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "advisory_board_applications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "full_name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "business_name" VARCHAR(255) NOT NULL,
  "business_type" VARCHAR(120),
  "website" VARCHAR(512),
  "weekly_order_volume" VARCHAR(120),
  "why_interested" TEXT,
  "status" "AdvisoryBoardApplicationStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "advisory_board_applications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "advisory_board_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "menus" ADD CONSTRAINT "menus_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "storefront_settings" ADD CONSTRAINT "storefront_settings_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX "organizations_owner_user_id_idx" ON "organizations"("owner_user_id");
CREATE INDEX "organizations_status_idx" ON "organizations"("status");
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");
CREATE INDEX "organization_members_user_id_idx" ON "organization_members"("user_id");
CREATE INDEX "workspaces_organization_id_idx" ON "workspaces"("organization_id");
CREATE UNIQUE INDEX "brands_workspace_id_slug_key" ON "brands"("workspace_id", "slug");
CREATE INDEX "brands_workspace_id_idx" ON "brands"("workspace_id");
CREATE INDEX "menus_brand_id_idx" ON "menus"("brand_id");
CREATE INDEX "products_brand_id_idx" ON "products"("brand_id");
CREATE INDEX "orders_brand_id_idx" ON "orders"("brand_id");
CREATE INDEX "storefront_settings_brand_id_idx" ON "storefront_settings"("brand_id");
CREATE INDEX "integration_connections_brand_id_idx" ON "integration_connections"("brand_id");
CREATE INDEX "audit_logs_organization_id_created_at_idx" ON "audit_logs"("organization_id", "created_at");
CREATE INDEX "audit_logs_workspace_id_created_at_idx" ON "audit_logs"("workspace_id", "created_at");
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE UNIQUE INDEX "partner_members_partner_account_id_email_key" ON "partner_members"("partner_account_id", "email");
CREATE INDEX "partner_referrals_partner_account_id_idx" ON "partner_referrals"("partner_account_id");
CREATE INDEX "partner_referrals_partner_client_id_idx" ON "partner_referrals"("partner_client_id");
CREATE INDEX "partner_commission_placeholders_partner_account_id_idx" ON "partner_commission_placeholders"("partner_account_id");
CREATE INDEX "partner_commission_placeholders_partner_client_id_idx" ON "partner_commission_placeholders"("partner_client_id");
CREATE INDEX "implementation_stakeholders_project_id_idx" ON "implementation_stakeholders"("project_id");
CREATE INDEX "implementation_waves_project_id_idx" ON "implementation_waves"("project_id");
CREATE INDEX "implementation_risks_project_id_idx" ON "implementation_risks"("project_id");
CREATE INDEX "implementation_signoffs_project_id_idx" ON "implementation_signoffs"("project_id");
CREATE INDEX "advisory_board_applications_status_created_at_idx" ON "advisory_board_applications"("status", "created_at");

-- Backfill default organizations/workspaces without migrating old tenant data.
INSERT INTO "organizations" ("id", "name", "slug", "owner_user_id", "plan", "status", "updated_at")
SELECT gen_random_uuid(), COALESCE(u."company_name", u."full_name", u."email"), 'org-' || replace(u."id"::text, '-', ''), u."id", COALESCE(s."plan", 'STARTER'::"SubscriptionPlan"), 'TRIAL', CURRENT_TIMESTAMP
FROM "users" u
LEFT JOIN "subscriptions" s ON s."user_id" = u."id"
ON CONFLICT ("slug") DO NOTHING;

UPDATE "workspaces" w
SET "organization_id" = o."id"
FROM "organizations" o
WHERE w."owner_user_id" = o."owner_user_id" AND w."organization_id" IS NULL;

INSERT INTO "workspaces" ("id", "organization_id", "name", "type", "owner_user_id", "updated_at")
SELECT gen_random_uuid(), o."id", o."name", 'BUSINESS', o."owner_user_id", CURRENT_TIMESTAMP
FROM "organizations" o
WHERE NOT EXISTS (SELECT 1 FROM "workspaces" w WHERE w."owner_user_id" = o."owner_user_id");

INSERT INTO "organization_members" ("id", "organization_id", "user_id", "role", "updated_at")
SELECT gen_random_uuid(), o."id", o."owner_user_id", 'OWNER', CURRENT_TIMESTAMP
FROM "organizations" o
ON CONFLICT ("organization_id", "user_id") DO NOTHING;

INSERT INTO "workspace_members" ("id", "workspace_id", "user_id", "role", "updated_at")
SELECT gen_random_uuid(), w."id", w."owner_user_id", 'OWNER', CURRENT_TIMESTAMP
FROM "workspaces" w
ON CONFLICT ("workspace_id", "user_id") DO NOTHING;
